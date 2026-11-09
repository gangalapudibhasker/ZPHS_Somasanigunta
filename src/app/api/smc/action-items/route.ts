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

// POST: Add new action item
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      taskDescription,
      assignedTo,
      targetDate,
      priority = "MEDIUM",
      proposalId,
    } = await request.json();

    if (!taskDescription || !assignedTo || !targetDate) {
      return NextResponse.json({ error: "taskDescription, assignedTo, and targetDate are required" }, { status: 400 });
    }

    const item = await prisma.smcActionItem.create({
      data: {
        taskDescription,
        assignedTo,
        targetDate,
        priority,
        proposalId: proposalId ? parseInt(proposalId) : null,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error("POST SMC Action Item Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create action item" }, { status: 500 });
  }
}

// PUT: Update action item status or completion notes
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, completionNotes } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const updated = await prisma.smcActionItem.update({
      where: { id: parseInt(id) },
      data: {
        status,
        completionNotes: completionNotes !== undefined ? completionNotes : undefined,
      },
    });

    // Notify committee when an action item is marked completed
    if (status === "COMPLETED") {
      await prisma.notification.create({
        data: {
          title: `SMC Action Item Completed!`,
          message: `Task "${updated.taskDescription}" assigned to ${updated.assignedTo} has been marked COMPLETED.`,
          category: "SMC",
          targetRole: "SMC",
          date: new Date().toISOString().split("T")[0],
          actionUrl: "/portal/smc",
        },
      });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("PUT SMC Action Item Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update action item" }, { status: 500 });
  }
}
