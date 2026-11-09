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

export async function GET() {
  try {
    const campaigns = await prisma.activeCampaign.findMany({
      orderBy: { createdAt: "asc" },
    });

    const parsedCampaigns = campaigns.map((c) => ({
      ...c,
      kpis: c.kpis ? JSON.parse(c.kpis) : {},
      progressPercentage: Math.min(100, parseFloat(((c.currentValue / c.targetValue) * 100).toFixed(1))),
    }));

    return NextResponse.json({
      success: true,
      campaigns: parsedCampaigns,
    });
  } catch (error: any) {
    console.error("GET Campaigns API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, currentValue, status, kpis } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Campaign id is required" }, { status: 400 });
    }

    const updated = await prisma.activeCampaign.update({
      where: { id: parseInt(id) },
      data: {
        currentValue: currentValue !== undefined ? parseFloat(currentValue) : undefined,
        status: status || undefined,
        kpis: kpis ? (typeof kpis === "string" ? kpis : JSON.stringify(kpis)) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updated,
    });
  } catch (error: any) {
    console.error("POST Campaign API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update campaign" }, { status: 500 });
  }
}
