import type { Metadata } from "next";
import { FilesView } from "@/components/files/FilesView";

export const metadata: Metadata = {
  title: "Files · OM Bulk Deletion",
};

export default function FilesPage() {
  return <FilesView />;
}
