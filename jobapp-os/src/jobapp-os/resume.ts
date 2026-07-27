import fs from "node:fs/promises";
import path from "node:path";

export async function readResumeText(resumeTextPath: string): Promise<string> {
  const raw = await fs.readFile(resumeTextPath, "utf8");
  return raw.trim();
}

export async function extractResumeTextFromPdf(pdfPath: string): Promise<string> {
  const absolute = path.isAbsolute(pdfPath) ? pdfPath : path.join(process.cwd(), pdfPath);
  const buffer = await fs.readFile(absolute);
  // pdf-parse is CJS; dynamic import keeps TS happy in a CJS build.
  const mod = (await import("pdf-parse")) as unknown as {
    default: (data: Buffer) => Promise<{ text: string }>;
  };
  const parsed = await mod.default(buffer);
  return parsed.text.trim();
}

