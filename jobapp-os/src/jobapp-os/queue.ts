import path from "node:path";
import { JobLead } from "./types";
import { ensureDir, readJsonFile, writeJsonFile } from "./io";

export type LeadQueue = {
  leads: JobLead[];
};

export function queueFilePath(dataDir: string): string {
  return path.join(dataDir, "leads.json");
}

export async function loadQueue(dataDir: string): Promise<LeadQueue> {
  await ensureDir(dataDir);
  const filePath = queueFilePath(dataDir);
  try {
    return await readJsonFile<LeadQueue>(filePath);
  } catch {
    return { leads: [] };
  }
}

export async function saveQueue(dataDir: string, queue: LeadQueue): Promise<void> {
  await writeJsonFile(queueFilePath(dataDir), queue);
}

export function addLeads(queue: LeadQueue, newLeads: JobLead[]): LeadQueue {
  const seen = new Set(queue.leads.map((l) => l.url));
  const deduped = newLeads.filter((l) => !seen.has(l.url));
  return { leads: [...queue.leads, ...deduped] };
}

