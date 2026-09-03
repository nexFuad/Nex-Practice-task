import { notFound, redirect } from "next/navigation";
import { AttendanceManagement } from "@/components/dashboard/om/attendance/AttendanceManagement";
import { ProfileSettings } from "@/components/dashboard/om/profile/ProfileSettings";
import { ShiftManagement } from "@/components/dashboard/om/shifts/ShiftManagement";
import { SiteManagement } from "@/components/dashboard/om/sites/SiteManagement";
import { UsersManagement } from "@/components/dashboard/om/users/UsersManagement";

export default async function OmSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (section === "dashboard") redirect("/om/sites");
  if (section === "sites") return <SiteManagement />;
  if (section === "users") return <UsersManagement />;
  if (section === "shift") return <ShiftManagement />;
  if (section === "attendance") return <AttendanceManagement />;
  if (section === "profile") return <ProfileSettings />;

  notFound();
}
