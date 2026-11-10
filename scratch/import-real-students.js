const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const path = require("path");

const prisma = new PrismaClient();

function parseClassLevel(rawClass, rawRoll) {
  const s = String(rawClass || "").trim().toUpperCase();
  if (s === "VI" || s === "6" || s === "6TH") return 6;
  if (s === "VII" || s === "7" || s === "7TH") return 7;
  if (s === "VIII" || s === "8" || s === "8TH") return 8;
  if (s === "IX" || s === "9" || s === "9TH") return 9;
  if (s === "X" || s === "10" || s === "10TH") return 10;
  const digits = parseInt(s.replace(/\D/g, ""), 10);
  if (digits >= 6 && digits <= 10) return digits;
  const r = parseInt(String(rawRoll || ""), 10);
  if (r >= 6 && r <= 10) return r;
  return 6;
}

function getDefaultDobForClass(classLevel, indexInClass) {
  // Approximate birth year based on class level in 2026
  const birthYearMap = {
    6: 2015,
    7: 2014,
    8: 2013,
    9: 2012,
    10: 2011,
  };
  const year = birthYearMap[classLevel] || 2014;
  const month = String(((indexInClass % 12) + 1)).padStart(2, "0");
  const day = String(((indexInClass * 3) % 27) + 1).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

function getAdmissionYearForClass(classLevel) {
  const startYearMap = {
    6: 2026,
    7: 2025,
    8: 2024,
    9: 2023,
    10: 2022,
  };
  const sy = startYearMap[classLevel] || 2026;
  return `${sy}-${sy + 1}`;
}

async function main() {
  const excelPath = path.join(__dirname, "../ZPHS_Admin_Students_List_Class_ALL (3).xlsx");
  const wb = XLSX.readFile(excelPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });

  console.log(`Loaded ${rows.length} rows from Excel.`);

  // Ensure columns exist
  const alterQueries = [
    `ALTER TABLE "Student" ADD COLUMN "apaarId" TEXT DEFAULT ''`,
    `ALTER TABLE "Student" ADD COLUMN "penId" TEXT DEFAULT ''`,
    `ALTER TABLE "Student" ADD COLUMN "fatherName" TEXT DEFAULT ''`,
    `ALTER TABLE "Student" ADD COLUMN "motherName" TEXT DEFAULT ''`,
    `ALTER TABLE "Student" ADD COLUMN "caste" TEXT DEFAULT ''`,
    `ALTER TABLE "Student" ADD COLUMN "admissionYear" TEXT DEFAULT '2026-2027'`,
    `ALTER TABLE "Student" ADD COLUMN "admissionFormData" TEXT DEFAULT '{}'`,
  ];
  for (const q of alterQueries) {
    try {
      await prisma.$executeRawUnsafe(q);
    } catch {}
  }

  // Clear old sample students and grade reports
  await prisma.gradeReport.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.student.deleteMany({});

  const classCounters = { 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
  const createdStudents = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row["Name"] || "").trim();
    if (!name) continue;

    const classLevel = parseClassLevel(row["Class"], row["Roll No"]);
    classCounters[classLevel] = (classCounters[classLevel] || 0) + 1;
    const rollSeq = classCounters[classLevel];

    // Roll number within class: e.g. 1, 2, 3...
    const rollNo = String(rollSeq);

    // Admission No: use provided or generate ADM/<entryYear>/<3-digit>
    const admissionYear = getAdmissionYearForClass(classLevel);
    const entryYear = admissionYear.split("-")[0];
    const rawAdm = String(row["Admission No"] || "").trim();
    const admissionNo = rawAdm || `ADM/${entryYear}/${classLevel}${String(rollSeq).padStart(2, "0")}`;

    const gender = String(row["Gender"] || "Male").trim();
    const caste = String(row["Caste"] || "").trim();
    const penId = String(row["PEN ID"] || "").trim();
    const apaarId = String(row["APAAR ID"] || "").trim();
    const fatherName = String(row["Father Name"] || "").trim();
    const motherName = String(row["Mother Name"] || "").trim();
    const parentName = fatherName || motherName || "Parent / Guardian";
    const dob = String(row["Date of Birth"] || "").trim() || getDefaultDobForClass(classLevel, rollSeq);
    const bloodGroup = String(row["Blood Group"] || "").trim() || null;
    const mobileNo = String(row["Mobile No"] || "").trim() || "";
    const address = String(row["Address"] || "").trim() || "Somasanigunta, Venkatagiri Mandal";
    const aadhaarNo = String(row["Aadhaar Number"] || "").trim() || "";
    const academicPerformance = String(row["Academic Performance"] || "").trim() || "Good";
    const attendancePercentage = row["Attendance %"]
      ? parseFloat(String(row["Attendance %"]).replace(/%/g, "")) || 94.0
      : 94.0;
    const coCurricular = String(row["Co-Curricular Activities"] || "").trim() || "";
    const sportsAchievements = String(row["Sports Achievements"] || "").trim() || "";
    const generalNotes = String(row["General Notes"] || "").trim() || "";

    const admissionFormData = {
      motherTongue: "Telugu",
      studentAadhaar: aadhaarNo,
      fatherName,
      fatherOccupation: "Agriculture",
      fatherAadhaar: "",
      fatherPhone: mobileNo,
      motherName,
      motherOccupation: "Homemaker",
      motherBankAc: "",
      motherAadhaar: "",
      bankNameBranch: "",
      ifscCode: "",
      micrCode: "",
      motherPhone: mobileNo,
      rationCardNo: "",
      residingWith: "Parents",
      guardianName: "",
      guardianOccupation: "",
      nationality: "Indian",
      state: "Andhra Pradesh",
      religion: "Hindu",
      caste,
      subCaste: "",
      residence: address,
      prevSchoolName: "MPPS Somasanigunta",
      prevSchoolCode: "28193503401",
      prevClassStudied: `${classLevel - 1}th Class`,
      prevMedium: "English",
      eligiblePromotion: "YES",
      daysAttended: "",
      tcNoAndDate: "",
      classJoined: `${classLevel}th`,
      mediumJoined: "English",
      childInfoNo: penId,
      firstLanguage: "Telugu",
      secondLanguage: "Hindi",
      idMark1: "",
      idMark2: "",
      remarks: generalNotes,
      orderClass: String(classLevel),
      orderMedium: "English",
      dateOfAdmission: `12-06-${entryYear}`,
    };

    const created = await prisma.student.create({
      data: {
        name,
        admissionNo,
        rollNo,
        classLevel,
        gender,
        dob,
        bloodGroup,
        parentName,
        mobileNo,
        address,
        aadhaarNo,
        academicPerformance,
        attendancePercentage,
        coCurricular,
        sportsAchievements,
        generalNotes,
        certificates: "[]",
      },
    });

    await prisma.$executeRawUnsafe(
      `UPDATE "Student" SET "apaarId" = ?, "penId" = ?, "fatherName" = ?, "motherName" = ?, "caste" = ?, "admissionYear" = ?, "admissionFormData" = ? WHERE "id" = ?`,
      apaarId,
      penId,
      fatherName,
      motherName,
      caste,
      admissionYear,
      JSON.stringify(admissionFormData),
      created.id
    );

    createdStudents.push({ ...created, fatherName, motherName, caste, penId, apaarId });
  }

  console.log("Class counts:", classCounters);
  console.log("Total students inserted:", createdStudents.length);

  // Also update SchoolHubStore leaders with real students and class strengths
  try {
    const leadersData = {
      academicYear: "2026-2027",
      schoolLeaders: [
        {
          id: "spl-1",
          position: "School Pupil Leader (SPL)",
          studentName: "BANDI SUBRAMANYAM",
          admissionNo: "ADM/2022/1001",
          classLevel: "Class 10",
          rollNo: "1",
          duties: "Leads morning school assembly, coordinates student council discipline, and represents students in school events.",
        },
        {
          id: "spl-2",
          position: "Assistant School Pupil Leader (ASPL)",
          studentName: "NAKKALA SOWMYA",
          admissionNo: "ADM/2022/1005",
          classLevel: "Class 10",
          rollNo: "5",
          duties: "Assists SPL, coordinates cultural & literary competitions, and oversees library reading hours.",
        },
        {
          id: "spl-3",
          position: "School Sports & Games Secretary",
          studentName: "BOLIGALA THARUN",
          admissionNo: "ADM/2023/901",
          classLevel: "Class 9",
          rollNo: "1",
          duties: "Manages sports equipment issue, playground line-marking, and Kabaddi/Kho-Kho practice drills.",
        },
        {
          id: "spl-4",
          position: "SASA Clean & Green Minister",
          studentName: "CHATA MOKSHITHA",
          admissionNo: "ADM/2023/903",
          classLevel: "Class 9",
          rollNo: "3",
          duties: "Oversees plastic-free campus checks, plant watering roster, and MDM handwash queue discipline.",
        },
      ],
      classLeaders: [
        {
          classLevel: "Class 10",
          classTeacher: "Sri Gangalapudi Bhaskar Reddy (HM) & Smt. Shaik Shahida",
          boyLeader: "BANDI SUBRAMANYAM (Roll #1)",
          girlLeader: "NAKKALA SOWMYA (Roll #5)",
          strength: classCounters[10] || 12,
        },
        {
          classLevel: "Class 9",
          classTeacher: "Smt. Gunukula Haritha",
          boyLeader: "BOLIGALA THARUN (Roll #1)",
          girlLeader: "CHATA MOKSHITHA (Roll #3)",
          strength: classCounters[9] || 15,
        },
        {
          classLevel: "Class 8",
          classTeacher: "Sri Kallu Sreekrishna",
          boyLeader: "ARAVA CHERRY (Roll #2)",
          girlLeader: "AMBATI MUNI BALANJALI (Roll #1)",
          strength: classCounters[8] || 6,
        },
        {
          classLevel: "Class 7",
          classTeacher: "Smt. Muttaraju Venkata Jayaprada",
          boyLeader: "ARAVA POORNESH (Roll #2)",
          girlLeader: "AMBATI ANJINI (Roll #1)",
          strength: classCounters[7] || 25,
        },
        {
          classLevel: "Class 6",
          classTeacher: "Sri Layesetty Muneeswaraiah",
          boyLeader: "GONUPALLI VENKATESWARLU (Roll #1)",
          girlLeader: "MANNETI VENKATADRI (Roll #2)",
          strength: classCounters[6] || 5,
        },
      ],
    };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "SchoolHubStore" ("key", "value", "updatedAt")
       VALUES ('leaders', ?, CURRENT_TIMESTAMP)
       ON CONFLICT("key") DO UPDATE SET "value" = excluded."value", "updatedAt" = CURRENT_TIMESTAMP`,
      JSON.stringify(leadersData)
    );
  } catch (e) {
    console.warn("Could not update SchoolHubStore leaders:", e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
