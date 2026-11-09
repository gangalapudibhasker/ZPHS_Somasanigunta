import React from "react";
import { prisma } from "@/lib/db";
import SmcManager from "@/components/SmcManager";

export const revalidate = 0;

export default async function AdminSmcPage() {
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
      userRole="HM"
      userName="Sri Gangalapudi Bhaskar Reddy (HM)"
    />
  );
}

