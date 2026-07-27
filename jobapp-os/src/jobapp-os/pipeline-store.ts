import path from "node:path";
import { ensureDir, readJsonFile, writeJsonFile } from "./io";
import { resolveDataDir } from "./paths";

export type ApplicationStatus =
  | "queued"
  | "applied"
  | "recruiter_screen"
  | "hm_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

export type Application = {
  id: string;
  createdAt: string;
  updatedAt: string;
  company: string;
  role: string;
  url?: string;
  status: ApplicationStatus;
  notes?: string;
};

export type PipelineFile = {
  updatedAt: string | null;
  applications: Application[];
};

function pipelinePath(dataDir: string): string {
  return path.join(resolveDataDir(dataDir), "pipeline.json");
}

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export async function loadPipeline(dataDir: string): Promise<PipelineFile> {
  await ensureDir(resolveDataDir(dataDir));
  try {
    return await readJsonFile<PipelineFile>(pipelinePath(dataDir));
  } catch {
    return { updatedAt: null, applications: [] };
  }
}

export async function savePipeline(dataDir: string, file: PipelineFile): Promise<void> {
  const next: PipelineFile = { ...file, updatedAt: new Date().toISOString() };
  await writeJsonFile(pipelinePath(dataDir), next);
}

export async function addApplication(
  dataDir: string,
  input: Pick<Application, "company" | "role" | "url" | "status" | "notes">
): Promise<Application> {
  const file = await loadPipeline(dataDir);
  const now = new Date().toISOString();
  const app: Application = {
    id: newId("app"),
    createdAt: now,
    updatedAt: now,
    company: input.company,
    role: input.role,
    url: input.url,
    status: input.status,
    notes: input.notes
  };
  file.applications.push(app);
  await savePipeline(dataDir, file);
  return app;
}

export async function updateApplicationStatus(
  dataDir: string,
  id: string,
  status: ApplicationStatus
): Promise<Application> {
  const file = await loadPipeline(dataDir);
  const idx = file.applications.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error(`Unknown application id: ${id}`);
  const next = { ...file.applications[idx], status, updatedAt: new Date().toISOString() };
  file.applications[idx] = next;
  await savePipeline(dataDir, file);
  return next;
}

export function stats(file: PipelineFile): Record<ApplicationStatus, number> {
  const counts: Record<ApplicationStatus, number> = {
    queued: 0,
    applied: 0,
    recruiter_screen: 0,
    hm_screen: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    ghosted: 0
  };
  for (const app of file.applications) counts[app.status] = (counts[app.status] ?? 0) + 1;
  return counts;
}

