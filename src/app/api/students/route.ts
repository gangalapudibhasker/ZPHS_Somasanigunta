import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Check if user is logged in
async function getAdminUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("zphs_session");
    if (!session) return null;
    return verifyToken(session.value);
  } catch {
    return null;
  }
}

// Ensure APAAR ID, PEN ID, Father Name, and Mother Name columns exist in SQLite DB
let columnsEnsured = false;
async function ensureStudentColumns() {
  if (columnsEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN "apaarId" TEXT DEFAULT ''`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN "penId" TEXT DEFAULT ''`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN "fatherName" TEXT DEFAULT ''`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN "motherName" TEXT DEFAULT ''`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN "caste" TEXT DEFAULT ''`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN "admissionYear" TEXT DEFAULT '2026-2027'`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN "admissionFormData" TEXT DEFAULT '{}'`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "Student" SET "fatherName" = "parentName" WHERE ("fatherName" IS NULL OR "fatherName" = '') AND "parentName" IS NOT NULL AND "parentName" != ''`
    );
  } catch {}
  columnsEnsured = true;
}

function inferAdmissionYear(admissionNo: string, storedYear?: string | null): string {
  if (storedYear && storedYear.trim()) return storedYear;
  const m = String(admissionNo).match(/20(\d{2})/);
  if (m) {
    const startYr = parseInt(`20${m[1]}`);
    return `${startYr}-${startYr + 1}`;
  }
  return "2026-2027";
}

const KNOWN_STUDENT_PHOTOS: Record<string, string> = {
  "ADM/2022/1001": "/images/students/bandi_subramanyam.jpg",
  "ADM/2022/1002": "/images/students/chata_subramanyam.jpg",
  "ADM/2022/1004": "/images/students/kantipalli_sathish_kumar.jpg",
  "ADM/2022/1005": "/images/students/nakkala_sowmya.jpg",
  "ADM/2022/1008": "/images/students/thokala_amar.jpg",
  "ADM/2022/1009": "/images/students/thoka_vikash.jpg",
  "ADM/2022/1010": "/images/students/thuraka_bhargavi.jpg",
  "ADM/2022/1012": "/images/students/yamala_venkatadri.jpg",
};

