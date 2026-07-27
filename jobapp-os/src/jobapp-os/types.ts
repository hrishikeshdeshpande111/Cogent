export type JobappConfig = {
  search: {
    query: string;
    location?: string;
    postedWithinHours: 24 | 168;
  };
  output: {
    dataDir: string;
  };
  resume?: {
    // Plain text version of your resume (copy/paste). Kept local to the repo.
    resumeTextPath: string;
    // Optional PDF path to extract from (local file).
    resumePdfPath?: string;
  };
  safety: {
    requireUserConfirmBeforeApply: true;
    linkedinAutomationMode: "manual_assist";
  };
};

export type JobLead = {
  source: "linkedin";
  capturedAt: string; // ISO
  title?: string;
  company?: string;
  location?: string;
  url: string;
  notes?: string;
};
