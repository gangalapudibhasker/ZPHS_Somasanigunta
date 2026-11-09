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

// GET: Fetch all SASA Activities
export async function GET() {
  try {
    const list = await prisma.sasaActivity.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error("GET SASA Error:", error);
    return NextResponse.json({ error: "Failed to fetch SASA activities" }, { status: 500 });
  }
}

// POST: Add new SASA Activity
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.title || !data.date || !data.category || !data.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newActivity = await prisma.sasaActivity.create({
      data: {
        title: data.title,
        date: data.date,
        category: data.category,
        description: data.description,
        beforePhoto: data.beforePhoto || null,
        afterPhoto: data.afterPhoto || null,
      },
    });

    return NextResponse.json(newActivity);
  } catch (error: any) {
    console.error("POST SASA Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create activity record" }, { status: 500 });
  }
}

// PUT: Edit SASA Activity
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

    const updated = await prisma.sasaActivity.update({
      where: { id: data.id },
      data: {
        title: data.title,
        date: data.date,
        category: data.category,
        description: data.description,
        beforePhoto: data.beforePhoto,
        afterPhoto: data.afterPhoto,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT SASA Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update activity record" }, { status: 500 });
  }
}

// DELETE: Delete SASA Activity
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

    await prisma.sasaActivity.delete({
      where: { id: parseInt(idParam) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE SASA Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete activity record" }, { status: 500 });
  }
}
