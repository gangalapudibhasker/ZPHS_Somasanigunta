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

// GET: Fetch gallery records
export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { uploadDate: "desc" },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("GET Gallery Error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 });
  }
}

// POST: Add new gallery image record
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.title || !data.category || !data.filePath) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newImage = await prisma.galleryImage.create({
      data: {
        title: data.title,
        category: data.category,
        filePath: data.filePath,
      },
    });

    return NextResponse.json(newImage);
  } catch (error: any) {
    console.error("POST Gallery Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create gallery record" }, { status: 500 });
  }
}

// DELETE: Delete gallery image record
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

    await prisma.galleryImage.delete({
      where: { id: parseInt(idParam) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Gallery Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete gallery record" }, { status: 500 });
  }
}
