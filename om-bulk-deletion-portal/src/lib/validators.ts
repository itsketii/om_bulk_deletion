import { ACCEPTED_UPLOAD_EXTENSIONS } from "@/lib/constants";
import { getFileExtension } from "@/lib/helpers";

export function isValidUploadFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return (ACCEPTED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext);
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
