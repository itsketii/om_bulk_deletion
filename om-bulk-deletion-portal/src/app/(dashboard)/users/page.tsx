import type { Metadata } from "next";
import { UsersView } from "@/components/users/UsersView";

export const metadata: Metadata = {
  title: "Users · OM Bulk Formatter",
};

export default function UsersPage() {
  return <UsersView />;
}
