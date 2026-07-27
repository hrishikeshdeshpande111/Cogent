import path from "node:path";
import { JobLead } from "./types";
import { ensureDir, writeJsonFile } from "./io";

export type LeadNotes = {
  url: string;
  createdAt: string;
  checklist: string[];
  prompts: string[];
};

export function leadNotesPath(dataDir: string, lead: JobLead): string {
  const safe = Buffer.from(lead.url).toString("base64url");
  return path.join(dataDir, "leads", `${safe}.json`);
}

export async function writeLeadNotes(dataDir: string, lead: JobLead, notes: LeadNotes): Promise<void> {
  await ensureDir(path.join(dataDir, "leads"));
  await writeJsonFile(leadNotesPath(dataDir, lead), notes);
}

export function buildLeadNotes(lead: JobLead, resumeText?: string): LeadNotes {
  const baseChecklist = [
    "Open the job URL in your browser (logged in).",
    "Confirm it was posted within the last 24 hours.",
    "Confirm role is Product/PM and location/visa constraints fit.",
    "Tailor resume keywords to match the posting.",
    "Write a short, specific note for the recruiter/hiring team.",
    "Apply manually (no bots).",
    "Record outcome and next follow-up date."
  ];

  const prompts = [
    `Summarize this job in 3 bullets based on the description at: ${lead.url}`,
    `From my resume, list 5 most relevant bullets for this job.`,
    `Draft a 120-word tailored cover note using those bullets.`
  ];

  if (resumeText && resumeText.length > 0) {
    prompts.push("Resume context (paste into your LLM prompt as needed):\n" + resumeText.slice(0, 2000));
  }

  return {
    url: lead.url,
    createdAt: new Date().toISOString(),
    checklist: baseChecklist,
    prompts
  };
}

