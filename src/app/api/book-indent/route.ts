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

// GET: Fetch all book indents
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classParam = searchParams.get("classLevel");
    const yearParam = searchParams.get("academicYear");

    const whereClause: any = {};
    if (classParam && classParam !== "ALL") {
      whereClause.classLevel = parseInt(classParam);
    }
    if (yearParam) {
      whereClause.academicYear = yearParam;
    }

    const indents = await prisma.bookIndent.findMany({
      where: whereClause,
      orderBy: [
        { classLevel: "asc" },
        { subject: "asc" }
      ],
    });

    return NextResponse.json(indents);
  } catch (error) {
    console.error("GET Book Indents Error:", error);
    return NextResponse.json({ error: "Failed to fetch book indents" }, { status: 500 });
  }
}

// POST: Add new textbook indent (single or bulk)
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        if (!item.academicYear || !item.classLevel || !item.subject || item.requiredQty === undefined) {
          continue; // Skip malformed item in batch
        }

        const reqQty = parseInt(item.requiredQty || "0");
        const availQty = parseInt(item.availableQty || "0");
        const indQty = Math.max(0, reqQty - availQty);
        const recQty = parseInt(item.receivedQty || "0");
        const balQty = Math.max(0, indQty - recQty);

        // Check if indent already exists for academicYear, classLevel, subject
        const existing = await prisma.bookIndent.findFirst({
          where: {
            academicYear: item.academicYear,
            classLevel: parseInt(item.classLevel),
            subject: item.subject,
          },
        });

        if (existing) {
          const updated = await prisma.bookIndent.update({
            where: { id: existing.id },
            data: {
              requiredQty: reqQty,
              availableQty: availQty,
              indentedQty: indQty,
              receivedQty: recQty,
              balanceQty: balQty,
            },
          });
          results.push(updated);
        } else {
          const created = await prisma.bookIndent.create({
            data: {
              academicYear: item.academicYear,
              classLevel: parseInt(item.classLevel),
              subject: item.subject,
              requiredQty: reqQty,
              availableQty: availQty,
              indentedQty: indQty,
              receivedQty: recQty,
              balanceQty: balQty,
            },
          });
          results.push(created);
        }
      }
      return NextResponse.json(results);
    }

    if (!data.academicYear || !data.classLevel || !data.subject || data.requiredQty === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reqQty = parseInt(data.requiredQty || "0");
    const availQty = parseInt(data.availableQty || "0");
    const indQty = Math.max(0, reqQty - availQty);
    const recQty = parseInt(data.receivedQty || "0");
    const balQty = Math.max(0, indQty - recQty);

    // Check if indent already exists for academicYear, classLevel, subject
    const existing = await prisma.bookIndent.findFirst({
      where: {
        academicYear: data.academicYear,
        classLevel: parseInt(data.classLevel),
        subject: data.subject,
      },
    });

    if (existing) {
      const updated = await prisma.bookIndent.update({
        where: { id: existing.id },
        data: {
          requiredQty: reqQty,
          availableQty: availQty,
          indentedQty: indQty,
          receivedQty: recQty,
          balanceQty: balQty,
        },
      });
      return NextResponse.json(updated);
    }

    const newIndent = await prisma.bookIndent.create({
      data: {
        academicYear: data.academicYear,
        classLevel: parseInt(data.classLevel),
        subject: data.subject,
        requiredQty: reqQty,
        availableQty: availQty,
        indentedQty: indQty,
        receivedQty: recQty,
        balanceQty: balQty,
      },
    });

    return NextResponse.json(newIndent);
  } catch (error: any) {
    console.error("POST Book Indent Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create book indent" }, { status: 500 });
  }
}

// PUT: Edit book indent
export async function PUT(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const reqQty = parseInt(data.requiredQty || "0");
    const availQty = parseInt(data.availableQty || "0");
    const indQty = Math.max(0, reqQty - availQty);
    const recQty = parseInt(data.receivedQty || "0");
    const balQty = Math.max(0, indQty - recQty);

    const updated = await prisma.bookIndent.update({
      where: { id: data.id },
      data: {
        academicYear: data.academicYear,
        classLevel: data.classLevel ? parseInt(data.classLevel) : undefined,
        subject: data.subject,
        requiredQty: reqQty,
        availableQty: availQty,
        indentedQty: indQty,
        receivedQty: recQty,
        balanceQty: balQty,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT Book Indent Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update book indent" }, { status: 500 });
  }
}

// DELETE: Delete book indent
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.bookIndent.delete({
      where: { id: parseInt(idParam) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Book Indent Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete book indent" }, { status: 500 });
  }
}
