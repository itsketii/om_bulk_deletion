export type BulkStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type BulkCurrency = "CDF" | "USD";

export type BulkTriggeredBy = {
  id: number;
  username: string;
  fullname: string | null;
  role: "ADMIN" | "USER";
};

export type BulkReportKind = "success" | "failed";

export type BulkExecution = {
  id: number;
  uploadId: number;
  currency: BulkCurrency;
  inputFile: string;
  logFile: string;
  status: BulkStatus;
  pid: number | null;
  errorMessage: string | null;
  triggeredById: number | null;
  triggeredBy: BulkTriggeredBy | null;
  startedAt: string | null;
  completedAt: string | null;
  lastLogUpdate: string | null;
  successFile: string | null;
  failedFile: string | null;
  successCount: number | null;
  failedCount: number | null;
  hasSuccessReport: boolean;
  hasFailedReport: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BulkExecutionStatus = {
  id: number;
  status: BulkStatus;
  startedAt: string | null;
  completedAt: string | null;
  lastLogUpdate: string | null;
};

export type BulkExecutionLog = {
  id: number;
  status: BulkStatus;
  logFile: string;
  content: string;
  size: number;
  truncated: boolean;
  modifiedAt: string | null;
};

export type BulkExecuteResult = {
  executions: BulkExecution[];
  errors: Array<{ currency: BulkCurrency; message: string }>;
};
