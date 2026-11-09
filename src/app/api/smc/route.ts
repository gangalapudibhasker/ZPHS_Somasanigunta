import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("zphs_session");
    if (!session) return null;
    return verifyToken(session.value);
  } catch {
    return null;
  }
}

// GET: 15 SMC Members, Proposals, Meetings, Action Items
export async function GET() {
  try {
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

    const votes = await prisma.smcVote.findMany({
      orderBy: { votedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      members,
      proposals,
      meetings,
      actionItems,
      votes,
      stats: {
        totalMembers: members.length, // Should be 15
        activeProposals: proposals.filter((p) => p.status === "ACTIVE").length,
        approvedProposals: proposals.filter((p) => p.status === "APPROVED").length,
        pendingActionItems: actionItems.filter((a) => a.status !== "COMPLETED").length,
        completedActionItems: actionItems.filter((a) => a.status === "COMPLETED").length,
      },
    });
  } catch (error: any) {
    console.error("GET SMC API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch SMC data" }, { status: 500 });
  }
}

// POST: Cast a secure vote on an active proposal
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please log in to vote." }, { status: 401 });
    }

    const { proposalId, memberId, memberName, vote, comment } = await request.json();

    if (!proposalId || !vote) {
      return NextResponse.json({ error: "proposalId and vote (YES/NO/ABSTAIN) are required." }, { status: 400 });
    }

    const proposal = await prisma.smcProposal.findUnique({
      where: { id: parseInt(proposalId) },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status !== "ACTIVE") {
      return NextResponse.json({ error: `Voting is closed. Proposal status is ${proposal.status}.` }, { status: 400 });
    }

    // Determine voting member ID
    const effectiveMemberId = memberId ? parseInt(memberId) : (user.userId || 1);
    const effectiveMemberName = memberName || user.name || "SMC Member";

    // Check if member already voted
    const existingVote = await prisma.smcVote.findFirst({
      where: {
        proposalId: proposal.id,
        memberId: effectiveMemberId,
      },
    });

    if (existingVote) {
      // Allow modifying existing vote
      const prev = existingVote.vote;
      await prisma.smcVote.update({
        where: { id: existingVote.id },
        data: {
          vote,
          comment: comment || null,
          votedAt: new Date(),
        },
      });

      // Recalculate tallies
      let yChange = (vote === "YES" ? 1 : 0) - (prev === "YES" ? 1 : 0);
      let nChange = (vote === "NO" ? 1 : 0) - (prev === "NO" ? 1 : 0);
      let aChange = (vote === "ABSTAIN" ? 1 : 0) - (prev === "ABSTAIN" ? 1 : 0);

      const updated = await prisma.smcProposal.update({
        where: { id: proposal.id },
        data: {
          yesCount: { increment: yChange },
          noCount: { increment: nChange },
          abstainCount: { increment: aChange },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Vote updated successfully.",
        proposal: updated,
      });
    }

    // New vote
    await prisma.smcVote.create({
      data: {
        proposalId: proposal.id,
        memberId: effectiveMemberId,
        memberName: effectiveMemberName,
        vote,
        comment: comment || null,
      },
    });

    const incrementField = vote === "YES" ? "yesCount" : vote === "NO" ? "noCount" : "abstainCount";

    const updated = await prisma.smcProposal.update({
      where: { id: proposal.id },
      data: {
        [incrementField]: { increment: 1 },
      },
    });

    // If quorum (8+ out of 15 members) vote YES, proposal status can transition to APPROVED
    if (updated.yesCount >= 8 && updated.status === "ACTIVE") {
      await prisma.smcProposal.update({
        where: { id: updated.id },
        data: { status: "APPROVED" },
      });
      updated.status = "APPROVED";
    }

    // Real-time notification for all committee members upon status update
    await prisma.notification.create({
      data: {
        title: `SMC Vote Update: ${proposal.proposalCode}`,
        message: `${effectiveMemberName} cast a ${vote} vote on "${proposal.title}". Current Tally: ${updated.yesCount} YES, ${updated.noCount} NO, ${updated.abstainCount} ABSTAIN. Status: ${updated.status}.`,
        category: "SMC",
        targetRole: "SMC",
        date: new Date().toISOString().split("T")[0],
        actionUrl: "/portal/smc",
      },
    });

    return NextResponse.json({
      success: true,
      proposal: updated,
    });
  } catch (error: any) {
    console.error("POST SMC Vote API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to record vote" }, { status: 500 });
  }
}
