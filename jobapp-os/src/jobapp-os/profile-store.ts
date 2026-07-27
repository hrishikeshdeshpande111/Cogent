import path from "node:path";
import { ensureDir, readJsonFile, writeJsonFile } from "./io";
import { resolveDataDir } from "./paths";

export type Metric = {
  id: string;
  label: string;
  value: string;
  context?: string;
};

export type Bullet = {
  id: string;
  label: string;
  text: string;
};

export type MetricsFile = {
  updatedAt: string | null;
  items: Metric[];
};

export type BulletsFile = {
  updatedAt: string | null;
  items: Bullet[];
};

function metricsPath(dataDir: string): string {
  return path.join(resolveDataDir(dataDir), "metrics.json");
}

function bulletsPath(dataDir: string): string {
  return path.join(resolveDataDir(dataDir), "bullets.json");
}

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export async function loadMetrics(dataDir: string): Promise<MetricsFile> {
  await ensureDir(resolveDataDir(dataDir));
  try {
    return await readJsonFile<MetricsFile>(metricsPath(dataDir));
  } catch {
    return { updatedAt: null, items: [] };
  }
}

export async function saveMetrics(dataDir: string, file: MetricsFile): Promise<void> {
  const next: MetricsFile = { ...file, updatedAt: new Date().toISOString() };
  await writeJsonFile(metricsPath(dataDir), next);
}

export async function addMetric(
  dataDir: string,
  input: Omit<Metric, "id">
): Promise<Metric> {
  const file = await loadMetrics(dataDir);
  const metric: Metric = { id: newId("metric"), ...input };
  file.items.push(metric);
  await saveMetrics(dataDir, file);
  return metric;
}

export async function loadBullets(dataDir: string): Promise<BulletsFile> {
  await ensureDir(resolveDataDir(dataDir));
  try {
    return await readJsonFile<BulletsFile>(bulletsPath(dataDir));
  } catch {
    return { updatedAt: null, items: [] };
  }
}

export async function saveBullets(dataDir: string, file: BulletsFile): Promise<void> {
  const next: BulletsFile = { ...file, updatedAt: new Date().toISOString() };
  await writeJsonFile(bulletsPath(dataDir), next);
}

export async function addBullet(
  dataDir: string,
  input: Omit<Bullet, "id">
): Promise<Bullet> {
  const file = await loadBullets(dataDir);
  const bullet: Bullet = { id: newId("bullet"), ...input };
  file.items.push(bullet);
  await saveBullets(dataDir, file);
  return bullet;
}

