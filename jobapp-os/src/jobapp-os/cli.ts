import path from "node:path";
import process from "node:process";
import { readJsonFile, writeJsonFile } from "./io";
import { resolveDataDir } from "./paths";
import { buildLinkedInJobsSearchUrl, makeLead } from "./linkedin";
import { addLeads, loadQueue, saveQueue } from "./queue";
import { JobappConfig } from "./types";

type Command =
  | { kind: "open-search" }
  | { kind: "add-url"; url: string }
  | { kind: "list" }
  | { kind: "gen-notes" }
  | { kind: "extract-resume" }
  | { kind: "assist-apply"; url: string }
  | { kind: "metric-add"; label: string; value: string; context?: string }
  | { kind: "bullet-add"; label: string; text: string }
  | { kind: "pipeline-add"; company: string; role: string; url?: string; status: string; notes?: string }
  | { kind: "pipeline-status"; id: string; status: string }
  | { kind: "pipeline-stats" };

function parseArgs(argv: string[]): Command {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === "open-search") return { kind: "open-search" };
  if (cmd === "add-url") {
    const url = rest[0];
    if (!url) throw new Error("Missing URL. Usage: jobapp add-url <linkedin-job-url>");
    return { kind: "add-url", url };
  }
  if (cmd === "list") return { kind: "list" };
  if (cmd === "gen-notes") return { kind: "gen-notes" };
  if (cmd === "extract-resume") return { kind: "extract-resume" };
  if (cmd === "assist-apply") {
    const url = rest[0];
    if (!url) throw new Error("Missing URL. Usage: jobapp assist-apply <ats-url>");
    return { kind: "assist-apply", url };
  }
  if (cmd === "metric-add") {
    const label = rest[0];
    const value = rest[1];
    const context = rest.slice(2).join(" ").trim() || undefined;
    if (!label || !value) throw new Error("Usage: jobapp metric-add <label> <value> [context]");
    return { kind: "metric-add", label, value, context };
  }
  if (cmd === "bullet-add") {
    const label = rest[0];
    const text = rest.slice(1).join(" ").trim();
    if (!label || !text) throw new Error("Usage: jobapp bullet-add <label> <text...>");
    return { kind: "bullet-add", label, text };
  }
  if (cmd === "pipeline-add") {
    const company = rest[0];
    const role = rest[1];
    const url = rest[2];
    const status = rest[3] ?? "queued";
    const notes = rest.slice(4).join(" ").trim() || undefined;
    if (!company || !role) throw new Error("Usage: jobapp pipeline-add <company> <role> [url] [status] [notes]");
    return { kind: "pipeline-add", company, role, url, status, notes };
  }
  if (cmd === "pipeline-status") {
    const id = rest[0];
    const status = rest[1];
    if (!id || !status) throw new Error("Usage: jobapp pipeline-status <id> <status>");
    return { kind: "pipeline-status", id, status };
  }
  if (cmd === "pipeline-stats") return { kind: "pipeline-stats" };
  throw new Error(`Unknown command: ${cmd}`);
}

async function loadConfig(): Promise<JobappConfig> {
  const configPath = path.join(process.cwd(), "src/jobapp-os/config.json");
  return readJsonFile<JobappConfig>(configPath);
}

