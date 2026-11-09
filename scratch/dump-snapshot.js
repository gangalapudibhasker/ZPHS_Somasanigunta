const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.$queryRawUnsafe(`SELECT * FROM "Student" ORDER BY "classLevel" ASC, "rollNo" ASC`);
  const parsedStudents = students.map((s) => {
    let admissionFormData = {};
    if (s.admissionFormData) {
      try {
        admissionFormData = JSON.parse(s.admissionFormData);
      } catch {}
    }
    return {
      ...s,
      apaarId: s.apaarId || "",
      penId: s.penId || "",
      fatherName: s.fatherName || s.parentName || "",
      motherName: s.motherName || "",
      caste: s.caste || "",
      admissionYear: s.admissionYear || "2026-2027",
      admissionFormData,
    };
  });

  const notices = await prisma.notice.findMany({ orderBy: { date: "desc" } });
  const gallery = await prisma.galleryImage.findMany({ orderBy: { uploadDate: "desc" } });
  const smcMembers = await prisma.smcMember.findMany();
  const smcProposals = await prisma.smcProposal.findMany({ orderBy: { createdAt: "desc" } });
  const smcMeetings = await prisma.smcMeeting.findMany({ orderBy: { date: "desc" } });
  const smcActions = await prisma.smcActionItem.findMany({ orderBy: { id: "desc" } });
  const sasaActivities = await prisma.sasaActivity.findMany({ orderBy: { date: "desc" } });
  const facilityNotes = await prisma.facilityNote.findMany({ orderBy: { date: "desc" } });
  const classroomActivities = await prisma.classroomActivity.findMany({ orderBy: { date: "desc" } });
  const officeFiles = await prisma.officeFile.findMany();
  const nominalRolls = await prisma.nominalRoll.findMany();
  const mdmLogs = await prisma.mdmLog.findMany();
  const activeCampaigns = await prisma.activeCampaign.findMany();
  const notifications = await prisma.notification.findMany();
  const gradeReports = await prisma.gradeReport.findMany();
  const attendanceRecords = await prisma.attendanceRecord.findMany();
  const ptConferences = await prisma.ptConference.findMany();
  const users = await prisma.user.findMany();

  let schoolHubRows = [];
  try {
    schoolHubRows = await prisma.$queryRawUnsafe(`SELECT "key", "value" FROM "SchoolHubStore"`);
  } catch {}
  const schoolHub = {};
  for (const r of schoolHubRows) {
    try {
      schoolHub[r.key] = JSON.parse(r.value);
    } catch {}
  }

  let studentActivityRows = [];
  try {
    studentActivityRows = await prisma.$queryRawUnsafe(`SELECT * FROM "StudentActivityPost" ORDER BY "id" DESC`);
  } catch {}

  const examsPath = path.join(__dirname, "../prisma/examinations_marks.json");
  const examinations = fs.existsSync(examsPath)
    ? JSON.parse(fs.readFileSync(examsPath, "utf8"))
    : [];

  const snapshot = {
    students: parsedStudents,
    notices,
    gallery,
    smc: {
      members: smcMembers,
      proposals: smcProposals,
      meetings: smcMeetings,
      actionItems: smcActions,
    },
    sasaActivities,
    facilityNotes,
    classroomActivities,
    officeFiles,
    nominalRolls,
    mdmLogs,
    activeCampaigns,
    notifications,
    gradeReports,
    attendanceRecords,
    ptConferences,
    users,
    schoolHub,
    schoolHubRows,
    studentActivityRows,
    studentActivities: studentActivityRows.map((row) => ({
      ...row,
      id: Number(row.id),
      reactions: JSON.parse(row.reactions || "{}"),
      comments: JSON.parse(row.comments || "[]"),
    })),
    examinations: gradeReports,
  };

  fs.writeFileSync(
    path.join(__dirname, "../src/lib/staticSnapshot.json"),
    JSON.stringify(snapshot, null, 2),
    "utf8"
  );
  console.log("Complete snapshot saved with", parsedStudents.length, "students.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
