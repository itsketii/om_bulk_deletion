import type { Metadata } from "next";
import { UploadsView } from "@/components/upload/UploadsView";

export const metadata: Metadata = {
  title: "Uploads · OM Bulk Deletion Portal",
};

export default function UploadsPage() {
  return <UploadsView />;
}
