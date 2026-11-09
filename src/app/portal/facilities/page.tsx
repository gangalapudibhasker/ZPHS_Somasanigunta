import React from "react";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import FacilitiesManager from "@/components/FacilitiesManager";

export const revalidate = 0;

export default async function PortalFacilitiesPage() {
  let user: any = { id: 1, username: "admin", name: "Sri Gangalapudi Bhaskar Reddy", role: "ADMIN" };
  if (process.env.GITHUB_PAGES !== "true") {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("zphs_session");
    user = sessionCookie ? verifyToken(sessionCookie.value) : null;
  }

  const notes = await prisma.facilityNote.findMany({
    orderBy: { createdAt: "desc" },
  });

  const activities = await prisma.classroomActivity.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <FacilitiesManager
      initialNotes={notes}
      initialActivities={activities}
      userRole={user?.role || "TEACHER"}
      userName={user?.name || "Teacher"}
    />
  );
}
