import type { Metadata } from "next";
import { BulkView } from "@/components/bulk/BulkView";

export const metadata: Metadata = {
  title: "Bulk · OM Bulk Formatter",
};

export default function BulkPage() {
  return <BulkView />;
}
