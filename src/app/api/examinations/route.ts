import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("classLevel");
    const examName = searchParams.get("examName");

    const where: any = {};
    if (classLevel && classLevel !== "ALL") {
      where.classLevel = parseInt(classLevel);
    }
    if (examName && examName !== "ALL") {
      where.examName = examName;
    }

    const grades = await prisma.gradeReport.findMany({
      where,
      orderBy: [{ classLevel: "desc" }, { admissionNo: "asc" }],
    });

    const students = await prisma.student.findMany({
      orderBy: [{ classLevel: "desc" }, { rollNo: "asc" }],
    });
    const studentMap = new Map(students.map((s) => [s.admissionNo, s]));

    const enriched = grades.map((g) => {
      const stud = studentMap.get(g.admissionNo);
      return {
        ...g,
        studentName: stud?.name || g.admissionNo,
        rollNo: stud?.rollNo || "",
        fatherName: stud?.parentName || "",
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("GET Examinations Error:", error);
    return NextResponse.json({ error: "Failed to fetch examination records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      admissionNo,
      classLevel,
      examName,
      academicYear = "2026-2027",
      teluguMarks = 0,
      hindiMarks = 0,
      englishMarks = 0,
      mathsMarks = 0,
      scienceMarks = 0,
      socialMarks = 0,
      maxMarksPerSubject = 100,
      teacherRemarks = "",
    } = body;

    const t = parseFloat(String(teluguMarks)) || 0;
    const h = parseFloat(String(hindiMarks)) || 0;
    const e = parseFloat(String(englishMarks)) || 0;
    const m = parseFloat(String(mathsMarks)) || 0;
    const sc = parseFloat(String(scienceMarks)) || 0;
    const so = parseFloat(String(socialMarks)) || 0;

    const totalMarks = t + h + e + m + sc + so;
    const maxMarks = (parseFloat(String(maxMarksPerSubject)) || 100) * 6;
    const percentage = parseFloat(((totalMarks / maxMarks) * 100).toFixed(1));

    let overallGrade = "B1";
    let gpa = 7.0;
    if (percentage >= 91) { overallGrade = "A1"; gpa = 10.0; }
    else if (percentage >= 81) { overallGrade = "A2"; gpa = 9.0; }
    else if (percentage >= 71) { overallGrade = "B1"; gpa = 8.0; }
    else if (percentage >= 61) { overallGrade = "B2"; gpa = 7.0; }
    else if (percentage >= 51) { overallGrade = "C1"; gpa = 6.0; }
    else if (percentage >= 41) { overallGrade = "C2"; gpa = 5.0; }
    else if (percentage >= 35) { overallGrade = "D"; gpa = 4.0; }
    else { overallGrade = "E"; gpa = 3.0; }

    const remarks =
      teacherRemarks ||
      (overallGrade === "A1"
        ? "Outstanding performance! Keep it up."
        : overallGrade === "A2"
        ? "Very good academic progress."
        : "Good effort. Continue regular revision.");

    const existing = await prisma.gradeReport.findFirst({
      where: {
        admissionNo: String(admissionNo),
        examName: String(examName),
      },
    });

    if (existing) {
      const updated = await prisma.gradeReport.update({
        where: { id: existing.id },
        data: {
          teluguMarks: t,
          hindiMarks: h,
          englishMarks: e,
          mathsMarks: m,
          scienceMarks: sc,
          socialMarks: so,
          totalMarks,
          maxMarks,
          percentage,
          overallGrade,
          gpa,
          teacherRemarks: remarks,
        },
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.gradeReport.create({
      data: {
        studentId: Number(studentId || 1),
        admissionNo: String(admissionNo),
        classLevel: Number(classLevel || 10),
        examName: String(examName),
        academicYear: String(academicYear),
        teluguMarks: t,
        hindiMarks: h,
        englishMarks: e,
        mathsMarks: m,
        scienceMarks: sc,
        socialMarks: so,
        totalMarks,
        maxMarks,
        percentage,
        overallGrade,
        gpa,
        teacherRemarks: remarks,
        isPublished: true,
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    console.error("POST Examination Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save exam marks" }, { status: 500 });
  }
}

