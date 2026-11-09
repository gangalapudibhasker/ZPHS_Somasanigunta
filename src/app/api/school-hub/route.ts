import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

let hubInitialized = false;

const DEFAULT_HUB_DATA = {
  whatsappGroups: [
    {
      id: "wg-c6",
      classLevel: "Class 6",
      groupName: "ZPHS Somasanigunta - Class 6 Official Group",
      classTeacher: "Sri Layesetty Muneeswaraiah",
      adminPhone: "918555079452",
      inviteLink: "https://chat.whatsapp.com/ZPHSClass6Group2026",
      membersCount: 38,
      description: "Daily homework, attendance updates, and circulars for 6th Class students and parents.",
    },
    {
      id: "wg-c7",
      classLevel: "Class 7",
      groupName: "ZPHS Somasanigunta - Class 7 Official Group",
      classTeacher: "Smt. Muttaraju Venkata Jayaprada",
      adminPhone: "918555079452",
      inviteLink: "https://chat.whatsapp.com/ZPHSClass7Group2026",
      membersCount: 42,
      description: "Daily lessons, FA/SA exam schedules, and parent alerts for 7th Class.",
    },
    {
      id: "wg-c8",
      classLevel: "Class 8",
      groupName: "ZPHS Somasanigunta - Class 8 Official Group",
      classTeacher: "Sri Kallu Sreekrishna",
      adminPhone: "918555079452",
      inviteLink: "https://chat.whatsapp.com/ZPHSClass8Group2026",
      membersCount: 45,
      description: "NMMS scholarship coaching updates, digital classroom notes, and parent communication for 8th Class.",
    },
    {
      id: "wg-c9",
      classLevel: "Class 9",
      groupName: "ZPHS Somasanigunta - Class 9 Official Group",
      classTeacher: "Smt. Gunukula Haritha",
      adminPhone: "918555079452",
      inviteLink: "https://chat.whatsapp.com/ZPHSClass9Group2026",
      membersCount: 44,
      description: "Science lab activities, SA exam preparation, and attendance updates for 9th Class.",
    },
    {
      id: "wg-c10",
      classLevel: "Class 10 (SSC)",
      groupName: "ZPHS Somasanigunta - Class 10 Mission 10.0 GPA",
      classTeacher: "Smt. Shaik Shahida & Sri Sreeram Ravi Kumar",
      adminPhone: "918555079452",
      inviteLink: "https://chat.whatsapp.com/ZPHSClass10SSC2026",
      membersCount: 52,
      description: "SSC Public Exam study material, special class timings, Pre-Final alerts, and HM announcements.",
    },
    {
      id: "wg-smc",
      classLevel: "SMC & Parents",
      groupName: "ZPHS Somasanigunta - SMC & Village Parents Forum",
      classTeacher: "Sri Gangalapudi Bhaskar Reddy (Headmaster)",
      adminPhone: "918555079452",
      inviteLink: "https://chat.whatsapp.com/ZPHSSmcParents2026",
      membersCount: 115,
      description: "School Management Committee resolutions, MDM updates, and general school notices.",
    },
  ],
  events: [
    {
      id: "ev-1",
      title: "79th Independence Day & Cultural Celebrations",
      date: "2026-08-15",
      category: "NATIONAL_FESTIVAL",
      chiefGuest: "Sri B. Murali Krishna (SMC Chairperson) & Village Sarpanch",
      coordinator: "Sri Gangalapudi Bhaskar Reddy (Headmaster)",
      description: "Flag hoisting ceremony, march past by SPL & Class Leaders, patriotic songs, elocution competition prizes, and sweet distribution.",
      venue: "ZPHS Main Assembly Ground",
      status: "COMPLETED",
    },
    {
      id: "ev-2",
      title: "Mandal Level Science & Mathematics Exhibition",
      date: "2026-10-20",
      category: "ACADEMIC_FAIR",
      chiefGuest: "Mandal Educational Officer (MEO), Venkatagiri",
      coordinator: "Smt. Gunukula Haritha & Smt. Shaik Shahida",
      description: "Students from Classes 6 to 10 exhibited 24 working models on renewable energy, human physiology, and 3D geometry.",
      venue: "ZPHS Science & Math Laboratories",
      status: "COMPLETED",
    },
    {
      id: "ev-3",
      title: "National Education Day & Library Book Week",
      date: "2026-11-11",
      category: "ACADEMIC_EVENT",
      chiefGuest: "Sri Gangalapudi Bhaskar Reddy (Headmaster)",
      coordinator: "Sri Sreeram Ravi Kumar",
      description: "Essay writing, book review presentations, storytelling competitions, and 'We Love Reading' awards.",
      venue: "School Library & Seminar Hall",
      status: "UPCOMING",
    },
    {
      id: "ev-4",
      title: "Children's Day (Balala Dinotsavam) & Cultural Fest",
      date: "2026-11-14",
      category: "CULTURAL",
      chiefGuest: "SMC Committee & Village Elders",
      coordinator: "All Faculty Members",
      description: "Fancy dress, folk dance, drama skits, sports finals, and special festive lunch for all students.",
      venue: "ZPHS Open Auditorium",
      status: "UPCOMING",
    },
    {
      id: "ev-5",
      title: "Mega Parent-Teacher Conference & SA-1 Progress Review",
      date: "2026-11-20",
      category: "PTC_MEET",
      chiefGuest: "All Parents & SMC Members",
      coordinator: "Sri Gangalapudi Bhaskar Reddy (Headmaster)",
      description: "Distribution of SA-1 automated grade report cards, review of 10th Class special study hours, and health checkup camp.",
      venue: "Respective Classrooms (Classes 6 to 10)",
      status: "UPCOMING",
    },
  ],
  donors: [
    {
      id: "don-1",
      donorName: "Sri A. Prabhakar Reddy",
      occupation: "Educationist & Philanthropist, Somasanigunta",
      contributionType: "Infrastructure / RO Water Plant Support",
      itemOrDetails: "Contribution towards Solar RO Safe Drinking Water Plant & Stainless Steel Water Drums",
      amountValue: 50000,
      date: "2026-08-15",
      phone: "+91 98491 10022",
      remarks: "Honored during Independence Day celebrations for generous support to student health.",
    },
    {
      id: "don-2",
      donorName: "Old Students Association (1998-2005 Batch)",
      occupation: "ZPHS Somasanigunta Alumni",
      itemOrDetails: "20 Wooden Dual-Desk Benches & Public Address (PA) Sound System with Wireless Mics",
      contributionType: "Classroom Furniture & Audio System",
      amountValue: 45000,
      date: "2026-09-05",
      phone: "+91 94405 88990",
      remarks: "Donated on Teachers' Day in gratitude to the school.",
    },
    {
      id: "don-3",
      donorName: "Sri K. Venkata Subbaiah & Family",
      occupation: "Agriculturalist, Somasanigunta",
      contributionType: "Academic & Merit Prizes",
      itemOrDetails: "Dictionaries, Geometry Boxes & Cash Awards for SSC 10th Class Toppers",
      amountValue: 15000,
      date: "2026-06-15",
      phone: "+91 94901 33445",
      remarks: "Annual endowment sponsor for top-performing students.",
    },
    {
      id: "don-4",
      donorName: "Smt. R. Hymavathi & Mahila Samakhya Group",
      occupation: "Self-Help Group Leaders",
      contributionType: "Sports & SASA Garden",
      itemOrDetails: "Volleyball Nets, Kabaddi Mats, and 50 Fruit/Shade Saplings for School Campus",
      amountValue: 12000,
      date: "2026-10-02",
      phone: "+91 94401 88990",
      remarks: "Donated during Gandhi Jayanti Swachh Andhra drive.",
    },
  ],
  supportStaff: [
    {
      id: "st-1",
      name: "Vasamthamma",
      role: "School Aya",
      category: "AYA",
      qualification: "Experienced Campus Caretaker",
      phone: "+91 85550 79452",
      dutyTimings: "8:00 AM – 4:30 PM",
      responsibilities: "Campus sanitation, safe drinking water station maintenance, and assisting students.",
      status: "ACTIVE",
    },
    {
      id: "st-2",
      name: "Chalapathi",
      role: "Mid-Day Meal (MDM) Cook",
      category: "COOK",
      qualification: "Mid-Day Meal Cook",
      phone: "+91 85550 79452",
      dutyTimings: "8:30 AM – 3:00 PM",
      responsibilities: "Hygienic preparation and serving of Mid-Day Meals for students.",
      status: "ACTIVE",
    },
  ],
  leaders: {
    academicYear: "2026-2027",
    schoolLeaders: [
      {
        id: "spl-1",
        position: "School Pupil Leader (SPL)",
        studentName: "S. Rajesh Kumar",
        admissionNo: "ADM/2021/045",
        classLevel: "Class 10",
        rollNo: "101",
        duties: "Leads morning school assembly, coordinates student council discipline, and represents students in school events.",
      },
      {
        id: "spl-2",
        position: "Assistant School Pupil Leader (ASPL)",
        studentName: "K. Divya Sree",
        admissionNo: "ADM/2021/082",
        classLevel: "Class 10",
        rollNo: "102",
        duties: "Assists SPL, coordinates cultural & literary competitions, and oversees library reading hours.",
      },
      {
        id: "spl-3",
        position: "School Sports & Games Secretary",
        studentName: "T. Hari Prasad",
        admissionNo: "ADM/2022/103",
        classLevel: "Class 9",
        rollNo: "901",
        duties: "Manages sports equipment issue, playground line-marking, and Kabaddi/Kho-Kho practice drills.",
      },
      {
        id: "spl-4",
        position: "SASA Clean & Green Minister",
        studentName: "G. Tejaswini",
        admissionNo: "ADM/2022/125",
        classLevel: "Class 9",
        rollNo: "902",
        duties: "Oversees plastic-free campus checks, plant watering roster, and MDM handwash queue discipline.",
      },
    ],
    classLeaders: [
      {
        classLevel: "Class 10",
        classTeacher: "Sri Gangalapudi Bhaskar Reddy (HM) & Smt. Shaik Shahida",
        boyLeader: "N. Venkata Sai (Roll #103)",
        girlLeader: "K. Divya Sree (Roll #102)",
        strength: 28,
      },
      {
        classLevel: "Class 9",
        classTeacher: "Smt. Gunukula Haritha",
        boyLeader: "T. Hari Prasad (Roll #901)",
        girlLeader: "G. Tejaswini (Roll #902)",
        strength: 26,
      },
      {
        classLevel: "Class 8",
        classTeacher: "Sri Kallu Sreekrishna",
        boyLeader: "B. Tharun Kumar (Roll #802)",
        girlLeader: "P. Jyothi (Roll #801)",
        strength: 24,
      },
      {
        classLevel: "Class 7",
        classTeacher: "Smt. Muttaraju Venkata Jayaprada",
        boyLeader: "M. Siva Kumar (Roll #701)",
        girlLeader: "K. Bhavya Sri (Roll #702)",
        strength: 25,
      },
      {
        classLevel: "Class 6",
        classTeacher: "Sri Layesetty Muneeswaraiah",
        boyLeader: "Ch. Karthik (Roll #602)",
        girlLeader: "V. Swetha (Roll #601)",
        strength: 22,
      },
    ],
  },
  timetable: {
    "Class 10": [
      { day: "Monday", p1: "Mathematics (HM)", p2: "Physical Sci", p3: "English", p4: "Telugu", p5: "Bio Science", p6: "Social Studies", p7: "Hindi", p8: "SSC Special Study" },
      { day: "Tuesday", p1: "Physical Sci", p2: "Mathematics (HM)", p3: "Social Studies", p4: "English", p5: "Telugu", p6: "Bio Science (Lab)", p7: "Hindi", p8: "Math Remedial" },
      { day: "Wednesday", p1: "Mathematics (HM)", p2: "English", p3: "Physical Sci (Lab)", p4: "Social Studies", p5: "Hindi", p6: "Telugu", p7: "Bio Science", p8: "IFP Digital Quiz" },
      { day: "Thursday", p1: "Social Studies", p2: "Mathematics (HM)", p3: "Bio Science", p4: "Physical Sci", p5: "English", p6: "Telugu", p7: "Library", p8: "SSC Slip Test" },
      { day: "Friday", p1: "Mathematics (HM)", p2: "Physical Sci", p3: "Telugu", p4: "Bio Science", p5: "Social Studies", p6: "English", p7: "Hindi", p8: "Sports / Drill" },
      { day: "Saturday", p1: "Weekly Slip Test", p2: "Mathematics (HM)", p3: "Science Club", p4: "English", p5: "SASA Clean AP", p6: "Cultural / Quiz", p7: "Mass Drill", p8: "Half-Day Closure" },
    ],
    "Class 9": [
      { day: "Monday", p1: "Bio Science", p2: "Mathematics (HM)", p3: "Social Studies", p4: "English", p5: "Telugu", p6: "Physical Sci", p7: "Hindi", p8: "Sports / Games" },
      { day: "Tuesday", p1: "Mathematics (HM)", p2: "Bio Science", p3: "English", p4: "Physical Sci", p5: "Social Studies", p6: "Hindi", p7: "Telugu", p8: "Library Hour" },
      { day: "Wednesday", p1: "English", p2: "Social Studies", p3: "Mathematics (HM)", p4: "Bio Science (Lab)", p5: "Physical Sci", p6: "Telugu", p7: "Hindi", p8: "Math Lab" },
      { day: "Thursday", p1: "Physical Sci", p2: "English", p3: "Telugu", p4: "Mathematics (HM)", p5: "Bio Science", p6: "Social Studies", p7: "Hindi", p8: "IFP Smart Lesson" },
      { day: "Friday", p1: "Social Studies", p2: "Telugu", p3: "Physical Sci (Lab)", p4: "Mathematics (HM)", p5: "English", p6: "Bio Science", p7: "Hindi", p8: "Sports / Games" },
      { day: "Saturday", p1: "Telugu", p2: "English", p3: "Mathematics (HM)", p4: "Social Studies", p5: "SASA Activity", p6: "Literary Club", p7: "Mass Drill", p8: "Half-Day Closure" },
    ],
    "Class 8": [
      { day: "Monday", p1: "Social Studies", p2: "Telugu", p3: "Mathematics", p4: "Physical Sci", p5: "English", p6: "Hindi", p7: "Bio Science", p8: "NMMS Coaching" },
      { day: "Tuesday", p1: "English", p2: "Social Studies", p3: "Bio Science", p4: "Mathematics", p5: "Hindi", p6: "Telugu", p7: "Physical Sci", p8: "Sports" },
      { day: "Wednesday", p1: "Mathematics", p2: "Hindi", p3: "Telugu", p4: "English", p5: "Social Studies", p6: "Physical Sci", p7: "Bio Science", p8: "Library" },
      { day: "Thursday", p1: "Telugu", p2: "Mathematics", p3: "Physical Sci", p4: "Social Studies", p5: "Bio Science", p6: "English", p7: "Hindi", p8: "Math Lab" },
      { day: "Friday", p1: "Hindi", p2: "English", p3: "Social Studies", p4: "Telugu", p5: "Mathematics", p6: "Bio Science", p7: "Physical Sci", p8: "IFP Smart Class" },
      { day: "Saturday", p1: "Mathematics", p2: "Physical Sci", p3: "English", p4: "Bio Science", p5: "SASA Clean AP", p6: "Art & Craft", p7: "Mass Drill", p8: "Half-Day Closure" },
    ],
    "Class 7": [
      { day: "Monday", p1: "Hindi", p2: "English", p3: "Telugu", p4: "General Science", p5: "Mathematics", p6: "Social Studies", p7: "Library", p8: "Games" },
      { day: "Tuesday", p1: "Telugu", p2: "Mathematics", p3: "Social Studies", p4: "Hindi", p5: "General Science", p6: "English", p7: "Math Lab", p8: "Games" },
      { day: "Wednesday", p1: "General Science", p2: "Telugu", p3: "English", p4: "Mathematics", p5: "Hindi", p6: "Social Studies", p7: "IFP Digital", p8: "Art" },
      { day: "Thursday", p1: "Mathematics", p2: "General Science", p3: "Hindi", p4: "Telugu", p5: "English", p6: "Social Studies", p7: "Science Lab", p8: "Games" },
      { day: "Friday", p1: "English", p2: "Social Studies", p3: "Mathematics", p4: "General Science", p5: "Telugu", p6: "Hindi", p7: "We Love Reading", p8: "Sports" },
      { day: "Saturday", p1: "Social Studies", p2: "Hindi", p3: "Telugu", p4: "Mathematics", p5: "SASA Activity", p6: "Storytelling", p7: "Mass Drill", p8: "Half-Day Closure" },
    ],
    "Class 6": [
      { day: "Monday", p1: "Telugu", p2: "Mathematics", p3: "General Science", p4: "Social Studies", p5: "English", p6: "Hindi", p7: "Drawing", p8: "Games" },
      { day: "Tuesday", p1: "Mathematics", p2: "Telugu", p3: "Hindi", p4: "English", p5: "Social Studies", p6: "General Science", p7: "Library", p8: "Games" },
      { day: "Wednesday", p1: "English", p2: "General Science", p3: "Mathematics", p4: "Telugu", p5: "Hindi", p6: "Social Studies", p7: "Abacus / Math", p8: "Games" },
      { day: "Thursday", p1: "General Science", p2: "English", p3: "Social Studies", p4: "Mathematics", p5: "Telugu", p6: "Hindi", p7: "IFP Video Lesson", p8: "Games" },
      { day: "Friday", p1: "Social Studies", p2: "Hindi", p3: "Telugu", p4: "General Science", p5: "Mathematics", p6: "English", p7: "Moral Stories", p8: "Sports" },
      { day: "Saturday", p1: "Telugu", p2: "Mathematics", p3: "English", p4: "General Science", p5: "SASA Clean AP", p6: "Songs / Quiz", p7: "Mass Drill", p8: "Half-Day Closure" },
    ],
  },
  examSchedule: [
    { examCode: "FA-1", examName: "Formative Assessment - 1 (FA-1)", maxMarks: 20, month: "August 2026", status: "COMPLETED", classes: "Classes 6 to 10", weightage: "Slip Test (20M) + Project + Notebook + Participation" },
    { examCode: "FA-2", examName: "Formative Assessment - 2 (FA-2)", maxMarks: 20, month: "October 2026", status: "COMPLETED", classes: "Classes 6 to 10", weightage: "Slip Test (20M) + Lab Record + Written Work" },
    { examCode: "SA-1", examName: "Summative Assessment - 1 (SA-1 / Half-Yearly)", maxMarks: 100, month: "November 2026", status: "COMPLETED", classes: "Classes 6 to 10", weightage: "100 Marks per Subject (600 Total)" },
    { examCode: "FA-3", examName: "Formative Assessment - 3 (FA-3)", maxMarks: 20, month: "January 2027", status: "UPCOMING", classes: "Classes 6 to 10", weightage: "Slip Test (20M) + Project Work" },
    { examCode: "FA-4", examName: "Formative Assessment - 4 (FA-4)", maxMarks: 20, month: "February 2027", status: "UPCOMING", classes: "Classes 6 to 10", weightage: "Slip Test (20M) + Contemporary Issue" },
    { examCode: "PRE-FINAL", examName: "SSC Class 10 Pre-Final Examination", maxMarks: 100, month: "February / March 2027", status: "UPCOMING", classes: "Class 10 (SSC)", weightage: "100 Marks Full Syllabus Board Pattern" },
    { examCode: "SA-2", examName: "Summative Assessment - 2 (Annual / SSC Board)", maxMarks: 100, month: "March / April 2027", status: "UPCOMING", classes: "Classes 6 to 10", weightage: "100 Marks Annual Promotion / SSC Public Exam" },
  ],
  mdmMenu: [
    { day: "Monday", mainDish: "Hot Steamed Rice, Pappu Charu / Vegetable Sambar", supplement: "Boiled Egg & Peanut Jaggery Chikky", morningDrink: "Ragi Java (Finger Millet Malt)" },
    { day: "Tuesday", mainDish: "Pulihora (Tamarind Rice) & Tomato Pappu (Dal)", supplement: "Boiled Egg", morningDrink: "Ragi Java" },
    { day: "Wednesday", mainDish: "Hot Rice, Leafy Vegetable Dal & Potato Curry", supplement: "Boiled Egg & Peanut Chikky", morningDrink: "Ragi Java" },
    { day: "Thursday", mainDish: "Vegetable Pulao / Khichdi & Brinjal/Groundnut Chutney", supplement: "Boiled Egg", morningDrink: "Ragi Java" },
    { day: "Friday", mainDish: "Hot Steamed Rice, Sambar & Mixed Vegetable Curry", supplement: "Boiled Egg & Peanut Chikky", morningDrink: "Ragi Java" },
    { day: "Saturday", mainDish: "Hot Rice, Sweet Pongal (Paramannam) & Leafy Vegetable Dal", supplement: "Seasonal Fruit / Chikky", morningDrink: "Ragi Java" },
  ],
  googleSheetsConfig: {
    sheetUrl: "https://docs.google.com/spreadsheets/d/1BujOFaqIAwkv-FJowUR7VVQxxFeXOaH7p9Ftu-9dggE/edit",
    webhookUrl: "",
    lastSyncedAt: "2026-11-08",
    autoSyncEnabled: true,
  },
};

