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

// GET: Fetch files sorted by date (grouped/filtered by category if provided)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const searchQuery = searchParams.get("search") || "";

    const whereClause: any = {};
    if (categoryParam && categoryParam !== "ALL") {
      whereClause.category = categoryParam;
    }
    if (searchQuery) {
      whereClause.originalName = {
        contains: searchQuery,
      };
    }

    const files = await prisma.officeFile.findMany({
      where: whereClause,
      orderBy: { uploadDate: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("GET Files Error:", error);
    return NextResponse.json({ error: "Failed to fetch files catalog" }, { status: 500 });
  }
}

// POST: Add new office file link (allows teachers and staff to upload school files)
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    const data = await request.json();

    if (!data.originalName || !data.filePath || !data.category) {
      return NextResponse.json({ error: "Missing required file metadata" }, { status: 400 });
    }

    // Determine version history: find highest version of file with same originalName + category
    let nextVersion = 1;
    try {
      const matches = await prisma.officeFile.findMany({
        where: {
          originalName: data.originalName,
          category: data.category,
        },
        orderBy: { version: "desc" },
        take: 1,
      });
      nextVersion = matches.length > 0 ? (matches[0].version || 1) + 1 : 1;
    } catch {
      nextVersion = 1;
    }

    // Detect file type
    const lowerName = data.originalName.toLowerCase();
    let fileType = "PDF";
    if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
      fileType = "WORD";
    } else if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls") || lowerName.endsWith(".csv")) {
      fileType = "EXCEL";
    } else if (lowerName.endsWith(".pptx") || lowerName.endsWith(".ppt")) {
      fileType = "PPT";
    } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png") || lowerName.endsWith(".webp") || lowerName.endsWith(".svg")) {
      fileType = "IMAGE";
    } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".rtf")) {
      fileType = "DOCUMENT";
    }

    const uploadedBy =
      data.uploadedBy && data.uploadedBy.trim().length > 0
        ? data.uploadedBy.trim()
        : admin?.name || "Teacher / Faculty";

    const newFileRecord = await prisma.officeFile.create({
      data: {
        filename: data.filename || data.originalName,
        originalName: data.originalName,
        filePath: data.filePath,
        fileType,
        category: data.category,
        version: nextVersion,
        uploadedBy,
      },
    });

    return NextResponse.json(newFileRecord);
  } catch (error: any) {
    console.error("POST File Error:", error);
    return NextResponse.json({ error: error.message || "Failed to catalog file" }, { status: 500 });
  }
}

// DELETE: Delete office file record - ONLY FOR ADMIN
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || (admin.role !== "ADMIN" && admin.role !== "HEADMASTER" && admin.username !== "admin")) {
      return NextResponse.json(
        { error: "Forbidden: Deleting files is strictly restricted to School Administrator." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.officeFile.delete({
      where: { id: parseInt(idParam, 10) },
    });

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error: any) {
    console.error("DELETE File Error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove file record" }, { status: 500 });
  }
}
