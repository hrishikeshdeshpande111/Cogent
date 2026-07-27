import path from "node:path";

export function resolveDataDir(dataDir: string): string {
  return path.isAbsolute(dataDir) ? dataDir : path.join(process.cwd(), dataDir);
}

