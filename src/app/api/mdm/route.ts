import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function getAdminUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("zphs_session");
    if (!session) return null;
    return verifyToken(session.value);
  } catch {
    return null;
  }
}

// GET: Fetch MDM logs and current running balances
export async function GET() {
  try {
    // 1. Fetch all logs sorted by date
    const logs = await prisma.mdmLog.findMany({
      orderBy: { date: "desc" },
    });

    // 2. Dynamically calculate cumulative balances for each item
    const sums = await prisma.mdmLog.groupBy({
      by: ["item"],
      _sum: {
        receivedQty: true,
        utilizedQty: true,
      },
    });

    const summary = {
      RICE: { received: 0, utilized: 0, balance: 0 },
      EGG: { received: 0, utilized: 0, balance: 0 },
      CHIKKY: { received: 0, utilized: 0, balance: 0 },
      RAGI_JAVA: { received: 0, utilized: 0, balance: 0 },
    };

    sums.forEach((itemSum) => {
      const type = itemSum.item as keyof typeof summary;
      if (summary[type]) {
        const rec = itemSum._sum.receivedQty || 0;
        const uti = itemSum._sum.utilizedQty || 0;
        summary[type] = {
          received: rec,
          utilized: uti,
          balance: rec - uti,
        };
      }
    });

    return NextResponse.json({ logs, summary });
  } catch (error) {
    console.error("GET MDM Error:", error);
    return NextResponse.json({ error: "Failed to fetch MDM logs" }, { status: 500 });
  }
}

// POST: Add new log entry
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.date || !data.item || (data.receivedQty === undefined && data.utilizedQty === undefined)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = data.item.toUpperCase();
    const received = parseFloat(data.receivedQty || "0");
    const utilized = parseFloat(data.utilizedQty || "0");

    // Get current balance of that item up to that date, or sum of all prior items
    const totals = await prisma.mdmLog.aggregate({
      where: { item },
      _sum: {
        receivedQty: true,
        utilizedQty: true,
      },
    });

    const priorReceived = totals._sum.receivedQty || 0;
    const priorUtilized = totals._sum.utilizedQty || 0;
    const currentBalance = (priorReceived + received) - (priorUtilized + utilized);

    const logEntry = await prisma.mdmLog.create({
      data: {
        date: data.date,
        item,
        receivedQty: received,
        utilizedQty: utilized,
        balanceQty: currentBalance,
        remarks: data.remarks || "",
      },
    });

    return NextResponse.json(logEntry);
  } catch (error: any) {
    console.error("POST MDM Log Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create log entry" }, { status: 500 });
  }
}

// DELETE: Delete log entry
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
    }

    await prisma.mdmLog.delete({
      where: { id: parseInt(idParam) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE MDM Log Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete log entry" }, { status: 500 });
  }
}
