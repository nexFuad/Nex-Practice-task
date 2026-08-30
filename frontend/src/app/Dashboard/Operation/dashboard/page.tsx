import { redirect } from "next/navigation";

export default function LegacyDashboardPage() {
  redirect("/om/dashboard");
}
