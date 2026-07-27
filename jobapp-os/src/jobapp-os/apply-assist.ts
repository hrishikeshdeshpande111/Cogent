import readline from "node:readline/promises";
import process from "node:process";
import path from "node:path";
import { chromium, Page } from "playwright";
import { JobappConfig } from "./types";

type Field = {
  selector: string;
  label: string;
  kind: "text" | "textarea" | "select" | "file";
  requiredGuess: boolean;
};

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

async function guessFields(page: Page): Promise<Field[]> {
  return page.evaluate(() => {
    function text(el: Element | null | undefined): string {
      if (!el) return "";
      return (el.textContent ?? "").replace(/\s+/g, " ").trim();
    }

    function labelFor(input: HTMLElement): string {
      const id = input.getAttribute("id");
      if (id) {
        const explicit = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        const t = text(explicit);
        if (t) return t;
      }
      const aria = input.getAttribute("aria-label") || input.getAttribute("name") || "";
      if (aria) return aria;
      const wrapped = input.closest("label");
      const wt = text(wrapped);
      if (wt) return wt;
      const near = input.closest("[data-qa], [data-testid], .field, .form-field, .application-field");
      const nt = text(near?.querySelector("label, .label, .field-label, [data-qa*=label]") ?? null);
      return nt || input.getAttribute("placeholder") || input.getAttribute("name") || "(unlabeled field)";
    }

    function requiredGuess(el: HTMLElement): boolean {
      if ((el as HTMLInputElement).required) return true;
      const ariaReq = el.getAttribute("aria-required");
      if (ariaReq === "true") return true;
      const container = el.closest("[class*='required'], [data-required='true']");
      if (container) return true;
      const label = labelFor(el);
      return /(\*|required)/i.test(label);
    }

    const fields: Array<{ selector: string; label: string; kind: "text" | "textarea" | "select" | "file"; requiredGuess: boolean }> =
      [];

    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("input, textarea, select"));
    for (const el of inputs) {
      const tag = el.tagName.toLowerCase();
      const type = (el as HTMLInputElement).type?.toLowerCase?.() ?? "";
      const disabled = (el as HTMLInputElement).disabled;
      const hidden = (el as HTMLInputElement).type === "hidden" || el.getAttribute("aria-hidden") === "true";
      if (disabled || hidden) continue;

      let kind: "text" | "textarea" | "select" | "file" = "text";
      if (tag === "textarea") kind = "textarea";
      else if (tag === "select") kind = "select";
      else if (tag === "input" && type === "file") kind = "file";
      else kind = "text";

      const label = labelFor(el as unknown as HTMLElement);

      // Skip non-user inputs (heuristic).
      if (tag === "input" && ["submit", "button", "reset", "image", "checkbox", "radio"].includes(type)) continue;

      // Build a selector we can use later (best-effort).
      const id = el.getAttribute("id");
      const name = el.getAttribute("name");
      const dataQa = el.getAttribute("data-qa");
      const dataTestId = el.getAttribute("data-testid");
      let selector = "";
      if (id) selector = `#${CSS.escape(id)}`;
      else if (dataTestId) selector = `[data-testid="${CSS.escape(dataTestId)}"]`;
      else if (dataQa) selector = `[data-qa="${CSS.escape(dataQa)}"]`;
      else if (name) selector = `${tag}[name="${CSS.escape(name)}"]`;
      else selector = tag;

      fields.push({
        selector,
        label,
        kind,
        requiredGuess: requiredGuess(el as unknown as HTMLElement)
      });
    }

    // De-dupe selectors.
    const seen = new Set<string>();
    return fields.filter((f) => {
      if (seen.has(f.selector)) return false;
      seen.add(f.selector);
      return true;
    });
  });
}

function shouldSkipField(label: string): boolean {
  const l = label.toLowerCase();
  // Avoid auto-filling authentication / sensitive fields.
  if (l.includes("password")) return true;
  if (l.includes("social security")) return true;
  if (l.includes("ssn")) return true;
  if (l.includes("credit card")) return true;
  if (l.includes("bank account")) return true;
  return false;
}

function isResumeUploadLabel(label: string): boolean {
  const l = label.toLowerCase();
  return l.includes("resume") || l.includes("cv");
}

export async function runApplyAssist(config: JobappConfig, url: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Opening:", url);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    console.log("If the page requires login/CAPTCHA, complete it in the browser now.");
    await rl.question("Press Enter when the application form is visible...");

    const fields = await guessFields(page);
    console.log(`Found ${fields.length} input(s). I will prompt you for values and fill them, but I will NOT click submit.`);

    const resumePdfPath = config.resume?.resumePdfPath
      ? path.isAbsolute(config.resume.resumePdfPath)
        ? config.resume.resumePdfPath
        : path.join(process.cwd(), config.resume.resumePdfPath)
      : undefined;

    for (const field of fields) {
      const label = normalize(field.label);
      if (shouldSkipField(label)) continue;

      if (field.kind === "file" && resumePdfPath && isResumeUploadLabel(label)) {
        try {
          const locator = page.locator(field.selector).first();
          await locator.setInputFiles(resumePdfPath);
          console.log(`Uploaded resume PDF for: ${label}`);
        } catch {
          // If upload fails, let the user handle it.
          console.log(`Could not auto-upload resume for: ${label} (please upload manually).`);
        }
        continue;
      }

      // If not required, ask if they want to fill it.
      const required = field.requiredGuess ? " (required?)" : "";
      const answer = await rl.question(`Value for "${label}"${required} (leave blank to skip): `);
      if (!answer.trim()) continue;

      const locator = page.locator(field.selector).first();
      try {
        if (field.kind === "select") {
          await locator.selectOption({ label: answer });
        } else {
          await locator.fill(answer);
        }
      } catch {
        console.log(`Could not fill "${label}" automatically. You may need to paste it manually.`);
      }
    }

    console.log("Done filling best-effort. Please review everything in the browser.");
    console.log("I will not submit. When ready, you click Submit yourself.");
    await rl.question("Press Enter to close the assistant (browser will close)...");
  } finally {
    rl.close();
    await context.close();
    await browser.close();
  }
}