// GET: List all students
export async function GET(request: Request) {
  try {
    await ensureStudentColumns();
    const admin = await getAdminUser();
    const { searchParams } = new URL(request.url);
    const classLevelParam = searchParams.get("classLevel");

    const whereClause = classLevelParam && classLevelParam !== "ALL"
      ? { classLevel: parseInt(classLevelParam) }
      : {};

    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: [
        { classLevel: "asc" },
        { rollNo: "asc" }
      ],
    });

    const extraRows = await prisma.$queryRawUnsafe<
      Array<{
        id: number;
        apaarId: string | null;
        penId: string | null;
        fatherName: string | null;
        motherName: string | null;
        caste: string | null;
        admissionYear: string | null;
        admissionFormData: string | null;
      }>
    >(`SELECT "id", "apaarId", "penId", "fatherName", "motherName", "caste", "admissionYear", "admissionFormData" FROM "Student"`);
    const extraMap = new Map(extraRows.map((r) => [Number(r.id), r]));

    // Return full student details (including Aadhaar for official certificates/forms)
    const sanitizedStudents = students.map((s) => {
      const extra = extraMap.get(s.id);
      let parsedAdmissionFormData = {};
      if (extra?.admissionFormData) {
        try {
          parsedAdmissionFormData = JSON.parse(extra.admissionFormData);
        } catch {}
      }
      const photoUrl = s.photo || (s.admissionNo ? KNOWN_STUDENT_PHOTOS[s.admissionNo] : null) || null;
      return {
        ...s,
        photo: photoUrl,
        apaarId: extra?.apaarId || "",
        penId: extra?.penId || "",
        fatherName: extra?.fatherName || s.parentName || "",
        motherName: extra?.motherName || "",
        caste: extra?.caste || "",
        admissionYear: inferAdmissionYear(s.admissionNo, extra?.admissionYear),
        admissionFormData: parsedAdmissionFormData,
        aadhaarNo: s.aadhaarNo || "",
      };
    });

    return NextResponse.json(sanitizedStudents);
  } catch (error) {
    console.error("GET Students API Error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// POST: Add new student (single or bulk)
export async function POST(request: Request) {
  try {
    await ensureStudentColumns();
    const data = await request.json();

    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        if (!item.name || !item.admissionNo) {
          continue;
        }

        const existing = await prisma.student.findUnique({
          where: { admissionNo: String(item.admissionNo) },
        });

        const resolvedFather = item.fatherName !== undefined ? String(item.fatherName) : (item.parentName !== undefined ? String(item.parentName) : undefined);
        const resolvedMother = item.motherName !== undefined ? String(item.motherName) : undefined;
        const resolvedParent = resolvedFather || resolvedMother || (item.parentName !== undefined ? String(item.parentName) : undefined);

        if (existing) {
          const updated = await prisma.student.update({
            where: { id: existing.id },
            data: {
              name: String(item.name),
              rollNo: item.rollNo !== undefined && item.rollNo !== null ? String(item.rollNo) : existing.rollNo,
              classLevel: item.classLevel !== undefined && item.classLevel !== null ? parseInt(item.classLevel) : existing.classLevel,
              gender: item.gender !== undefined && item.gender !== null ? String(item.gender) : existing.gender,
              dob: item.dob !== undefined && item.dob !== null ? String(item.dob) : existing.dob,
              bloodGroup: item.bloodGroup !== undefined ? (item.bloodGroup ? String(item.bloodGroup) : null) : existing.bloodGroup,
              parentName: resolvedParent !== undefined ? resolvedParent : existing.parentName,
              mobileNo: item.mobileNo !== undefined ? String(item.mobileNo) : existing.mobileNo,
              address: item.address !== undefined ? String(item.address) : existing.address,
              aadhaarNo: item.aadhaarNo !== undefined ? String(item.aadhaarNo) : existing.aadhaarNo,
              academicPerformance: item.academicPerformance !== undefined ? String(item.academicPerformance) : existing.academicPerformance,
              attendancePercentage: item.attendancePercentage !== undefined ? parseFloat(item.attendancePercentage) : existing.attendancePercentage,
              coCurricular: item.coCurricular !== undefined ? String(item.coCurricular) : existing.coCurricular,
              sportsAchievements: item.sportsAchievements !== undefined ? String(item.sportsAchievements) : existing.sportsAchievements,
              generalNotes: item.generalNotes !== undefined ? String(item.generalNotes) : existing.generalNotes,
            },
          });
          if (item.apaarId !== undefined) {
            await prisma.$executeRawUnsafe(
              `UPDATE "Student" SET "apaarId" = ? WHERE "id" = ?`,
              String(item.apaarId || ""),
              existing.id
            );
          }
          if (item.penId !== undefined) {
            await prisma.$executeRawUnsafe(
              `UPDATE "Student" SET "penId" = ? WHERE "id" = ?`,
              String(item.penId || ""),
              existing.id
            );
          }
          if (resolvedFather !== undefined) {
            await prisma.$executeRawUnsafe(
              `UPDATE "Student" SET "fatherName" = ? WHERE "id" = ?`,
              resolvedFather,
              existing.id
            );
          }
          if (resolvedMother !== undefined) {
            await prisma.$executeRawUnsafe(
              `UPDATE "Student" SET "motherName" = ? WHERE "id" = ?`,
              resolvedMother,
              existing.id
            );
          }
          if (item.caste !== undefined) {
            await prisma.$executeRawUnsafe(
              `UPDATE "Student" SET "caste" = ? WHERE "id" = ?`,
              String(item.caste || ""),
              existing.id
            );
          }
          results.push(updated);
        } else {
          const created = await prisma.student.create({
            data: {
              name: String(item.name),
              admissionNo: String(item.admissionNo),
              rollNo: String(item.rollNo || "TBD"),
              classLevel: item.classLevel !== undefined && item.classLevel !== null ? parseInt(item.classLevel) : 6,
              gender: String(item.gender || "Male"),
              dob: String(item.dob || "2015-01-01"),
              bloodGroup: item.bloodGroup ? String(item.bloodGroup) : null,
              parentName: resolvedParent || "",
              mobileNo: item.mobileNo ? String(item.mobileNo) : "",
              address: item.address ? String(item.address) : "",
              aadhaarNo: item.aadhaarNo ? String(item.aadhaarNo) : "",
              academicPerformance: item.academicPerformance ? String(item.academicPerformance) : "Average",
              attendancePercentage: item.attendancePercentage !== undefined ? parseFloat(item.attendancePercentage) : 100.0,
              coCurricular: item.coCurricular ? String(item.coCurricular) : "",
              sportsAchievements: item.sportsAchievements ? String(item.sportsAchievements) : "",
              generalNotes: item.generalNotes ? String(item.generalNotes) : "",
              certificates: "[]",
            },
          });
          await prisma.$executeRawUnsafe(
            `UPDATE "Student" SET "apaarId" = ?, "penId" = ?, "fatherName" = ?, "motherName" = ?, "caste" = ? WHERE "id" = ?`,
            String(item.apaarId || ""),
            String(item.penId || ""),
            String(resolvedFather || ""),
            String(resolvedMother || ""),
            String(item.caste || ""),
            created.id
          );
          results.push(created);
        }
      }
      return NextResponse.json(results);
    }
    
    // Simple validation
    if (!data.name || !data.admissionNo || !data.rollNo || !data.classLevel || !data.gender || !data.dob) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if admission number is already taken
    const existing = await prisma.student.findUnique({
      where: { admissionNo: data.admissionNo },
    });
    if (existing) {
      return NextResponse.json({ error: "Admission number already exists" }, { status: 400 });
    }

    const fatherName = String(data.fatherName || data.parentName || "");
    const motherName = String(data.motherName || "");
    const caste = String(data.caste || "");
    const admissionYear = String(data.admissionYear || "2026-2027");

    const newStudent = await prisma.student.create({
      data: {
        name: data.name,
        admissionNo: data.admissionNo,
        rollNo: data.rollNo,
        classLevel: parseInt(data.classLevel),
        gender: data.gender,
        dob: data.dob,
        bloodGroup: data.bloodGroup || null,
        parentName: fatherName || motherName || "",
        mobileNo: data.mobileNo || "",
        address: data.address || "",
        aadhaarNo: data.aadhaarNo || "",
        academicPerformance: data.academicPerformance || "Average",
        attendancePercentage: parseFloat(data.attendancePercentage || "100"),
        coCurricular: data.coCurricular || "",
        sportsAchievements: data.sportsAchievements || "",
        generalNotes: data.generalNotes || "",
        certificates: data.certificates || "[]",
        photo: data.photo || null,
      },
    });

    const admissionFormJson =
      typeof data.admissionFormData === "string"
        ? data.admissionFormData
        : JSON.stringify(data.admissionFormData || {});

    await prisma.$executeRawUnsafe(
      `UPDATE "Student" SET "apaarId" = ?, "penId" = ?, "fatherName" = ?, "motherName" = ?, "caste" = ?, "admissionYear" = ?, "admissionFormData" = ? WHERE "id" = ?`,
      String(data.apaarId || ""),
      String(data.penId || ""),
      fatherName,
      motherName,
      caste,
      admissionYear,
      admissionFormJson,
      newStudent.id
    );

    fetch("http://localhost:3000/api/sync-gsheets", { method: "POST" }).catch(() => {});

    return NextResponse.json({
      ...newStudent,
      apaarId: String(data.apaarId || ""),
      penId: String(data.penId || ""),
      fatherName,
      motherName,
      caste,
      admissionYear,
      admissionFormData: data.admissionFormData || {},
    });
  } catch (error: any) {
    console.error("POST Student API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create student" }, { status: 500 });
  }
}

