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

// GET: Fetch attendance records & statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevelParam = searchParams.get("classLevel");
    const admissionNoParam = searchParams.get("admissionNo");
    const dateParam = searchParams.get("date");
    const monthParam = searchParams.get("month"); // e.g. "2026-10"

    const where: any = {};
    if (classLevelParam && classLevelParam !== "ALL") {
      where.classLevel = parseInt(classLevelParam);
    }
    if (admissionNoParam) {
      where.admissionNo = admissionNoParam;
    }
    if (dateParam) {
      where.date = dateParam;
    }
    if (monthParam) {
      where.date = { startsWith: monthParam };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: [{ date: "desc" }, { admissionNo: "asc" }],
      take: 200,
    });

    // Calculate aggregated statistics
    const totalRecords = records.length;
    const presentCount = records.filter((r) => r.status === "PRESENT").length;
    const absentCount = records.filter((r) => r.status === "ABSENT").length;
    const lateCount = records.filter((r) => r.status === "LATE").length;
    const excusedCount = records.filter((r) => r.status === "EXCUSED").length;

    const attendanceRate = totalRecords > 0
      ? parseFloat((((presentCount + lateCount) / totalRecords) * 100).toFixed(1))
      : 100.0;

    return NextResponse.json({
      success: true,
      records,
      stats: {
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate,
      },
    });
  } catch (error: any) {
    console.error("GET Attendance API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch attendance" }, { status: 500 });
  }
}

// POST: Mark attendance (batch or single)
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized: Only faculty and admins can mark attendance." }, { status: 403 });
    }

    const data = await request.json();
    const recordsToProcess = Array.isArray(data) ? data : [data];

    const results = [];
    const absentStudents: { admissionNo: string; name?: string; date: string }[] = [];

    for (const item of recordsToProcess) {
      if (!item.admissionNo || !item.date || !item.classLevel) {
        continue;
      }

      // Find student to get studentId and name
      const student = await prisma.student.findUnique({
        where: { admissionNo: String(item.admissionNo) },
      });

      if (!student) continue;

      // Upsert: check if attendance already recorded for this student on this date
      const existing = await prisma.attendanceRecord.findFirst({
        where: {
          admissionNo: item.admissionNo,
          date: item.date,
        },
      });

      let savedRecord;
      if (existing) {
        savedRecord = await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: {
            status: item.status || "PRESENT",
            session: item.session || "FULL_DAY",
            remarks: item.remarks || null,
            recordedBy: user.name,
          },
        });
      } else {
        savedRecord = await prisma.attendanceRecord.create({
          data: {
            studentId: student.id,
            admissionNo: student.admissionNo,
            classLevel: student.classLevel,
            date: item.date,
            status: item.status || "PRESENT",
            session: item.session || "FULL_DAY",
            recordedBy: user.name,
            remarks: item.remarks || null,
          },
        });
      }

      // Update student's overall attendance percentage
      const allStudentRecords = await prisma.attendanceRecord.findMany({
        where: { admissionNo: student.admissionNo },
      });
      const studentPresent = allStudentRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
      const newPercentage = allStudentRecords.length > 0
        ? parseFloat(((studentPresent / allStudentRecords.length) * 100).toFixed(1))
        : 100.0;

      await prisma.student.update({
        where: { id: student.id },
        data: { attendancePercentage: newPercentage },
      });

      if (savedRecord.status === "ABSENT") {
        absentStudents.push({
          admissionNo: student.admissionNo,
          name: student.name,
          date: item.date,
        });
      }

      results.push(savedRecord);
    }

    // Automatically trigger notification alerts for absent students to parents
    for (const abs of absentStudents) {
      await prisma.notification.create({
        data: {
          title: `Daily Attendance Alert: ${abs.name || abs.admissionNo}`,
          message: `Dear Parent, your child was marked absent today (${abs.date}) at ZPHS Somasanigunta. Please contact the class teacher if this was unexcused.`,
          category: "ATTENDANCE",
          targetRole: "PARENT",
          date: abs.date,
          actionUrl: "/portal/attendance",
        },
      });
    }

    return NextResponse.json({
      success: true,
      savedCount: results.length,
      absentAlertsTriggered: absentStudents.length,
      records: results,
    });
  } catch (error: any) {
    console.error("POST Attendance API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to record attendance" }, { status: 500 });
  }
}
