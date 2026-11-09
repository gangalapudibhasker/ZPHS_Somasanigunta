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

// GET: Parent-teacher conferences
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevelParam = searchParams.get("classLevel");
    const statusParam = searchParams.get("status");

    const where: any = {};
    if (classLevelParam && classLevelParam !== "ALL") {
      where.classLevel = parseInt(classLevelParam);
    }
    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    }

    const conferences = await prisma.ptConference.findMany({
      where,
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    });

    return NextResponse.json({
      success: true,
      conferences,
    });
  } catch (error: any) {
    console.error("GET PTC API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch conferences" }, { status: 500 });
  }
}

// POST: Book a conference slot (Parent) or create a new slot (Teacher/Admin)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const body = await request.json();

    // Check if booking an existing slot
    if (body.action === "BOOK") {
      const { slotId, studentAdmissionNo, studentName, parentName, topic, mode } = body;
      if (!slotId) {
        return NextResponse.json({ error: "slotId is required" }, { status: 400 });
      }

      const slot = await prisma.ptConference.findUnique({
        where: { id: parseInt(slotId) },
      });

      if (!slot || slot.status !== "OPEN") {
        return NextResponse.json({ error: "Conference slot is no longer available" }, { status: 400 });
      }

      const updated = await prisma.ptConference.update({
        where: { id: slot.id },
        data: {
          status: "BOOKED",
          studentAdmissionNo: studentAdmissionNo || user?.studentAdmissionNo || null,
          studentName: studentName || null,
          parentName: parentName || user?.name || "Parent",
          topic: topic || "Academic Progress Review",
          mode: mode || "IN_PERSON",
        },
      });

      // Send real-time notification
      await prisma.notification.create({
        data: {
          title: `Parent-Teacher Conference Confirmed`,
          message: `Slot booked with ${slot.teacherName} on ${slot.date} at ${slot.timeSlot} (${updated.mode}). Topic: ${updated.topic}`,
          category: "EVENT",
          targetRole: "PARENT",
          date: new Date().toISOString().split("T")[0],
          actionUrl: "/portal/ptc",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Conference slot booked successfully!",
        conference: updated,
      });
    }

    // Creating a new conference slot (Faculty/Admin)
    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized: Only teachers and admins can create slots." }, { status: 403 });
    }

    const {
      title,
      date,
      timeSlot,
      teacherName,
      classLevel,
      mode = "IN_PERSON",
    } = body;

    if (!title || !date || !timeSlot || !classLevel) {
      return NextResponse.json({ error: "Missing required conference slot fields" }, { status: 400 });
    }

    const newSlot = await prisma.ptConference.create({
      data: {
        title,
        date,
        timeSlot,
        teacherName: teacherName || user.name || "Faculty Member",
        classLevel: parseInt(classLevel),
        mode,
        status: "OPEN",
      },
    });

    return NextResponse.json({
      success: true,
      conference: newSlot,
    });
  } catch (error: any) {
    console.error("POST PTC API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process conference request" }, { status: 500 });
  }
}
