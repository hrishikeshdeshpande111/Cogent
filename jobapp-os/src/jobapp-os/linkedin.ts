import { JobappConfig, JobLead } from "./types";

function encodeParam(value: string): string {
  return encodeURIComponent(value);
}

// Keep this conservative: generate a URL the user can open in their own browser session.
export function buildLinkedInJobsSearchUrl(config: JobappConfig): string {
  const query = config.search.query.trim();
  // LinkedIn’s URL params change; keep to the basics that usually work.
  // "f_TPR=r86400" ~ past 24 hours (time posted). We also support 7 days as r604800.
  const seconds = config.search.postedWithinHours === 24 ? 86400 : 604800;
  const posted = `f_TPR=r${seconds}`;
  const keywords = `keywords=${encodeParam(query)}`;
  const location = config.search.location ? `location=${encodeParam(config.search.location)}` : "";
  const params = [keywords, location, posted].filter(Boolean).join("&");
  return `https://www.linkedin.com/jobs/search/?${params}`;
}

export function makeLead(url: string): JobLead {
  return {
    source: "linkedin",
    capturedAt: new Date().toISOString(),
    url
  };
}

