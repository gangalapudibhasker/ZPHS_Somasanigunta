import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "STUDENTS";
    const format = searchParams.get("format") || "CSV";
    const classLevelParam = searchParams.get("classLevel");
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    let csvContent = "";
    let filename = `ZPHS_${type}_${month}`;

    if (type === "STUDENTS") {
      filename = `ZPHS_Students_Registry_${new Date().toISOString().slice(0, 10)}.csv`;
      const where = classLevelParam && classLevelParam !== "ALL" ? { classLevel: parseInt(classLevelParam) } : {};
      const students = await prisma.student.findMany({
        where,
        orderBy: [{ classLevel: "asc" }, { rollNo: "asc" }],
      });

      const headers = [
        "Admission No",
        "Student Name",
        "Class",
        "Roll No",
        "Gender",
        "DOB",
        "Blood Group",
        "Parent Name",
        "Mobile No",
        "Attendance %",
        "Academic Performance",
      ];

      const rows = students.map((s) => [
        `"${s.admissionNo}"`,
        `"${s.name}"`,
        s.classLevel,
        `"${s.rollNo}"`,
        `"${s.gender}"`,
        `"${s.dob}"`,
        `"${s.bloodGroup || "N/A"}"`,
        `"${s.parentName}"`,
        `"${s.mobileNo}"`,
        s.attendancePercentage,
        `"${s.academicPerformance}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "ATTENDANCE") {
      filename = `ZPHS_Monthly_Attendance_${month}.csv`;
      const records = await prisma.attendanceRecord.findMany({
        where: { date: { startsWith: month } },
        orderBy: [{ date: "desc" }, { classLevel: "asc" }],
      });

      const headers = ["Date", "Class", "Admission No", "Status", "Session", "Recorded By", "Remarks"];
      const rows = records.map((r) => [
        `"${r.date}"`,
        r.classLevel,
        `"${r.admissionNo}"`,
        `"${r.status}"`,
        `"${r.session}"`,
        `"${r.recordedBy || "Faculty"}"`,
        `"${r.remarks || ""}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "GRADES") {
      filename = `ZPHS_Academic_Grades_Report_${month}.csv`;
      const grades = await prisma.gradeReport.findMany({
        orderBy: [{ classLevel: "asc" }, { totalMarks: "desc" }],
      });

      const headers = [
        "Admission No",
        "Class",
        "Exam Name",
        "Telugu",
        "Hindi",
        "English",
        "Maths",
        "Science",
        "Social",
        "Total (600)",
        "Percentage %",
        "Overall Grade",
        "GPA",
        "Teacher Remarks",
      ];

      const rows = grades.map((g) => [
        `"${g.admissionNo}"`,
        g.classLevel,
        `"${g.examName}"`,
        g.teluguMarks,
        g.hindiMarks,
        g.englishMarks,
        g.mathsMarks,
        g.scienceMarks,
        g.socialMarks,
        g.totalMarks,
        g.percentage,
        `"${g.overallGrade}"`,
        g.gpa,
        `"${g.teacherRemarks?.replace(/"/g, '""') || ""}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "SMC") {
      filename = `ZPHS_SMC_Proposals_And_Resolutions_${month}.csv`;
      const proposals = await prisma.smcProposal.findMany({
        orderBy: { createdAt: "desc" },
      });

      const headers = [
        "Proposal Code",
        "Title",
        "Category",
        "Budget (INR)",
        "Submitted By",
        "Status",
        "YES Votes",
        "NO Votes",
        "ABSTAIN Votes",
        "Quorum Tally (out of 15)",
      ];

      const rows = proposals.map((p) => [
        `"${p.proposalCode}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.budget,
        `"${p.submittedBy}"`,
        `"${p.status}"`,
        p.yesCount,
        p.noCount,
        p.abstainCount,
        `"${p.yesCount + p.noCount + p.abstainCount}/15"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "MDM") {
      filename = `ZPHS_MidDayMeal_Register_${month}.csv`;
      const logs = await prisma.mdmLog.findMany({
        where: { date: { startsWith: month } },
        orderBy: { date: "desc" },
      });

      const headers = ["Date", "Item", "Received Qty", "Utilized Qty", "Balance Qty", "Remarks"];
      const rows = logs.map((l) => [
        `"${l.date}"`,
        `"${l.item}"`,
        l.receivedQty,
        l.utilizedQty,
        l.balanceQty,
        `"${l.remarks || ""}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    // Add security integrity checksum header
    const securityChecksum = crypto.createHash("sha256").update(csvContent).digest("hex").slice(0, 16);
    const metadataHeader = `# Zilla Parishad High School, Somasanigunta - Departmental Export\n# Security Hash: ${securityChecksum}\n# Generated: ${new Date().toISOString()}\n`;

    const finalCsv = metadataHeader + csvContent;

    return new Response(finalCsv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Security-Checksum": securityChecksum,
      },
    });
  } catch (error: any) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate export" }, { status: 500 });
  }
}
