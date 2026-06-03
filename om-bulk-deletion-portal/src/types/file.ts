export type GeneratedFileType = "CDF" | "USD";

export type GeneratedFileSummary = {
  id: number;
  type: GeneratedFileType;
  filename: string;
};
