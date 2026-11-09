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

// POST: Upload classroom activity image & report
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized: Only faculty and admins can post classroom activities." }, { status: 403 });
    }

    const {
      facilityId = "ifp",
      title,
      description,
      classLevel,
      photoUrl,
    } = await request.json();

    if (!title || !description || !classLevel) {
      return NextResponse.json({ error: "Title, description, and classLevel are required." }, { status: 400 });
    }

    // Default photos if none provided
    const fallbackPhoto = facilityId === "scilab"
      ? "/images/science-friendly.jpg"
      : facilityId === "mathlab"
      ? "/images/math-friendly.jpg"
      : facilityId === "library"
      ? "/images/library-friendly.jpg"
      : facilityId === "sports"
      ? "/images/sports-friendly.jpg"
      : "/images/ifp-friendly.png";

    const activity = await prisma.classroomActivity.create({
      data: {
        facilityId,
        title,
        description,
        classLevel: parseInt(classLevel),
        teacherName: user.name || "Class Teacher",
        photoUrl: photoUrl || fallbackPhoto,
        date: new Date().toISOString().split("T")[0],
      },
    });

    // Also notify parents of that class
    await prisma.notification.create({
      data: {
        title: `New Classroom Activity: Class ${classLevel}`,
        message: `${user.name} posted a new activity: "${title}" in the ${facilityId.toUpperCase()} facility!`,
        category: "EVENT",
        targetRole: "ALL",
        date: new Date().toISOString().split("T")[0],
        actionUrl: "/facilities",
      },
    });

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error: any) {
    console.error("POST Classroom Activity API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create activity" }, { status: 500 });
  }
}
