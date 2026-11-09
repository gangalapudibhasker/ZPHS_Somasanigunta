import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

let tableInitialized = false;

async function ensureActivitiesTable() {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StudentActivityPost" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "title" TEXT NOT NULL,
        "studentName" TEXT NOT NULL DEFAULT '',
        "classLevel" TEXT NOT NULL DEFAULT 'Class 10',
        "category" TEXT NOT NULL DEFAULT 'Academic',
        "description" TEXT NOT NULL DEFAULT '',
        "imageUrl" TEXT NOT NULL,
        "date" TEXT NOT NULL,
        "reactions" TEXT NOT NULL DEFAULT '{}',
        "comments" TEXT NOT NULL DEFAULT '[]',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const countResult = await prisma.$queryRawUnsafe<Array<{ count: number | bigint }>>(
      `SELECT COUNT(*) as count FROM "StudentActivityPost"`
    );
    const count = Number(countResult[0]?.count || 0);

    if (count === 0) {
      const seedPosts = [
        {
          title: "Interactive 3D Human Circulatory System Presentation",
          studentName: "S. Rajesh Kumar & K. Divya Sree",
          classLevel: "Class 10",
          category: "Academic / Smart IFP",
          description:
            "Class 10 students demonstrated the human heart double-circulation model on the Interactive Flat Panel (IFP) and conducted a live peer quiz.",
          imageUrl: "/images/ifp-friendly.png",
          date: "2026-10-28",
          reactions: JSON.stringify({ "👏": 14, "❤️": 11, "🌟": 9, "🏆": 6, "🎉": 5, "👍": 12 }),
          comments: JSON.stringify([
            {
              id: "c1",
              author: "Sri Gangalapudi Bhaskar Reddy (HM)",
              text: "Wonderful presentation by Class 10 students! Keep utilizing the IFP panels creatively. 🌟👏",
              createdAt: "2026-10-28 11:30 AM",
            },
            {
              id: "c2",
              author: "Smt. Gunukula Haritha (Bio Science)",
              text: "Very clear explanation of cardiac valves and blood flow! ❤️🏆",
              createdAt: "2026-10-28 02:15 PM",
            },
          ]),
        },
        {
          title: "Acid-Base Indicators & pH Scale Lab Experiment",
          studentName: "T. Hari Prasad & G. Tejaswini",
          classLevel: "Class 9",
          category: "Science & Innovation",
          description:
            "Hands-on chemistry laboratory activity testing natural and synthetic acid-base indicators and documenting color changes.",
          imageUrl: "/images/science-friendly.jpg",
          date: "2026-10-26",
          reactions: JSON.stringify({ "👏": 10, "❤️": 8, "🌟": 12, "🏆": 4, "🎉": 6, "👍": 9 }),
          comments: JSON.stringify([
            {
              id: "c3",
              author: "Smt. Shaik Shahida (Physical Science)",
              text: "Great lab discipline and accurate observation notes by everyone! 🔬🌟",
              createdAt: "2026-10-26 03:40 PM",
            },
          ]),
        },
        {
          title: "Pythagoras Theorem & 3D Geometry Model Activity",
          studentName: "B. Tharun Kumar & P. Jyothi",
          classLevel: "Class 8",
          category: "Mathematics Lab",
          description:
            "Students verified geometric theorems and surface area formulas using colorful wooden manipulatives in the Mathematics Lab.",
          imageUrl: "/images/math-friendly.jpg",
          date: "2026-10-24",
          reactions: JSON.stringify({ "👏": 16, "❤️": 9, "🌟": 11, "🏆": 7, "🎉": 8, "👍": 10 }),
          comments: JSON.stringify([
            {
              id: "c4",
              author: "Sri Gangalapudi Bhaskar Reddy (HM)",
              text: "Learning mathematics by doing builds lifelong conceptual clarity! 🏆📐",
              createdAt: "2026-10-24 04:10 PM",
            },
          ]),
        },
        {
          title: "Mandal Level Kabaddi & Kho-Kho Practice Drills",
          studentName: "ZPHS School Sports Team",
          classLevel: "All Classes",
          category: "Sports & Games",
          description:
            "Morning agility drills, team coordination exercises, and friendly tournament matches on the ZPHS Somasanigunta playground.",
          imageUrl: "/images/sports-friendly.jpg",
          date: "2026-10-22",
          reactions: JSON.stringify({ "👏": 19, "❤️": 15, "🌟": 10, "🏆": 13, "🎉": 9, "👍": 14 }),
          comments: JSON.stringify([
            {
              id: "c5",
              author: "Sri B. Murali Krishna (SMC Chair)",
              text: "Proud of our school sports champions! All the best for the upcoming tournament! 🏆🎉",
              createdAt: "2026-10-22 05:00 PM",
            },
          ]),
        },
      ];

      for (const p of seedPosts) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "StudentActivityPost" ("title", "studentName", "classLevel", "category", "description", "imageUrl", "date", "reactions", "comments")
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          p.title,
          p.studentName,
          p.classLevel,
          p.category,
          p.description,
          p.imageUrl,
          p.date,
          p.reactions,
          p.comments
        );
      }
    }

    tableInitialized = true;
  } catch (err) {
    console.error("Failed to initialize StudentActivityPost table:", err);
  }
}