// PUT: Update student details
export async function PUT(request: Request) {
  try {
    await ensureStudentColumns();
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // Check unique admissionNo if changing
    if (data.admissionNo) {
      const existing = await prisma.student.findUnique({
        where: { admissionNo: data.admissionNo },
      });
      if (existing && existing.id !== data.id) {
        return NextResponse.json({ error: "Admission number is already in use by another student" }, { status: 400 });
      }
    }

    const fatherName = String(data.fatherName ?? data.parentName ?? "");
    const motherName = String(data.motherName ?? "");
    const caste = String(data.caste ?? "");
    const admissionYear = String(data.admissionYear || "2026-2027");

    const updated = await prisma.student.update({
      where: { id: data.id },
      data: {
        name: data.name,
        admissionNo: data.admissionNo,
        rollNo: data.rollNo,
        classLevel: data.classLevel ? parseInt(data.classLevel) : undefined,
        gender: data.gender,
        dob: data.dob,
        bloodGroup: data.bloodGroup,
        parentName: fatherName || motherName || data.parentName,
        mobileNo: data.mobileNo,
        address: data.address,
        aadhaarNo: data.aadhaarNo,
        academicPerformance: data.academicPerformance,
        attendancePercentage: data.attendancePercentage ? parseFloat(data.attendancePercentage) : undefined,
        coCurricular: data.coCurricular,
        sportsAchievements: data.sportsAchievements,
        generalNotes: data.generalNotes,
        certificates: data.certificates,
        photo: data.photo,
      },
    });

    const admissionFormJson =
      typeof data.admissionFormData === "string"
        ? data.admissionFormData
        : JSON.stringify(data.admissionFormData || {});

    await prisma.$executeRawUnsafe(
      `UPDATE "Student" SET "apaarId" = ?, "penId" = ?, "fatherName" = ?, "motherName" = ?, "caste" = ?, "admissionYear" = ?, "admissionFormData" = ? WHERE "id" = ?`,
      String(data.apaarId || ""),
      String(data.penId || ""),
      fatherName,
      motherName,
      caste,
      admissionYear,
      admissionFormJson,
      data.id
    );

    fetch("http://localhost:3000/api/sync-gsheets", { method: "POST" }).catch(() => {});

    return NextResponse.json({
      ...updated,
      apaarId: String(data.apaarId || ""),
      penId: String(data.penId || ""),
      fatherName,
      motherName,
      caste,
      admissionYear,
      admissionFormData: data.admissionFormData || {},
    });
  } catch (error: any) {
    console.error("PUT Student API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update student" }, { status: 500 });
  }
}

// DELETE: Remove student
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    await prisma.student.delete({
      where: { id: parseInt(idParam) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Student API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete student" }, { status: 500 });
  }
}
