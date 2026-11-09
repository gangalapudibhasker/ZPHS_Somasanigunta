import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

// Verify admin login
async function isAuthorized() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("zphs_session");
    if (!session) return false;
    return verifyToken(session.value) !== null;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Allow image uploads for student activities; require auth for non-image files
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
    if (!isImage) {
      const authorized = await isAuthorized();
      if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Create target directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 4. Generate a unique name
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    
    const uniqueFilename = `${baseName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 6)}${extension}`;
    
    const filePath = path.join(uploadDir, uniqueFilename);

    // 5. Write to local disk
    fs.writeFileSync(filePath, buffer);
    console.log(`Uploaded file saved to: ${filePath}`);

    // 6. Return relative URL path
    const fileUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: uniqueFilename,
      originalName
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
