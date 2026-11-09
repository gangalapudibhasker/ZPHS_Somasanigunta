import React from "react";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import SmcManager from "@/components/SmcManager";

export const revalidate = 0;

export default async function SmcPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("zphs_session");
  const user = sessionCookie ? verifyToken(sessionCookie.value) : null;

  const members = await prisma.smcMember.findMany({
    orderBy: { memberNumber: "asc" },
  });

  const proposals = await prisma.smcProposal.findMany({
    orderBy: { createdAt: "desc" },
  });

  const meetings = await prisma.smcMeeting.findMany({
    orderBy: { date: "desc" },
  });

  const actionItems = await prisma.smcActionItem.findMany({
    orderBy: [{ priority: "asc" }, { targetDate: "asc" }],
  });

  return (
    <SmcManager
      initialMembers={members}
      initialProposals={proposals}
      initialMeetings={meetings}
      initialActionItems={actionItems}
      userRole={user?.role || "SMC"}
      userName={user?.name || "SMC Member"}
    />
  );
}