async function ensureHubTable() {
  if (hubInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SchoolHubStore" (
        "key" TEXT NOT NULL PRIMARY KEY,
        "value" TEXT NOT NULL,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const [key, val] of Object.entries(DEFAULT_HUB_DATA)) {
      const existing = await prisma.$queryRawUnsafe<any[]>(
        `SELECT "key" FROM "SchoolHubStore" WHERE "key" = ?`,
        key
      );
      if (!existing.length) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "SchoolHubStore" ("key", "value") VALUES (?, ?)`,
          key,
          JSON.stringify(val)
        );
      }
    }
    hubInitialized = true;
  } catch (err) {
    console.error("Failed to initialize SchoolHubStore:", err);
  }
}

export async function GET() {
  try {
    await ensureHubTable();
    const rows = await prisma.$queryRawUnsafe<Array<{ key: string; value: string }>>(
      `SELECT "key", "value" FROM "SchoolHubStore"`
    );
    const result: Record<string, any> = { ...DEFAULT_HUB_DATA };
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {}
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET School Hub Error:", error);
    return NextResponse.json(DEFAULT_HUB_DATA);
  }
}

export async function POST(request: Request) {
  try {
    await ensureHubTable();
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "SchoolHubStore" ("key", "value", "updatedAt")
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT("key") DO UPDATE SET "value" = excluded."value", "updatedAt" = CURRENT_TIMESTAMP`,
      String(key),
      JSON.stringify(value)
    );

    // Trigger non-blocking background sync to Google Sheets
    if (key !== "googleSheetsConfig") {
      fetch("http://localhost:3000/api/sync-gsheets", { method: "POST" }).catch(() => {});
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    console.error("POST School Hub Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update hub data" }, { status: 500 });
  }
}