function parseRow(row: any) {
  let reactions = { "👏": 0, "❤️": 0, "🌟": 0, "🏆": 0, "🎉": 0, "👍": 0 };
  let comments = [];
  try {
    reactions = { ...reactions, ...JSON.parse(row.reactions || "{}") };
  } catch {}
  try {
    comments = JSON.parse(row.comments || "[]");
  } catch {}
  return {
    id: Number(row.id),
    title: row.title,
    studentName: row.studentName,
    classLevel: row.classLevel,
    category: row.category,
    description: row.description,
    imageUrl: row.imageUrl,
    date: row.date,
    reactions,
    comments,
  };
}

export async function GET() {
  try {
    await ensureActivitiesTable();
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "StudentActivityPost" ORDER BY "id" DESC`
    );
    return NextResponse.json(rows.map(parseRow));
  } catch (error: any) {
    console.error("GET Student Activities Error:", error);
    return NextResponse.json({ error: "Failed to fetch student activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureActivitiesTable();
    const body = await request.json();

    // Action 1: Add Emoji Reaction
    if (body.action === "react") {
      const { id, emoji } = body;
      const rows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "StudentActivityPost" WHERE "id" = ?`,
        Number(id)
      );
      if (!rows.length) {
        return NextResponse.json({ error: "Activity not found" }, { status: 404 });
      }
      const parsed = parseRow(rows[0]);
      const currentCount = Number((parsed.reactions as any)[emoji] || 0);
      const updatedReactions = {
        ...parsed.reactions,
        [emoji]: currentCount + 1,
      };
      await prisma.$executeRawUnsafe(
        `UPDATE "StudentActivityPost" SET "reactions" = ? WHERE "id" = ?`,
        JSON.stringify(updatedReactions),
        Number(id)
      );
      return NextResponse.json({ ...parsed, reactions: updatedReactions });
    }

    // Action 2: Add Comment (with emojis)
    if (body.action === "comment") {
      const { id, author, text } = body;
      if (!text || !String(text).trim()) {
        return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
      }
      const rows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "StudentActivityPost" WHERE "id" = ?`,
        Number(id)
      );
      if (!rows.length) {
        return NextResponse.json({ error: "Activity not found" }, { status: 404 });
      }
      const parsed = parseRow(rows[0]);
      const now = new Date();
      const formattedTime = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      const newComment = {
        id: `c_${Date.now()}`,
        author: String(author || "Student / Visitor").trim() || "Student / Visitor",
        text: String(text).trim(),
        createdAt: formattedTime,
      };
      const updatedComments = [...parsed.comments, newComment];
      await prisma.$executeRawUnsafe(
        `UPDATE "StudentActivityPost" SET "comments" = ? WHERE "id" = ?`,
        JSON.stringify(updatedComments),
        Number(id)
      );
      return NextResponse.json({ ...parsed, comments: updatedComments });
    }

    // Action 3: Delete Comment
    if (body.action === "delete_comment") {
      const { id, commentId } = body;
      const rows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "StudentActivityPost" WHERE "id" = ?`,
        Number(id)
      );
      if (!rows.length) {
        return NextResponse.json({ error: "Activity not found" }, { status: 404 });
      }
      const parsed = parseRow(rows[0]);
      const updatedComments = parsed.comments.filter((c: any) => c.id !== commentId);
      await prisma.$executeRawUnsafe(
        `UPDATE "StudentActivityPost" SET "comments" = ? WHERE "id" = ?`,
        JSON.stringify(updatedComments),
        Number(id)
      );
      return NextResponse.json({ ...parsed, comments: updatedComments });
    }

    // Action 4: Create New Student Activity Post(s)
    const { title, studentName, classLevel, category, description, imageUrl, imageUrls, date } = body;
    const urls: string[] = Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls
      : imageUrl
      ? [imageUrl]
      : [];

    if (!title || urls.length === 0) {
      return NextResponse.json(
        { error: "Title and at least one uploaded image are required" },
        { status: 400 }
      );
    }

    const defaultReactions = JSON.stringify({ "👏": 1, "❤️": 0, "🌟": 0, "🏆": 0, "🎉": 0, "👍": 0 });
    const activityDate = date || new Date().toISOString().split("T")[0];

    for (const url of urls) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "StudentActivityPost" ("title", "studentName", "classLevel", "category", "description", "imageUrl", "date", "reactions", "comments")
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        String(title).trim(),
        String(studentName || "").trim(),
        String(classLevel || "Class 10"),
        String(category || "Academic"),
        String(description || "").trim(),
        String(url),
        activityDate,
        defaultReactions,
        "[]"
      );
    }

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "StudentActivityPost" ORDER BY "id" DESC`
    );
    return NextResponse.json(rows.map(parseRow));
  } catch (error: any) {
    console.error("POST Student Activities Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save activity" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureActivitiesTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
    }
    await prisma.$executeRawUnsafe(`DELETE FROM "StudentActivityPost" WHERE "id" = ?`, Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Student Activity Error:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}

