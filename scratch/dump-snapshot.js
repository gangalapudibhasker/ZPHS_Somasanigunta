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
  const smcActions = await prisma.smcActionItem.findMany({ orderBy: { id: "desc" } });

  const schoolHubPath = path.join(__dirname, "../prisma/school_hub.json");
  const schoolHub = fs.existsSync(schoolHubPath)
    ? JSON.parse(fs.readFileSync(schoolHubPath, "utf8"))
    : {};

  const activitiesPath = path.join(__dirname, "../prisma/student_activities.json");
  const studentActivities = fs.existsSync(activitiesPath)
    ? JSON.parse(fs.readFileSync(activitiesPath, "utf8"))
    : [];

  const examsPath = path.join(__dirname, "../prisma/examinations_marks.json");
  const examinations = fs.existsSync(examsPath)
    ? JSON.parse(fs.readFileSync(examsPath, "utf8"))
    : [];

  const snapshot = {
    students: parsedStudents,
    notices,
    gallery,
    smc: { members: smcMembers, proposals: smcProposals, actionItems: smcActions },
    schoolHub,
    studentActivities,
    examinations,
  };

  fs.writeFileSync(
    path.join(__dirname, "../src/lib/staticSnapshot.json"),
    JSON.stringify(snapshot, null, 2),
    "utf8"
  );
  console.log("Snapshot saved with", parsedStudents.length, "students.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
