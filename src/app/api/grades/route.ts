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

function calculateGradeAndGpa(percentage: number): { overallGrade: string; gpa: number; defaultRemarks: string } {
  if (percentage >= 91) {
    return {
      overallGrade: "A1",
      gpa: 10.0,
      defaultRemarks: "Outstanding academic excellence! Displays exemplary conceptual mastery and critical thinking skills.",
    };
  }
  if (percentage >= 81) {
    return {
      overallGrade: "A2",
      gpa: 9.0,
      defaultRemarks: "Very good performance! Demonstrates strong understanding and active participation across all subjects.",
    };
  }
  if (percentage >= 71) {
    return {
      overallGrade: "B1",
      gpa: 8.0,
      defaultRemarks: "Good work. Consistent practice in numerical subjects will help propel performance to an A grade.",
    };
  }
  if (percentage >= 61) {
    return {
      overallGrade: "B2",
      gpa: 7.0,
      defaultRemarks: "Above average comprehension. Recommended to spend 30 minutes daily on revision and problem-solving.",
    };
  }
  if (percentage >= 51) {
    return {
      overallGrade: "C1",
      gpa: 6.0,
      defaultRemarks: "Average attainment. Needs dedicated attention in science formulas and math problem sets.",
    };
  }
  if (percentage >= 41) {
    return {
      overallGrade: "C2",
      gpa: 5.0,
      defaultRemarks: "Fair effort. Regular attendance in after-school remedial sessions will bring noticeable gains.",
    };
  }
  if (percentage >= 35) {
    return {
      overallGrade: "D",
      gpa: 4.0,
      defaultRemarks: "Passing grade. Intensive support and guided revision recommended for upcoming assessments.",
    };
  }
  return {
    overallGrade: "E",
    gpa: 3.0,
    defaultRemarks: "Needs significant improvement. Parent-teacher consultation scheduled to formulate personalized study plan.",
  };
}

// GET: Grade reports
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevelParam = searchParams.get("classLevel");
    const admissionNoParam = searchParams.get("admissionNo");
    const examNameParam = searchParams.get("examName");

    const where: any = {};
    if (classLevelParam && classLevelParam !== "ALL") {
      where.classLevel = parseInt(classLevelParam);
    }
    if (admissionNoParam) {
      where.admissionNo = admissionNoParam;
    }
    if (examNameParam && examNameParam !== "ALL") {
      where.examName = examNameParam;
    }

    const reports = await prisma.gradeReport.findMany({
      where,
      orderBy: [{ classLevel: "asc" }, { totalMarks: "desc" }],
    });

    // Also get student metadata (names, photos)
    const studentAdmissionNos = Array.from(new Set(reports.map((r) => r.admissionNo)));
    const students = await prisma.student.findMany({
      where: { admissionNo: { in: studentAdmissionNos } },
      select: {
        admissionNo: true,
        name: true,
        photo: true,
        rollNo: true,
        gender: true,
        parentName: true,
      },
    });

    const studentMap = new Map(students.map((s) => [s.admissionNo, s]));

    const enrichedReports = reports.map((r) => {
      const stud = studentMap.get(r.admissionNo);
      return {
        ...r,
        studentName: stud?.name || "Student",
        studentPhoto: stud?.photo || "/images/placeholders/student_male.svg",
        rollNo: stud?.rollNo || "",
        parentName: stud?.parentName || "",
      };
    });

    return NextResponse.json({
      success: true,
      reports: enrichedReports,
    });
  } catch (error: any) {
    console.error("GET Grades API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch grades" }, { status: 500 });
  }
}

// POST: Add or update grade report
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized: Only teachers and admins can record grades." }, { status: 403 });
    }

    const body = await request.json();
    const {
      admissionNo,
      examName,
      academicYear = "2026-2027",
      teluguMarks = 0,
      hindiMarks = 0,
      englishMarks = 0,
      mathsMarks = 0,
      scienceMarks = 0,
      socialMarks = 0,
      teacherRemarks,
      isPublished = true,
    } = body;

    if (!admissionNo || !examName) {
      return NextResponse.json({ error: "admissionNo and examName are required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { admissionNo },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const tel = parseFloat(teluguMarks) || 0;
    const hin = parseFloat(hindiMarks) || 0;
    const eng = parseFloat(englishMarks) || 0;
    const mat = parseFloat(mathsMarks) || 0;
    const sci = parseFloat(scienceMarks) || 0;
    const soc = parseFloat(socialMarks) || 0;

    const totalMarks = tel + hin + eng + mat + sci + soc;
    const percentage = parseFloat(((totalMarks / 600) * 100).toFixed(1));
    const { overallGrade, gpa, defaultRemarks } = calculateGradeAndGpa(percentage);
    const finalRemarks = teacherRemarks?.trim() || defaultRemarks;

    // Check if report already exists for this student & exam
    const existing = await prisma.gradeReport.findFirst({
      where: {
        admissionNo,
        examName,
        academicYear,
      },
    });

    let savedReport;
    if (existing) {
      savedReport = await prisma.gradeReport.update({
        where: { id: existing.id },
        data: {
          teluguMarks: tel,
          hindiMarks: hin,
          englishMarks: eng,
          mathsMarks: mat,
          scienceMarks: sci,
          socialMarks: soc,
          totalMarks,
          maxMarks: 600,
          percentage,
          overallGrade,
          gpa,
          teacherRemarks: finalRemarks,
          isPublished,
        },
      });
    } else {
      savedReport = await prisma.gradeReport.create({
        data: {
          studentId: student.id,
          admissionNo: student.admissionNo,
          classLevel: student.classLevel,
          examName,
          academicYear,
          teluguMarks: tel,
          hindiMarks: hin,
          englishMarks: eng,
          mathsMarks: mat,
          scienceMarks: sci,
          socialMarks: soc,
          totalMarks,
          maxMarks: 600,
          percentage,
          overallGrade,
          gpa,
          teacherRemarks: finalRemarks,
          isPublished,
        },
      });
    }

    // Update academicPerformance field on student based on latest GPA
    let performanceLabel = "Good";
    if (gpa >= 9.0) performanceLabel = "Excellent";
    else if (gpa >= 7.0) performanceLabel = "Good";
    else if (gpa >= 5.0) performanceLabel = "Average";
    else performanceLabel = "Needs Improvement";

    await prisma.student.update({
      where: { id: student.id },
      data: { academicPerformance: performanceLabel },
    });

    // Notify parents when grade report is published
    if (isPublished) {
      await prisma.notification.create({
        data: {
          title: `${examName} Progress Card Published: ${student.name}`,
          message: `Grade report for ${student.name} (${examName}) is now live! Score: ${totalMarks}/600 (${percentage}%, Grade: ${overallGrade}, GPA: ${gpa}).`,
          category: "PROGRESS",
          targetRole: "PARENT",
          date: new Date().toISOString().split("T")[0],
          actionUrl: `/portfolios`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      report: savedReport,
    });
  } catch (error: any) {
    console.error("POST Grades API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to record grades" }, { status: 500 });
  }
}
