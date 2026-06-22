import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "My profile · OM Bulk Formatter",
};

export default function ProfilePage() {
  return <ProfileView />;
}
