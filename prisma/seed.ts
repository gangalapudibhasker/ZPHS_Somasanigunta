import { prisma } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

async function main() {
  console.log("Starting comprehensive seed for ZPHS Somasanigunta...");

  // 1. Seed Multi-Role Users
  // Standard demo password for testing: "password123"
  const defaultHash = hashPassword("password123");
  const adminHash = hashPassword("admin@zphs2026");

  const users = [
    {
      username: "admin",
      passwordHash: adminHash,
      name: "Sri Gangalapudi Bhaskar Reddy (Headmaster)",
      role: "ADMIN",
      email: "hm.zphssomasanigunta@gmail.com",
      phone: "+91 85550 79452",
    },
    {
      username: "teacher_science",
      passwordHash: defaultHash,
      name: "Smt. K. Vani (Physical Science)",
      role: "TEACHER",
      email: "vani.science@zphssomasanigunta.in",
      phone: "+91 94401 55678",
    },
    {
      username: "teacher_maths",
      passwordHash: defaultHash,
      name: "Sri P. Ramanaiah (Mathematics)",
      role: "TEACHER",
      email: "ramanaiah.maths@zphssomasanigunta.in",
      phone: "+91 98480 33421",
    },
    {
      username: "parent_rajesh",
      passwordHash: defaultHash,
      name: "Sri S. Venkateswarlu (Parent)",
      role: "PARENT",
      email: "venkatesh.rajesh@gmail.com",
      phone: "9876543210",
      studentAdmissionNo: "ADM/2021/045",
    },
    {
      username: "parent_divya",
      passwordHash: defaultHash,
      name: "Sri K. Mohan Rao (Parent)",
      role: "PARENT",
      email: "mohanrao.divya@gmail.com",
      phone: "9440123456",
      studentAdmissionNo: "ADM/2021/082",
    },
    {
      username: "student_rajesh",
      passwordHash: defaultHash,
      name: "S. Rajesh Kumar (Class 10)",
      role: "STUDENT",
      email: "rajesh.adm045@student.zphs.in",
      phone: "9876543210",
      studentAdmissionNo: "ADM/2021/045",
    },
    {
      username: "student_divya",
      passwordHash: defaultHash,
      name: "K. Divya Sree (Class 10)",
      role: "STUDENT",
      email: "divya.adm082@student.zphs.in",
      phone: "9440123456",
      studentAdmissionNo: "ADM/2021/082",
    },
    {
      username: "smc_chairperson",
      passwordHash: defaultHash,
      name: "Sri B. Murali Krishna (SMC Chairperson)",
      role: "SMC",
      email: "murali.smc@zphssomasanigunta.in",
      phone: "+91 94405 88990",
    },
    {
      username: "smc_vicechair",
      passwordHash: defaultHash,
      name: "Smt K. Aruna (SMC Vice-Chairperson)",
      role: "SMC",
      email: "aruna.smc@zphssomasanigunta.in",
      phone: "+91 97012 44321",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: u,
      create: u,
    });
  }
  console.log("Seeded multi-role users (Admin, Teachers, Parents, Students, SMC)");

  // 2. Seed Students (Classes 6 to 10)
  await prisma.student.deleteMany();
  const students = [
    // Class 10
    {
      name: "S. Rajesh Kumar",
      admissionNo: "ADM/2021/045",
      rollNo: "101",
      classLevel: 10,
      gender: "Male",
      dob: "2011-04-12",
      bloodGroup: "O+",
      parentName: "S. Venkateswarlu",
      mobileNo: "9876543210",
      address: "Somasanigunta Village, Venkatagiri Mandal",
      aadhaarNo: "4321 8765 1209",
      academicPerformance: "Excellent",
      attendancePercentage: 96.5,
      coCurricular: "Science Quiz Club, Essay Writing (District Winner)",
      sportsAchievements: "Mandal level Kabaddi captain",
      generalNotes: "Consistently tops the class in Mathematics and Physical Science.",
      certificates: JSON.stringify(["District Science Fair 2025 1st Prize", "State Kabaddi Participation"]),
      photo: "/images/placeholders/student_male.svg",
    },
    {
      name: "K. Divya Sree",
      admissionNo: "ADM/2021/082",
      rollNo: "102",
      classLevel: 10,
      gender: "Female",
      dob: "2011-08-23",
      bloodGroup: "B+",
      parentName: "K. Mohan Rao",
      mobileNo: "9440123456",
      address: "Muppalla Street, Venkatagiri Mandal",
      aadhaarNo: "8765 1234 9012",
      academicPerformance: "Excellent",
      attendancePercentage: 98.4,
      coCurricular: "Classical Dance, Model UN participant, School Assembly Anchor",
      sportsAchievements: "District Level Chess Silver Medalist",
      generalNotes: "Aspiring to score 10.0 GPA in upcoming SSC Board examinations.",
      certificates: JSON.stringify(["AP State Merit Scholarship 2025", "Inter-school Debate Champion"]),
      photo: "/images/placeholders/student_female.svg",
    },
    {
      name: "N. Venkata Sai",
      admissionNo: "ADM/2021/110",
      rollNo: "103",
      classLevel: 10,
      gender: "Male",
      dob: "2011-02-14",
      bloodGroup: "A+",
      parentName: "N. Subbaiah",
      mobileNo: "9988112233",
      address: "Main Bazaar, Somasanigunta",
      aadhaarNo: "3344 5566 7788",
      academicPerformance: "Good",
      attendancePercentage: 91.2,
      coCurricular: "Art & Craft, Science Club",
      sportsAchievements: "High Jump 2nd position",
      generalNotes: "Hardworking student with steady improvement in English.",
      certificates: JSON.stringify([]),
      photo: "/images/placeholders/student_male.svg",
    },
    // Class 9
    {
      name: "T. Hari Prasad",
      admissionNo: "ADM/2022/103",
      rollNo: "901",
      classLevel: 9,
      gender: "Male",
      dob: "2012-01-15",
      bloodGroup: "A+",
      parentName: "T. Narayana",
      mobileNo: "9988776655",
      address: "Somasanigunta Village, Venkatagiri Mandal",
      aadhaarNo: "1234 5678 9012",
      academicPerformance: "Good",
      attendancePercentage: 89.0,
      coCurricular: "Folk Singing, School Choir lead",
      sportsAchievements: "Mandal level Kho-Kho participant",
      generalNotes: "Very active in sports and cultural activities.",
      certificates: JSON.stringify(["Mandal Cultural Festival Singing Winner"]),
      photo: "/images/placeholders/student_male.svg",
    },
    {
      name: "G. Tejaswini",
      admissionNo: "ADM/2022/125",
      rollNo: "902",
      classLevel: 9,
      gender: "Female",
      dob: "2012-06-19",
      bloodGroup: "AB+",
      parentName: "G. Penchalaiah",
      mobileNo: "9441122334",
      address: "Harijanawada, Somasanigunta",
      aadhaarNo: "5566 7788 9900",
      academicPerformance: "Excellent",
      attendancePercentage: 95.0,
      coCurricular: "Drawing, Elocution",
      sportsAchievements: "Volleyball team player",
      generalNotes: "Highly disciplined and attentive in smart classroom sessions.",
      certificates: JSON.stringify(["District Drawing Competition"]),
      photo: "/images/placeholders/student_female.svg",
    },
    // Class 8
    {
      name: "P. Jyothi",
      admissionNo: "ADM/2023/154",
      rollNo: "801",
      classLevel: 8,
      gender: "Female",
      dob: "2013-05-18",
      bloodGroup: "O-",
      parentName: "P. Ranga Reddy",
      mobileNo: "9550345678",
      address: "Reddy Street, Somasanigunta Village",
      aadhaarNo: "9012 3456 7890",
      academicPerformance: "Average",
      attendancePercentage: 88.5,
      coCurricular: "Craft Work, Gardening / SASA volunteer",
      sportsAchievements: "Athletics 100m running third place",
      generalNotes: "Receives remedial math support after regular classes.",
      certificates: JSON.stringify([]),
      photo: "/images/placeholders/student_female.svg",
    },
    {
      name: "B. Tharun Kumar",
      admissionNo: "ADM/2023/162",
      rollNo: "802",
      classLevel: 8,
      gender: "Male",
      dob: "2013-10-10",
      bloodGroup: "B+",
      parentName: "B. Srinivasulu",
      mobileNo: "9700112244",
      address: "Golla Veedhi, Somasanigunta",
      aadhaarNo: "8899 0011 2233",
      academicPerformance: "Good",
      attendancePercentage: 92.5,
      coCurricular: "Science Lab Assistant (Student Volunteer)",
      sportsAchievements: "Kabaddi raider",
      generalNotes: "Curious nature, eager to perform science experiments.",
      certificates: JSON.stringify([]),
      photo: "/images/placeholders/student_male.svg",
    },
    // Class 7
    {
      name: "M. Siva Kumar",
      admissionNo: "ADM/2024/201",
      rollNo: "701",
      classLevel: 7,
      gender: "Male",
      dob: "2014-11-05",
      bloodGroup: "AB+",
      parentName: "M. Krishna",
      mobileNo: "9123456789",
      address: "BC Colony, Somasanigunta Village",
      aadhaarNo: "6543 2109 8765",
      academicPerformance: "Good",
      attendancePercentage: 91.0,
      coCurricular: "Drama & Street Play, Library Book Club",
      sportsAchievements: "Cricket All-Rounder (School Junior Team)",
      generalNotes: "Excellent attendance record and punctual.",
      certificates: JSON.stringify([]),
      photo: "/images/placeholders/student_male.svg",
    },
    {
      name: "K. Bhavya Sri",
      admissionNo: "ADM/2024/218",
      rollNo: "702",
      classLevel: 7,
      gender: "Female",
      dob: "2014-03-21",
      bloodGroup: "A+",
      parentName: "K. Gurumoorthy",
      mobileNo: "9399887766",
      address: "Panchayat Road, Somasanigunta",
      aadhaarNo: "1122 3344 5566",
      academicPerformance: "Excellent",
      attendancePercentage: 97.0,
      coCurricular: "Telugu Poem Recitation, Rangoli",
      sportsAchievements: "Badminton single runner-up",
      generalNotes: "Shows great enthusiasm in IFP digital lessons.",
      certificates: JSON.stringify([]),
      photo: "/images/placeholders/student_female.svg",
    },
    // Class 6
    {
      name: "V. Swetha",
      admissionNo: "ADM/2025/250",
      rollNo: "601",
      classLevel: 6,
      gender: "Female",
      dob: "2015-09-30",
      bloodGroup: "A+",
      parentName: "V. Venkatesh",
      mobileNo: "9390234567",
      address: "Gram Panchayat Area, Somasanigunta",
      aadhaarNo: "7890 1234 5678",
      academicPerformance: "Excellent",
      attendancePercentage: 96.0,
      coCurricular: "Elocution, Storytelling",
      sportsAchievements: "Running 50m Junior winner",
      generalNotes: "Smooth transition from primary school, very active participant.",
      certificates: JSON.stringify([]),
      photo: "/images/placeholders/student_female.svg",
    },
    {
      name: "Ch. Karthik",
      admissionNo: "ADM/2025/255",
      rollNo: "602",
      classLevel: 6,
      gender: "Male",
      dob: "2015-07-14",
      bloodGroup: "O+",
      parentName: "Ch. Ramana",
      mobileNo: "9849223344",
      address: "Kummara Veedhi, Somasanigunta",
      aadhaarNo: "4455 6677 8899",
      academicPerformance: "Good",
      attendancePercentage: 93.5,
      coCurricular: "Clay Modeling, Math Lab Puzzles",
      sportsAchievements: "Kho-Kho junior defender",
      generalNotes: "Quick learner, enjoys math abacus exercises.",
      certificates: JSON.stringify([]),
      photo: "/images/placeholders/student_male.svg",
    },
  ];

  const createdStudents = [];
  for (const stud of students) {
    const s = await prisma.student.create({ data: stud });
    createdStudents.push(s);
  }
  console.log(`Seeded ${createdStudents.length} students across Classes 6 to 10`);

  // 3. Seed Attendance Records (Past 30 days)
  await prisma.attendanceRecord.deleteMany();
  const sampleDates = [
    "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09",
    "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16",
    "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23",
    "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29",
  ];

  for (const s of createdStudents) {
    for (let i = 0; i < sampleDates.length; i++) {
      const d = sampleDates[i];
      // Randomly simulate 93% present, 5% absent, 2% late
      const rand = (s.id * 17 + i * 13) % 100;
      let status = "PRESENT";
      let remarks = "Attended full day";
      if (rand < 5) {
        status = "ABSENT";
        remarks = "Informed medical leave";
      } else if (rand < 9) {
        status = "LATE";
        remarks = "Late by 15 mins due to bus delay";
      }

      await prisma.attendanceRecord.create({
        data: {
          studentId: s.id,
          admissionNo: s.admissionNo,
          classLevel: s.classLevel,
          date: d,
          status,
          session: "FULL_DAY",
          recordedBy: "Smt. K. Vani / Class Teacher",
          remarks,
        },
      });
    }
  }
  console.log("Seeded attendance tracking records for all students");

  // 4. Seed Automated Grade Reports (FA-1, FA-2, SA-1)
  await prisma.gradeReport.deleteMany();
  const examTerms = ["FA-1", "FA-2", "SA-1"];

  for (const s of createdStudents) {
    for (const exam of examTerms) {
      let base = s.academicPerformance === "Excellent" ? 88 : s.academicPerformance === "Good" ? 75 : 60;
      let telugu = Math.min(100, Math.round(base + (s.id % 5) * 2));
      let hindi = Math.min(100, Math.round(base - 4 + (s.id % 6) * 2));
      let english = Math.min(100, Math.round(base + (s.id % 4) * 3));
      let maths = Math.min(100, Math.round(base + 2 + (s.id % 7) * 2));
      let science = Math.min(100, Math.round(base + 3 + (s.id % 5) * 2));
      let social = Math.min(100, Math.round(base + 1 + (s.id % 4) * 2));

      const totalMarks = telugu + hindi + english + maths + science + social;
      const percentage = parseFloat(((totalMarks / 600) * 100).toFixed(1));

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

      let teacherRemarks = "";
      if (overallGrade === "A1") {
        teacherRemarks = "Outstanding academic mastery! Demonstrates analytical prowess and exemplary dedication.";
      } else if (overallGrade === "A2") {
        teacherRemarks = "Very good academic performance. Well focused and active in class discussions.";
      } else if (overallGrade === "B1" || overallGrade === "B2") {
        teacherRemarks = "Good comprehension. Consistent revision in Mathematics and Science will elevate score to A grade.";
      } else {
        teacherRemarks = "Satisfactory effort. Additional practice in numerical subjects will foster higher confidence.";
      }

      await prisma.gradeReport.create({
        data: {
          studentId: s.id,
          admissionNo: s.admissionNo,
          classLevel: s.classLevel,
          examName: exam,
          academicYear: "2026-2027",
          teluguMarks: telugu,
          hindiMarks: hindi,
          englishMarks: english,
          mathsMarks: maths,
          scienceMarks: science,
          socialMarks: social,
          totalMarks,
          maxMarks: 600,
          percentage,
          overallGrade,
          gpa,
          teacherRemarks,
          isPublished: true,
        },
      });
    }
  }
  console.log("Seeded automated grade reports across FA-1, FA-2, SA-1");

  // 5. Seed 15 School Management Committee (SMC) Members
  await prisma.smcMember.deleteMany();
  const smcMembers = [
    { memberNumber: 1, name: "Sri B. Murali Krishna", designation: "Chairperson", category: "PARENT", contactNo: "+91 94405 88990", photo: "/images/placeholders/student_male.svg" },
    { memberNumber: 2, name: "Smt K. Aruna", designation: "Vice-Chairperson", category: "PARENT", contactNo: "+91 97012 44321", photo: "/images/placeholders/student_female.svg" },
    { memberNumber: 3, name: "Sri Gangalapudi Bhaskar Reddy", designation: "Member Secretary (Headmaster)", category: "STAFF", contactNo: "+91 85550 79452", photo: "/images/placeholders/student_male.svg" },
    { memberNumber: 4, name: "Smt T. Lakshmi Devi", designation: "Parent Member (ST)", category: "PARENT", contactNo: "+91 99881 22334", photo: "/images/placeholders/student_female.svg" },
    { memberNumber: 5, name: "Sri P. Venkata Subbaiah", designation: "Parent Member (BC)", category: "PARENT", contactNo: "+91 94901 33445", photo: "/images/placeholders/student_male.svg" },
    { memberNumber: 6, name: "Smt G. Sarada", designation: "Parent Member (OC)", category: "PARENT", contactNo: "+91 98481 44556", photo: "/images/placeholders/student_female.svg" },
    { memberNumber: 7, name: "Sri D. Chengaiah", designation: "Parent Member (SC)", category: "PARENT", contactNo: "+91 93901 55667", photo: "/images/placeholders/student_male.svg" },
    { memberNumber: 8, name: "Smt S. Fathima", designation: "Parent Member (Minority)", category: "PARENT", contactNo: "+91 91211 66778", photo: "/images/placeholders/student_female.svg" },
    { memberNumber: 9, name: "Sri V. Guravaiah", designation: "Elected Ward Member (Gram Panchayat)", category: "PANCHAYAT", contactNo: "+91 97001 77889", photo: "/images/placeholders/student_male.svg" },
    { memberNumber: 10, name: "Smt R. Hymavathi", designation: "Mahila Samakhya (SHG) Leader", category: "WOMEN", contactNo: "+91 94401 88990", photo: "/images/placeholders/student_female.svg" },
    { memberNumber: 11, name: "Smt C. Radhamma", designation: "Anganwadi Worker", category: "COMMUNITY", contactNo: "+91 96521 99001", photo: "/images/placeholders/student_female.svg" },
    { memberNumber: 12, name: "Sri A. Prabhakar Reddy", designation: "Educationist & Philanthropist", category: "COMMUNITY", contactNo: "+91 98491 10022", photo: "/images/placeholders/student_male.svg" },
    { memberNumber: 13, name: "Sri K. Suresh Babu", designation: "Teacher Member (Physical Science)", category: "STAFF", contactNo: "+91 94411 20033", photo: "/images/placeholders/student_male.svg" },
    { memberNumber: 14, name: "Smt M. Sunitha", designation: "Teacher Member (English)", category: "STAFF", contactNo: "+91 99891 30044", photo: "/images/placeholders/student_female.svg" },
    { memberNumber: 15, name: "Sri N. Anjaneyulu", designation: "Panchayat Secretary (Ex-Officio)", category: "PANCHAYAT", contactNo: "+91 97031 40055", photo: "/images/placeholders/student_male.svg" },
  ];

  for (const m of smcMembers) {
    await prisma.smcMember.create({ data: m });
  }
  console.log("Seeded 15 School Management Committee members");

  // 6. Seed SMC Proposals, Meetings, Votes & Action Items
  await prisma.smcProposal.deleteMany();
  const proposals = [
    {
      proposalCode: "SMC-2026-001",
      title: "Installation of Solar-Powered RO Safe Drinking Water Plant",
      description: "Setup of 500 LPH RO water plant connected with school rooftop solar panel to ensure 100% pure fluoride-free drinking water for students and staff.",
      category: "DRINKING_WATER",
      budget: 120000,
      submittedBy: "Sri B. Murali Krishna (Chairperson)",
      submissionDate: "2026-09-10",
      votingDeadline: "2026-09-25",
      status: "APPROVED",
      yesCount: 14,
      noCount: 0,
      abstainCount: 1,
      totalQuorum: 15,
    },
    {
      proposalCode: "SMC-2026-002",
      title: "Classroom Ergonomic Dual-Desk Bench Furniture Procurement (Classes 6-8)",
      description: "Procurement of 40 heavy-duty wooden dual desks with bag hooks to replace aging benches and accommodate rising student enrollment.",
      category: "INFRASTRUCTURE",
      budget: 85000,
      submittedBy: "Sri Gangalapudi Bhaskar Reddy (Headmaster)",
      submissionDate: "2026-10-15",
      votingDeadline: "2026-11-10",
      status: "ACTIVE",
      yesCount: 11,
      noCount: 1,
      abstainCount: 1,
      totalQuorum: 15,
    },
    {
      proposalCode: "SMC-2026-003",
      title: "High-Speed BSNL Bharat Fiber & Smart IFP Annual Maintenance Setup",
      description: "Deploy 200 Mbps dedicated fiber internet connection to all 5 smart classroom IFPs and provide annual hardware maintenance coverage.",
      category: "DIGITAL_CLASSROOM",
      budget: 42000,
      submittedBy: "Sri K. Suresh Babu (Teacher Member)",
      submissionDate: "2026-10-20",
      votingDeadline: "2026-11-15",
      status: "ACTIVE",
      yesCount: 13,
      noCount: 0,
      abstainCount: 0,
      totalQuorum: 15,
    },
    {
      proposalCode: "SMC-2026-004",
      title: "Leveling & Fencing of Junior Kabaddi and Kho-Kho Sports Ground",
      description: "Grading red soil, leveling ground surface, installing perimeter protective mesh wire fencing, and procuring new volleyball nets.",
      category: "SPORTS",
      budget: 65000,
      submittedBy: "Sri V. Guravaiah (Ward Member)",
      submissionDate: "2026-10-22",
      votingDeadline: "2026-11-20",
      status: "ACTIVE",
      yesCount: 10,
      noCount: 2,
      abstainCount: 1,
      totalQuorum: 15,
    },
  ];

  for (const p of proposals) {
    await prisma.smcProposal.create({ data: p });
  }

  // Seed SMC Meetings
  await prisma.smcMeeting.deleteMany();
  await prisma.smcMeeting.create({
    data: {
      meetingNo: 1,
      date: "2026-09-20",
      time: "02:30 PM",
      location: "ZPHS Main Conference Room",
      title: "Quarterly School Development & Health Sanity Review",
      agenda: "1. Review of RO drinking water proposal\n2. Mid-Day Meal rice stock inspection\n3. SASA Clean Campus action schedule\n4. Parent feedback on digital IFP teaching",
      minutesSummary: "Unanimously approved Solar RO drinking water plant installation (Budget ₹1.2L). Headmaster briefed committee on JVK kit distribution 100% completion. Resolution passed to request Gram Panchayat for regular campus weed clearing.",
      attendeesCount: 15,
      status: "COMPLETED",
    },
  });
  await prisma.smcMeeting.create({
    data: {
      meetingNo: 2,
      date: "2026-10-25",
      time: "03:00 PM",
      location: "ZPHS Science Lab",
      title: "Mid-Term Review & Dual Desk Furniture Allocation",
      agenda: "1. Voting on Dual-Desk procurement\n2. Fiber internet connectivity for smart IFP panels\n3. Pre-Final exam preparation schedule for 10th class\n4. Sports Day ground preparation",
      minutesSummary: "Committee verified quotations from AP State Agro Industries and local carpenters for dual desks. Passed resolution to fast-track BSNL fiber connection for smart classrooms.",
      attendeesCount: 14,
      status: "COMPLETED",
    },
  });

  // Seed Action Items
  await prisma.smcActionItem.deleteMany();
  const actionItems = [
    {
      taskDescription: "Obtain water testing feasibility report from RWS (Rural Water Supply) department for RO plant",
      assignedTo: "Sri N. Anjaneyulu (Panchayat Secy)",
      targetDate: "2026-11-05",
      priority: "HIGH",
      status: "IN_PROGRESS",
      completionNotes: "Water sample sent to district lab at Gudur. Results expected within 3 days.",
    },
    {
      taskDescription: "Inspect sample dual-bench desk build quality and finalize vendor purchase order",
      assignedTo: "Sri B. Murali Krishna (Chairperson)",
      targetDate: "2026-11-12",
      priority: "HIGH",
      status: "PENDING",
      completionNotes: "",
    },
    {
      taskDescription: "Coordinate with BSNL Venkatagiri office for optical fiber cable trenching to computer lab",
      assignedTo: "Sri K. Suresh Babu (Teacher Member)",
      targetDate: "2026-11-08",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      completionNotes: "Line estimate approved; awaiting router dispatch.",
    },
    {
      taskDescription: "Organize parent-teacher conference for Class 10 board exam preparation strategy",
      assignedTo: "Sri Gangalapudi Bhaskar Reddy (Headmaster)",
      targetDate: "2026-11-15",
      priority: "HIGH",
      status: "IN_PROGRESS",
      completionNotes: "Circular prepared and parent schedule calendar uploaded.",
    },
  ];
  for (const item of actionItems) {
    await prisma.smcActionItem.create({ data: item });
  }
  console.log("Seeded SMC proposals, meetings, and action items");

  // 7. Seed Facility Notes & Classroom Activities (with images!)
  await prisma.facilityNote.deleteMany();
  const facilityNotes = [
    {
      facilityId: "ifp",
      title: "SCERT AP Digital Curriculum Loaded on All 5 Panels",
      content: "All five 75-inch IFP touch panels have been upgraded with 2026-27 revised SCERT AP interactive textbooks, Byju's supplementary modules, and GeoGebra simulation packages. Teachers must lock panels after 4:30 PM.",
      authorName: "Sri P. Ramanaiah",
      authorRole: "TEACHER",
      date: "2026-10-18",
    },
    {
      facilityId: "scilab",
      title: "Science Practical Chemical Reagents Replenished",
      content: "Acids (Dilute HCl, H2SO4), bases (NaOH), litmus indicators, and optical glass prisms delivered. Class 10 practical sessions scheduled every Tuesday and Thursday afternoon.",
      authorName: "Smt. K. Vani",
      authorRole: "TEACHER",
      date: "2026-10-22",
    },
    {
      facilityId: "mathlab",
      title: "New Trigonometry & Geometrical 3D Manipulatives Available",
      content: "Clinometer angle finders and 3D surface area geometric solids are placed in Cabinet B. Students are encouraged to use them during remedial hours.",
      authorName: "Sri P. Ramanaiah",
      authorRole: "TEACHER",
      date: "2026-10-15",
    },
    {
      facilityId: "library",
      title: "We Love Reading Campaign Books Cataloged",
      content: "Added 120 new English illustrated storybooks and National Book Trust science biographies. Student barcode lending cards issued to Classes 6 through 9.",
      authorName: "Smt. M. Sunitha",
      authorRole: "TEACHER",
      date: "2026-10-10",
    },
    {
      facilityId: "sports",
      title: "Mandal Kabaddi Tournament Selection Trials",
      content: "Daily morning fitness and practice drills from 7:45 AM to 8:30 AM under physical education teacher guidance. Good response from 8th and 9th boys and girls.",
      authorName: "Sri M. Srinivasulu",
      authorRole: "HEADMASTER",
      date: "2026-10-24",
    },
  ];
  for (const fn of facilityNotes) {
    await prisma.facilityNote.create({ data: fn });
  }

  // Seed Classroom Activities with Photos
  await prisma.classroomActivity.deleteMany();
  const activities = [
    {
      facilityId: "ifp",
      title: "Class 10 Biology: 3D Animated Human Circulatory System",
      description: "Students explored double circulation and heart valve mechanics on the Interactive Flat Panel with live touchscreen rotation and student quiz participation.",
      classLevel: 10,
      teacherName: "Smt. K. Vani",
      photoUrl: "/images/ifp-friendly.png",
      date: "2026-10-20",
    },
    {
      facilityId: "scilab",
      title: "Class 9 Chemistry: Acid-Base Neutralization Titration",
      description: "Hands-on experiment testing pH scale with blue/red litmus paper and phenolphthalein indicator. Every student documented observation notes.",
      classLevel: 9,
      teacherName: "Smt. K. Vani",
      photoUrl: "/images/science-friendly.jpg",
      date: "2026-10-23",
    },
    {
      facilityId: "mathlab",
      title: "Class 8 Mathematics: Pythagoras Theorem Tile Verification",
      description: "Visualizing square areas constructed on hypotenuse and legs of right-angled triangles using colored geometric wooden tiles.",
      classLevel: 8,
      teacherName: "Sri P. Ramanaiah",
      photoUrl: "/images/math-friendly.jpg",
      date: "2026-10-18",
    },
    {
      facilityId: "library",
      title: "Class 7 English: Guided Silent Reading & Vocabulary Journaling",
      description: "Weekly library period where students selected regional folklore tales in English, note down five new words, and drafted a 50-word synopsis.",
      classLevel: 7,
      teacherName: "Smt. M. Sunitha",
      photoUrl: "/images/library-friendly.jpg",
      date: "2026-10-16",
    },
    {
      facilityId: "sports",
      title: "Class 6 Physical Education: Agility Drills & Kho-Kho Practice",
      description: "Junior students learning zig-zag running, dodging, and team coordination techniques on the playground.",
      classLevel: 6,
      teacherName: "Sri M. Srinivasulu",
      photoUrl: "/images/sports-friendly.jpg",
      date: "2026-10-25",
    },
  ];
  for (const act of activities) {
    await prisma.classroomActivity.create({ data: act });
  }
  console.log("Seeded facility notes and classroom activities");

  // 8. Seed Parent-Teacher Conference (PTC) Slots
  await prisma.ptConference.deleteMany();
  const conferences = [
    {
      title: "Class 10 SSC Board Preparation & SA-1 Progress Review",
      date: "2026-11-05",
      timeSlot: "10:00 AM - 10:20 AM",
      teacherName: "Smt. K. Vani (Class 10 In-charge)",
      classLevel: 10,
      parentName: "Sri S. Venkateswarlu",
      studentAdmissionNo: "ADM/2021/045",
      studentName: "S. Rajesh Kumar",
      mode: "IN_PERSON",
      topic: "Review of Mathematics & Physical Science SA-1 marks and special coaching timing.",
      status: "BOOKED",
      meetingNotes: "Parent confirmed attendance.",
    },
    {
      title: "Class 10 Merit Progress & Competitive Exam Coaching",
      date: "2026-11-05",
      timeSlot: "10:30 AM - 10:50 AM",
      teacherName: "Smt. K. Vani (Class 10 In-charge)",
      classLevel: 10,
      parentName: "Sri K. Mohan Rao",
      studentAdmissionNo: "ADM/2021/082",
      studentName: "K. Divya Sree",
      mode: "IN_PERSON",
      topic: "Review of 10/10 GPA target plan and state scholarship documentation.",
      status: "BOOKED",
      meetingNotes: "Both parents attending.",
    },
    {
      title: "Class 9 Academic & Attendance Consultation",
      date: "2026-11-06",
      timeSlot: "02:00 PM - 02:20 PM",
      teacherName: "Sri P. Ramanaiah",
      classLevel: 9,
      mode: "PHONE",
      topic: "Quarterly attendance and science lab participation review.",
      status: "OPEN",
    },
    {
      title: "Class 8 Remedial Learning & Mathematics Consultation",
      date: "2026-11-06",
      timeSlot: "02:30 PM - 02:50 PM",
      teacherName: "Sri P. Ramanaiah",
      classLevel: 8,
      mode: "IN_PERSON",
      topic: "Remedial math worksheet progress discussion.",
      status: "OPEN",
    },
    {
      title: "Class 7 English Reading Fluency Consultation",
      date: "2026-11-07",
      timeSlot: "11:00 AM - 11:20 AM",
      teacherName: "Smt. M. Sunitha",
      classLevel: 7,
      mode: "VIRTUAL",
      topic: "Discussion on vocabulary building and library habits.",
      status: "OPEN",
    },
  ];
  for (const c of conferences) {
    await prisma.ptConference.create({ data: c });
  }
  console.log("Seeded parent-teacher conferences");

  // 9. Seed Active Campaigns & KPIs
  await prisma.activeCampaign.deleteMany();
  const campaigns = [
    {
      title: "100% Student Attendance Campaign",
      slug: "attendance-campaign",
      category: "ATTENDANCE",
      targetValue: 95.0,
      currentValue: 93.8,
      unit: "%",
      startDate: "2026-06-12",
      endDate: "2027-04-15",
      status: "ACTIVE",
      description: "State initiative to eliminate chronic absenteeism through daily SMS alerts to parents, midday meal encouragement, and monthly attendance hero badges.",
      kpis: JSON.stringify({
        totalDaysHeld: 72,
        class10Rate: "95.6%",
        class9Rate: "92.4%",
        class8Rate: "93.1%",
        class7Rate: "94.5%",
        class6Rate: "94.0%",
        parentAlertsDispatched: 342,
      }),
    },
    {
      title: "Mission 10.0 GPA - SSC Class 10 Excellence",
      slug: "ssc-excellence-campaign",
      category: "ACADEMIC_EXCELLENCE",
      targetValue: 100.0,
      currentValue: 94.2,
      unit: "%",
      startDate: "2026-07-01",
      endDate: "2027-03-31",
      status: "ACTIVE",
      description: "Targeting 100% first division pass rate and minimum 15 students achieving 10/10 GPA in SSC Public Examinations 2027.",
      kpis: JSON.stringify({
        totalCandidates: 60,
        currentAbove90: 24,
        remedialHoursDelivered: 120,
        mockExamsCompleted: 3,
        targetPassPercentage: "100%",
      }),
    },
    {
      title: "Smart Classroom Digital Pedagogy Adoption",
      slug: "digital-pedagogy-campaign",
      category: "DIGITAL_PEDAGOGY",
      targetValue: 20.0,
      currentValue: 18.5,
      unit: "Hours/Week",
      startDate: "2026-08-01",
      endDate: "2027-04-30",
      status: "ACTIVE",
      description: "Ensuring all 5 high-definition Interactive Flat Panels (IFP) are actively utilized for SCERT 3D simulations and audio-visual concept learning.",
      kpis: JSON.stringify({
        activePanels: 5,
        avgHoursPerClass: "3.7 hrs/day",
        interactiveModulesCompleted: 145,
        studentEngagementScore: "9.4/10",
      }),
    },
    {
      title: "Swachh Andhra - SASA Green & Clean Campus Drive",
      slug: "sasa-green-campus",
      category: "CLEAN_GREEN",
      targetValue: 100.0,
      currentValue: 85.0,
      unit: "Saplings",
      startDate: "2026-06-15",
      endDate: "2026-12-31",
      status: "ACTIVE",
      description: "Campus plantation, plastic-free zone enforcement, segregation of biodegradable wet/dry waste, and student green army squads.",
      kpis: JSON.stringify({
        treesPlanted: 85,
        compostPitActive: true,
        rainwaterHarvestingUnits: 2,
        cleanlinessRounds: 18,
      }),
    },
    {
      title: "Dokka Seethamma MDM 100% Nutrition Compliance",
      slug: "mdm-nutrition-campaign",
      category: "NUTRITION",
      targetValue: 100.0,
      currentValue: 99.4,
      unit: "%",
      startDate: "2026-06-12",
      endDate: "2027-04-30",
      status: "ACTIVE",
      description: "Nutritious hot cooked meals served daily with eggs 5 days/week, chikkies 3 days/week, and iron-rich ragi java.",
      kpis: JSON.stringify({
        mealsServedYTD: 14850,
        eggDistributionRate: "99.8%",
        chikkyDistributionRate: "99.1%",
        ragiJavaDistributionRate: "99.5%",
      }),
    },
  ];
  for (const camp of campaigns) {
    await prisma.activeCampaign.create({ data: camp });
  }
  console.log("Seeded active campaigns with real-time KPI metrics");

  // 10. Seed Notifications & Alerts
  await prisma.notification.deleteMany();
  const notifications = [
    {
      title: "SA-1 Automated Progress Cards Released",
      message: "Summative Assessment 1 (SA-1) computerized report cards are published. Parents can log in to view detailed marks and download official PDF grade sheets.",
      category: "PROGRESS",
      targetRole: "ALL",
      date: "2026-10-28",
      actionUrl: "/portfolios",
    },
    {
      title: "Parent-Teacher Conference Scheduling Open",
      message: "Parent-Teacher Conference slots for November 2026 are now open for online booking. Select your convenient 20-minute meeting window.",
      category: "EVENT",
      targetRole: "PARENT",
      date: "2026-10-27",
      actionUrl: "/portal/ptc",
    },
    {
      title: "SMC Emergency Vote Required: Proposal #SMC-2026-002",
      message: "All 15 School Management Committee members are requested to cast their vote on the Dual-Desk Bench Furniture Procurement before the deadline.",
      category: "SMC",
      targetRole: "SMC",
      date: "2026-10-26",
      actionUrl: "/portal/smc",
    },
    {
      title: "Attendance Alert: October Monthly Report Card Generated",
      message: "Classwise attendance analytics and monthly muster roll reports are generated. 93.8% aggregate school attendance achieved this month.",
      category: "ATTENDANCE",
      targetRole: "TEACHER",
      date: "2026-10-29",
      actionUrl: "/portal/attendance",
    },
    {
      title: "Class 10 SSC Board Examination Form Filling",
      message: "Nominal Roll verification for Class 10 candidates is open. Ensure Aadhaar names, father names, and caste categories match government records.",
      category: "EXAM",
      targetRole: "ALL",
      date: "2026-10-25",
      actionUrl: "/admin/nominal-roll",
    },
  ];
  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }
  console.log("Seeded system notifications and alerts");

  // 11. Seed Google Drive Sync Logs (Folder: "School Management data")
  await prisma.googleDriveSyncLog.deleteMany();
  const driveLogs = [
    {
      folderName: "School Management data",
      backupType: "FULL_EXPORT",
      payloadSizeKb: 842.5,
      scriptEndpointUrl: "https://script.google.com/macros/s/AKfycbz_zphs_somasanigunta_mock_endpoint/exec",
      syncStatus: "SUCCESS",
      recordCount: 420,
      details: "Automated snapshot uploaded to Google Drive folder 'School Management data' containing Students, Attendance, Grades, SMC, and MDM tables.",
    },
    {
      folderName: "School Management data",
      backupType: "ATTENDANCE",
      payloadSizeKb: 145.2,
      scriptEndpointUrl: "https://script.google.com/macros/s/AKfycbz_zphs_somasanigunta_mock_endpoint/exec",
      syncStatus: "SUCCESS",
      recordCount: 209,
      details: "Daily attendance logs synchronized with Google Drive Sheet 'ZPHS_Attendance_Log_2026'.",
    },
    {
      folderName: "School Management data",
      backupType: "GRADES",
      payloadSizeKb: 98.4,
      scriptEndpointUrl: "https://script.google.com/macros/s/AKfycbz_zphs_somasanigunta_mock_endpoint/exec",
      syncStatus: "SUCCESS",
      recordCount: 33,
      details: "SA-1 Grade sheets exported to Google Drive 'School Management data/Academic_Grades_2026'.",
    },
  ];
  for (const log of driveLogs) {
    await prisma.googleDriveSyncLog.create({ data: log });
  }
  console.log("Seeded Google Drive sync logs");

  console.log("Comprehensive seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
