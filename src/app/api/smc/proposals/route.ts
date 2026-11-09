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

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SMC" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      title,
      description,
      category = "INFRASTRUCTURE",
      budget = 0,
      votingDeadline,
    } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const count = await prisma.smcProposal.count();
    const proposalCode = `SMC-2026-${String(count + 1).padStart(3, "0")}`;

    const today = new Date().toISOString().split("T")[0];
    const deadline = votingDeadline || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0];

    const proposal = await prisma.smcProposal.create({
      data: {
        proposalCode,
        title,
        description,
        category,
        budget: parseFloat(budget) || 0,
        submittedBy: user.name || "SMC Member",
        submissionDate: today,
        votingDeadline: deadline,
        status: "ACTIVE",
        yesCount: 0,
        noCount: 0,
        abstainCount: 0,
        totalQuorum: 15,
      },
    });

    // Notify all SMC members
    await prisma.notification.create({
      data: {
        title: `New School Proposal: ${proposalCode}`,
        message: `A new proposal "${title}" (Budget: ₹${budget.toLocaleString()}) has been tabled for voting by ${user.name}. Please submit your vote.`,
        category: "SMC",
        targetRole: "SMC",
        date: today,
        actionUrl: "/portal/smc",
      },
    });

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error: any) {
    console.error("POST SMC Proposal API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create proposal" }, { status: 500 });
  }
}
