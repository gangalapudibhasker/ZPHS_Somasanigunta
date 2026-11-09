import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

const SPREADSHEET_ID = "1BujOFaqIAwkv-FJowUR7VVQxxFeXOaH7p9Ftu-9dggE";
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

async function runGsheets(args: string[]) {
  const gsheetsBin = path.join(
    os.homedir(),
    ".gemini",
    "antigravity",
    "plugin_data",
    "gsheets",
    "bin",
    "gsheets-986250228.exe"
  );
  const cmd = fs.existsSync(gsheetsBin) ? gsheetsBin : "gsheets";
  return execFileAsync(cmd, args, { windowsHide: true });
}

export async function POST() {
  try {
    // 1. Fetch all live data from SQLite
    const students = await prisma.student.findMany({
      orderBy: [{ classLevel: "desc" }, { rollNo: "asc" }],
    });

    const hubRows = await prisma.$queryRawUnsafe<Array<{ key: string; value: string }>>(
      `SELECT "key", "value" FROM "SchoolHubStore"`
    ).catch(() => []);

    const hubMap: Record<string, any> = {};
    for (const r of hubRows) {
      try {
        hubMap[r.key] = JSON.parse(r.value);
      } catch {}
    }

    const donors = Array.isArray(hubMap.donors) ? hubMap.donors : [];
    const events = Array.isArray(hubMap.events) ? hubMap.events : [];

    // 2. Ensure sheets exist (Students, Donors, Events, Staff)
    try {
      await runGsheets(["mutate", "rename-sheet", SPREADSHEET_ID, "--sheet-id", "0", "--title", "Students"]);
    } catch {}
    for (const tab of ["Donors", "Events", "Staff"]) {
      try {
        await runGsheets(["mutate", "add-sheet", SPREADSHEET_ID, "--title", tab]);
      } catch {}
    }

    // 3. Build batch JSON
    const studentRows = [
      [
        "S.No",
        "Admission No",
        "Admission Year",
        "Roll No",
        "Student Name",
        "Class",
        "Gender",
        "Caste",
        "DOB",
        "Blood Group",
        "Aadhaar Number",
        "APAAR ID",
        "PEN ID",
        "Father Name",
        "Mother Name",
        "Mobile No",
        "Address",
        "Attendance %",
      ],
      ...students.map((s: any, i: number) => [
        String(i + 1),
        String(s.admissionNo || ""),
        String(s.admissionYear || "2025-2026"),
        String(s.rollNo || ""),
        String(s.name || ""),
        String(s.classLevel ?? ""),
        String(s.gender || ""),
        String(s.caste || "OC"),
        String(s.dob || ""),
        String(s.bloodGroup || ""),
        String(s.aadharNumber || ""),
        String(s.apaarId || ""),
        String(s.penId || ""),
        String(s.fatherName || s.parentName || ""),
        String(s.motherName || ""),
        String(s.phone || ""),
        String(s.address || ""),
        String(s.attendancePercentage ?? ""),
      ]),
    ];

    const donorRows = [
      ["S.No", "Date", "Donation Details", "Donation Amount (Rs.)", "In Whose Name", "Purpose / Spent For", "Related Images"],
      ...donors.map((d: any, i: number) => [
        String(i + 1),
        String(d.date || ""),
        String(d.donationDetails || d.donorName || d.name || ""),
        String(d.donationAmount ?? d.amountValue ?? d.estimatedValue ?? 0),
        String(d.inWhoseName || d.donorName || d.name || ""),
        String(d.spentFor || d.itemOrDetails || d.contribution || ""),
        Array.isArray(d.imageUrls) ? d.imageUrls.join(", ") : String(d.imageUrl || ""),
      ]),
    ];

    const eventRows = [
      ["S.No", "Date", "Event Title", "Category", "Chief Guest", "Venue", "Status", "Description"],
      ...events.map((ev: any, i: number) => [
        String(i + 1),
        String(ev.date || ""),
        String(ev.title || ""),
        String(ev.category || ""),
        String(ev.chiefGuest || ""),
        String(ev.venue || ""),
        String(ev.status || ""),
        String(ev.description || ""),
      ]),
    ];

    const staffRows = [
      ["S.No", "Name", "Role / Designation", "Qualifications", "Category"],
      ["1", "Sri Gangalapudi Bhaskar Reddy", "Headmaster / School Assistant (Mathematics)", "M.Phil(Maths), M.Sc(Maths), M.Ed., PG dip in Computers", "Teaching Faculty"],
      ["2", "Sri Sreeram Ravi Kumar", "School Assistant (English)", "", "Teaching Faculty"],
      ["3", "Smt. Gunukula Haritha", "School Assistant (Biological Science)", "", "Teaching Faculty"],
      ["4", "Smt. Muttaraju Venkata Jayaprada", "School Assistant (Hindi)", "", "Teaching Faculty"],
      ["5", "Sri Kallu Sreekrishna", "School Assistant (Social Studies)", "", "Teaching Faculty"],
      ["6", "Smt. Shaik Shahida", "School Assistant (Physical Science)", "", "Teaching Faculty"],
      ["7", "Sri Layesetty Muneeswaraiah", "School Assistant (Telugu)", "", "Teaching Faculty"],
      ["8", "Vasamthamma", "School Aya", "", "Support Staff (Aya)"],
      ["9", "Chalapathi", "Mid-Day Meal (MDM) Cook", "", "Support Staff (Cook)"],
    ];

    const batchPayload = [
      { op: "write", range: "Students!A1", data: studentRows },
      { op: "write", range: "Donors!A1", data: donorRows },
      { op: "write", range: "Events!A1", data: eventRows },
      { op: "write", range: "Staff!A1", data: staffRows },
    ];

    const tmpBatchFile = path.join(os.tmpdir(), `zphs_batch_${Date.now()}.json`);
    fs.writeFileSync(tmpBatchFile, JSON.stringify(batchPayload, null, 2));

    await runGsheets(["mutate", "batch", SPREADSHEET_ID, "-f", tmpBatchFile]);
    try {
      fs.unlinkSync(tmpBatchFile);
    } catch {}

    const nowStr = new Date().toLocaleString("en-IN");
    const cfg = {
      sheetUrl: SPREADSHEET_URL,
      webhookUrl: "",
      lastSynced: nowStr,
      lastSyncedAt: nowStr,
      autoSyncEnabled: true,
    };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "SchoolHubStore" ("key", "value", "updatedAt")
       VALUES ('googleSheetsConfig', ?, CURRENT_TIMESTAMP)
       ON CONFLICT("key") DO UPDATE SET "value" = excluded."value", "updatedAt" = CURRENT_TIMESTAMP`,
      JSON.stringify(cfg)
    );

    return NextResponse.json({
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      sheetUrl: SPREADSHEET_URL,
      lastSynced: nowStr,
      studentsSynced: students.length,
      donorsSynced: donors.length,
    });
  } catch (error: any) {
    console.error("Google Sheets Sync Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync to Google Sheets", sheetUrl: SPREADSHEET_URL },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
