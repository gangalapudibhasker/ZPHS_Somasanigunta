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

// GET: All facility notes and activities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");

    const noteWhere = facilityId ? { facilityId } : {};
    const activityWhere = facilityId ? { facilityId } : {};

    const notes = await prisma.facilityNote.findMany({
      where: noteWhere,
      orderBy: { createdAt: "desc" },
    });

    const activities = await prisma.classroomActivity.findMany({
      where: activityWhere,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      notes,
      activities,
    });
  } catch (error: any) {
    console.error("GET Facilities API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch facility data" }, { status: 500 });
  }
}

// POST: Add a note to a facility
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized: Only faculty and admins can post facility notes." }, { status: 403 });
    }

    const { facilityId, title, content } = await request.json();

    if (!facilityId || !title || !content) {
      return NextResponse.json({ error: "facilityId, title, and content are required" }, { status: 400 });
    }

    const note = await prisma.facilityNote.create({
      data: {
        facilityId,
        title,
        content,
        authorName: user.name || "Faculty Member",
        authorRole: user.role,
        date: new Date().toISOString().split("T")[0],
      },
    });

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error: any) {
    console.error("POST Facility Note API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create facility note" }, { status: 500 });
  }
}
