import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Overview · OM Bulk Deletion Portal",
};

export default function DashboardPage() {
  return <DashboardView />;
}
