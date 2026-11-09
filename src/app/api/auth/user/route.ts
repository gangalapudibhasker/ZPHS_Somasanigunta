import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("zphs_session");

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = verifyToken(sessionCookie.value);

    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: payload.userId,
        username: payload.username,
        name: payload.name,
        role: payload.role,
        studentAdmissionNo: payload.studentAdmissionNo || null,
      },
    });
  } catch (error) {
    console.error("Auth User API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
