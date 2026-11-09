import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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

// GET: Fetch nominal roll list
export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    const list = await prisma.nominalRoll.findMany({
      orderBy: { studentName: "asc" },
    });

    // Sanitize if not logged in
    const sanitized = list.map((item) => {
      if (admin) return item;
      return {
        ...item,
        aadhaarNumber: `XXXX-XXXX-${item.aadhaarNumber.slice(-4)}`,
        mobileNumber: `XXXXXX${item.mobileNumber.slice(-4)}`,
      };
    });

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("GET Nominal Roll Error:", error);
    return NextResponse.json({ error: "Failed to fetch nominal roll" }, { status: 500 });
  }
}

// POST: Add new entry
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.studentName || !data.admissionNumber || !data.dob || !data.gender || !data.fatherName || !data.motherName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.nominalRoll.findUnique({
      where: { admissionNumber: data.admissionNumber },
    });
    if (existing) {
      return NextResponse.json({ error: "Nominal roll entry already exists for this admission number" }, { status: 400 });
    }

    const entry = await prisma.nominalRoll.create({
      data: {
        studentName: data.studentName,
        fatherName: data.fatherName,
        motherName: data.motherName,
        parentOccupation: data.parentOccupation || "",
        mobileNumber: data.mobileNumber || "",
        aadhaarNumber: data.aadhaarNumber || "",
        caste: data.caste || "",
        communityCategory: data.communityCategory || "OC",
        religion: data.religion || "",
        nationality: data.nationality || "Indian",
        dob: data.dob,
        identificationMarks: data.identificationMarks || "",
        gender: data.gender,
        medium: "English", // Lock to English instruction medium as requested
        admissionNumber: data.admissionNumber,
        sscRollNumber: data.sscRollNumber || null,
        previousSchoolDetails: data.previousSchoolDetails || "",
        address: data.address || "",
        photo: data.photo || null,
        signature: data.signature || null,
      },
    });

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error("POST Nominal Roll Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create nominal roll entry" }, { status: 500 });
  }
}

// PUT: Edit entry
export async function PUT(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
    }

    // Verify unique admission number
    if (data.admissionNumber) {
      const existing = await prisma.nominalRoll.findUnique({
        where: { admissionNumber: data.admissionNumber },
      });
      if (existing && existing.id !== data.id) {
        return NextResponse.json({ error: "Admission number already registered in nominal roll" }, { status: 400 });
      }
    }

    const updated = await prisma.nominalRoll.update({
      where: { id: data.id },
      data: {
        studentName: data.studentName,
        fatherName: data.fatherName,
        motherName: data.motherName,
        parentOccupation: data.parentOccupation,
        mobileNumber: data.mobileNumber,
        aadhaarNumber: data.aadhaarNumber,
        caste: data.caste,
        communityCategory: data.communityCategory,
        religion: data.religion,
        nationality: data.nationality,
        dob: data.dob,
        identificationMarks: data.identificationMarks,
        gender: data.gender,
        medium: "English", // English instruction medium locked
        admissionNumber: data.admissionNumber,
        sscRollNumber: data.sscRollNumber,
        previousSchoolDetails: data.previousSchoolDetails,
        address: data.address,
        photo: data.photo,
        signature: data.signature,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT Nominal Roll Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update nominal roll entry" }, { status: 500 });
  }
}

// DELETE: Delete entry
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
    }

    await prisma.nominalRoll.delete({
      where: { id: parseInt(idParam) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Nominal Roll Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete entry" }, { status: 500 });
  }
}
