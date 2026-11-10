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

    // Allow safe document formats (PDF, Word, Excel, PPT, Text, Images) for school files & student activities
    const allowedExtensions = /\.(pdf|docx?|xlsx?|csv|pptx?|txt|rtf|jpe?g|png|webp|svg)$/i;
    const isAllowedFormat = allowedExtensions.test(file.name) || file.type.startsWith("image/") || file.type.startsWith("application/pdf");
    
    if (!isAllowedFormat) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, Word, Excel, PowerPoint, Text, or Image files." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Create target directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // 4. Generate a unique name
    const originalName = file.name;
    const extension = path.extname(originalName) || ".pdf";
    const baseName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    
    const uniqueFilename = `${baseName}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 6)}${extension}`;
    
    const filePath = path.join(uploadDir, uniqueFilename);

    // 5. Write to local disk, or fallback to Data URL if running in serverless read-only filesystem
    let fileUrl = `/uploads/${uniqueFilename}`;
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);
      console.log(`Uploaded file saved to: ${filePath}`);
    } catch (fsErr) {
      console.warn("Could not write to public/uploads, using base64 fallback:", fsErr);
      const mime = file.type || "application/octet-stream";
      fileUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    // 6. Return relative URL path or data URL
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
