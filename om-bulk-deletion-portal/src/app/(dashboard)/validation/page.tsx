import type { Metadata } from "next";
import { ValidationView } from "@/components/validation/ValidationView";

export const metadata: Metadata = {
  title: "Validation · OM Bulk Formatter",
};

export default function ValidationPage() {
  return <ValidationView />;
}
