import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("zphs_session");
    if (!session) return null;
    return verifyToken(session.value);
  } catch {
    return null;
  }
}

// GET: Notifications for current user role
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    const userRole = user?.role || "ALL";

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");

    const where: any = {
      OR: [
        { targetRole: "ALL" },
        { targetRole: userRole },
      ],
    };

    if (categoryParam && categoryParam !== "ALL") {
      where.category = categoryParam;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("GET Notifications Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST: Broadcast alert
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      title,
      message,
      category = "GENERAL",
      targetRole = "ALL",
      actionUrl,
    } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const notif = await prisma.notification.create({
      data: {
        title,
        message,
        category,
        targetRole,
        date: new Date().toISOString().split("T")[0],
        actionUrl: actionUrl || null,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      notification: notif,
    });
  } catch (error: any) {
    console.error("POST Notification Error:", error);
    return NextResponse.json({ error: error.message || "Failed to broadcast notification" }, { status: 500 });
  }
}

// PATCH: Mark notification as read
export async function PATCH(request: Request) {
  try {
    const { id, markAll = false } = await request.json();

    if (markAll) {
      await prisma.notification.updateMany({
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (id) {
      const updated = await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, notification: updated });
    }

    return NextResponse.json({ error: "ID or markAll required" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH Notification Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update notification" }, { status: 500 });
  }
}