async function main(): Promise<void> {
  const command = parseArgs(process.argv.slice(2));
  const config = await loadConfig();
  const dataDir = resolveDataDir(config.output.dataDir);

  if (command.kind === "open-search") {
    const url = buildLinkedInJobsSearchUrl(config);
    console.log(url);
    return;
  }

  if (command.kind === "add-url") {
    const queue = await loadQueue(dataDir);
    const updated = addLeads(queue, [makeLead(command.url)]);
    await saveQueue(dataDir, updated);
    console.log(`Added. Queue size: ${updated.leads.length}`);
    return;
  }

  if (command.kind === "list") {
    const queue = await loadQueue(dataDir);
    for (const lead of queue.leads) console.log(lead.url);
    return;
  }

  if (command.kind === "gen-notes") {
    const queue = await loadQueue(dataDir);
    const { buildLeadNotes, writeLeadNotes } = await import("./notes");
    let resumeText: string | undefined;
    if (config.resume?.resumeTextPath) {
      try {
        const { readResumeText } = await import("./resume");
        resumeText = await readResumeText(config.resume.resumeTextPath);
      } catch {
        resumeText = undefined;
      }
    }

    for (const lead of queue.leads) {
      const notes = buildLeadNotes(lead, resumeText);
      await writeLeadNotes(dataDir, lead, notes);
    }
    console.log(`Wrote notes for ${queue.leads.length} lead(s) into ${path.join(dataDir, "leads")}`);
    return;
  }

  if (command.kind === "extract-resume") {
    if (!config.resume?.resumePdfPath || !config.resume?.resumeTextPath) {
      throw new Error("Missing resume config. Set resume.resumePdfPath and resume.resumeTextPath in src/jobapp-os/config.json");
    }
    const { extractResumeTextFromPdf } = await import("./resume");
    const resumeText = await extractResumeTextFromPdf(config.resume.resumePdfPath);
    await writeJsonFile(path.join(dataDir, "resume-extract.json"), {
      at: new Date().toISOString(),
      sourcePdfPath: config.resume.resumePdfPath,
      chars: resumeText.length
    });
    // Write plain text to the configured resumeTextPath (relative to repo root).
    const fs = await import("node:fs/promises");
    await fs.mkdir(path.dirname(config.resume.resumeTextPath), { recursive: true });
    await fs.writeFile(config.resume.resumeTextPath, resumeText + "\n", "utf8");
    console.log(`Extracted resume text to ${config.resume.resumeTextPath}`);
    return;
  }

  if (command.kind === "assist-apply") {
    if (config.safety.linkedinAutomationMode !== "manual_assist") {
      throw new Error("Refusing to run apply assist unless safety.linkedinAutomationMode is manual_assist.");
    }
    const { runApplyAssist } = await import("./apply-assist");
    await runApplyAssist(config, command.url);
    return;
  }

  if (command.kind === "metric-add") {
    const { addMetric } = await import("./profile-store");
    const metric = await addMetric(dataDir, {
      label: command.label,
      value: command.value,
      context: command.context
    });
    console.log(`Added metric ${metric.id}`);
    return;
  }

  if (command.kind === "bullet-add") {
    const { addBullet } = await import("./profile-store");
    const bullet = await addBullet(dataDir, { label: command.label, text: command.text });
    console.log(`Added bullet ${bullet.id}`);
    return;
  }

  if (command.kind === "pipeline-add") {
    const { addApplication } = await import("./pipeline-store");
    const app = await addApplication(dataDir, {
      company: command.company,
      role: command.role,
      url: command.url,
      status: command.status as never,
      notes: command.notes
    });
    console.log(`Added application ${app.id}`);
    return;
  }

  if (command.kind === "pipeline-status") {
    const { updateApplicationStatus } = await import("./pipeline-store");
    const app = await updateApplicationStatus(dataDir, command.id, command.status as never);
    console.log(`Updated ${app.id} -> ${app.status}`);
    return;
  }

  if (command.kind === "pipeline-stats") {
    const { loadPipeline, stats } = await import("./pipeline-store");
    const file = await loadPipeline(dataDir);
    const counts = stats(file);
    for (const [status, count] of Object.entries(counts)) console.log(`${status}: ${count}`);
    console.log(`total: ${file.applications.length}`);
  }
}

main().catch(async (err) => {
  console.error(String(err?.stack ?? err));
  // Write a small crash log to help debugging in this workspace.
  try {
    await writeJsonFile("data/jobapp-os/last-error.json", {
      at: new Date().toISOString(),
      error: String(err?.stack ?? err)
    });
  } catch {
    // ignore
  }
  process.exitCode = 1;
});
