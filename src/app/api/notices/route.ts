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

// GET: Fetch all notices
export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [
        { isPinned: "desc" },
        { date: "desc" }
      ],
    });
    return NextResponse.json(notices);
  } catch (error) {
    console.error("GET Notices Error:", error);
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

// POST: Add new notice
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.title || !data.date || !data.category || !data.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        title: data.title,
        date: data.date,
        category: data.category,
        content: data.content,
        isPinned: data.isPinned || false,
      },
    });

    return NextResponse.json(notice);
  } catch (error: any) {
    console.error("POST Notice Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create announcement" }, { status: 500 });
  }
}

// PUT: Edit notice
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

    const updated = await prisma.notice.update({
      where: { id: data.id },
      data: {
        title: data.title,
        date: data.date,
        category: data.category,
        content: data.content,
        isPinned: data.isPinned,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT Notice Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update announcement" }, { status: 500 });
  }
}

// DELETE: Delete notice
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

    await prisma.notice.delete({
      where: { id: parseInt(idParam) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Notice Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete announcement" }, { status: 500 });
  }
}
