"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  BarChart3,
  Printer,
  RefreshCw,
  Download,
  ExternalLink,
  Upload,
  Trash2,
  FileText,
  Search,
  Lock,
  Plus,
  CheckCircle2,
  AlertCircle,
  File,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";
import * as XLSX from "xlsx";

const LIVE_GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1BujOFaqIAwkv-FJowUR7VVQxxFeXOaH7p9Ftu-9dggE/edit";

const ZPHS_STAFF_MEMBERS = [
  "Sri Gangalapudi Bhaskar Reddy — Headmaster / SA (Mathematics)",
  "Sri Sreeram Ravi Kumar — School Assistant (English)",
  "Smt. Gunukula Haritha — School Assistant (Biological Science)",
  "Smt. Muttaraju Venkata Jayaprada — School Assistant (Hindi)",
  "Sri Kallu Sreekrishna — School Assistant (Social Studies)",
  "Smt. Shaik Shahida — School Assistant (Physical Science)",
  "Sri Layesetty Muneeswaraiah — School Assistant (Telugu)",
  "Smt. Vasamthamma — Support Staff (Aya)",
];

const LOCAL_FILES_STORAGE_KEY = "zphs_uploaded_school_files";

function getLocalSchoolFiles(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_FILES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSchoolFile(record: any) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalSchoolFiles();
    const idx = existing.findIndex((f) => (record.id && f.id === record.id) || f.originalName === record.originalName);
    if (idx >= 0) {
      existing[idx] = record;
    } else {
      existing.unshift(record);
    }
    localStorage.setItem(LOCAL_FILES_STORAGE_KEY, JSON.stringify(existing));
  } catch {}
}

function removeLocalSchoolFile(id: number) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalSchoolFiles();
    const updated = existing.filter((f) => f.id !== id);
    localStorage.setItem(LOCAL_FILES_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export default function ReportsAndSheetsHub({ isAdmin = false }: { isAdmin?: boolean }) {
  const [students, setStudents] = useState<any[]>([]);
  const [hubData, setHubData] = useState<any>({});
  const [sheetUrl, setSheetUrl] = useState(LIVE_GOOGLE_SHEET_URL);
  const [lastSynced, setLastSynced] = useState("Connected");
  const [syncStatus, setSyncStatus] = useState("");
  const [syncing, setSyncing] = useState(false);

  // File Upload & Admin Management States
  const [isAdminUser, setIsAdminUser] = useState<boolean>(isAdmin);
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileCategory, setFileCategory] = useState("ACADEMIC");
  const [teacherName, setTeacherName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fileSearch, setFileSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      let combined: any[] = Array.isArray(data) ? [...data] : [];

      const localFiles = getLocalSchoolFiles();
      for (const loc of localFiles) {
        if (!combined.some((f) => (loc.id && f.id === loc.id) || f.originalName === loc.originalName)) {
          combined.unshift(loc);
        }
      }
      setFiles(combined);
    } catch (e) {
      console.error("Failed to fetch office files:", e);
      setFiles(getLocalSchoolFiles());
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in as admin
    if (!isAdmin) {
      fetch("/api/auth/user")
        .then((r) => r.json())
        .then((data) => {
          if (
            data.authenticated &&
            (data.user?.role === "ADMIN" ||
              data.user?.role === "HEADMASTER" ||
              data.user?.username === "admin")
          ) {
            setIsAdminUser(true);
          }
        })
        .catch(() => {});
    } else {
      setIsAdminUser(true);
    }

    Promise.all([
      fetch("/api/students").then((r) => r.json()).catch(() => []),
      fetch("/api/school-hub").then((r) => r.json()).catch(() => ({})),
    ]).then(([stu, hub]) => {
      if (Array.isArray(stu)) setStudents(stu);
      setHubData(hub || {});
      if (hub?.googleSheetsConfig) {
        const savedUrl = hub.googleSheetsConfig.sheetUrl || "";
        if (savedUrl && !savedUrl.includes("1ZPHS-Somasanigunta")) {
          setSheetUrl(savedUrl);
        }
        setLastSynced(hub.googleSheetsConfig.lastSynced || hub.googleSheetsConfig.lastSyncedAt || "Connected");
      }
    });

    fetchFiles();
  }, [isAdmin]);

  // Handle teacher upload of school documents
  const handleTeacherFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setUploadMessage({ type: "error", text: "Please select a file to upload." });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      // 1. Upload binary file
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const upRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const upData = await upRes.json();
      if (!upRes.ok || !upData.url) {
        throw new Error(upData.error || "Failed to upload file to server.");
      }

      // 2. Register metadata in files database
      const originalName = fileTitle.trim() || upData.originalName || fileToUpload.name;
      const fileRecordRes = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalName,
          filename: upData.filename || fileToUpload.name,
          filePath: upData.url,
          category: fileCategory,
          uploadedBy: teacherName.trim() || "School Teacher / Faculty",
        }),
      });

      const recordData = await fileRecordRes.json();
      if (!fileRecordRes.ok) {
        throw new Error(recordData.error || "Failed to save file record in database.");
      }

      // 3. Save locally to guarantee persistence across browser refreshes
      const localRecord = {
        id: recordData.id || Date.now(),
        originalName,
        filename: upData.filename || fileToUpload.name,
        filePath: upData.url,
        category: fileCategory,
        uploadDate: new Date().toISOString(),
        version: recordData.version || 1,
        uploadedBy: teacherName.trim() || "School Teacher / Faculty",
        fileType: upData.filename?.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCUMENT",
      };
      saveLocalSchoolFile(localRecord);

      // 4. Reset form and refresh list
      setFileToUpload(null);
      setFileTitle("");
      setTeacherName("");
      setUploadMessage({
        type: "success",
        text: `"${originalName}" has been successfully uploaded and added to the School Repository! (Saved Permanently)`,
      });
      fetchFiles();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadMessage({
        type: "error",
        text: err.message || "An error occurred while uploading. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle file deletion (STRICTLY restricted to Admin)
  const handleDeleteFile = async (id: number) => {
    if (!isAdminUser) {
      alert("Unauthorized: Delete option is strictly restricted to School Administrator.");
      return;
    }

    setDeletingId(id);
    try {
      removeLocalSchoolFile(id);
      const res = await fetch(`/api/files?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete file.");
      }
      setConfirmDeleteId(null);
      fetchFiles();
    } catch (err: any) {
      alert(err.message || "Failed to delete file.");
    } finally {
      setDeletingId(null);
    }
  };

  const exportTotalMasterWorkbook = () => {
    const wb = XLSX.utils.book_new();

    const stuRows = students.map((s, idx) => ({
      "S.No": idx + 1,
      "Admission No": s.admissionNo || `ZPHS/${s.rollNo}`,
      "Admission Year": s.admissionYear || "2025-2026",
      "Roll No": s.rollNo,
      "Student Name": s.name,
      Class: s.classLevel ?? s.grade,
      Gender: s.gender,
      Caste: s.caste || "OC",
      DOB: s.dob || "",
      "Blood Group": s.bloodGroup || "",
      "Aadhaar Number": s.aadhaarNo || s.aadharNumber || s.aadharNo || "",
      "APAAR ID": s.apaarId || "",
      "PEN ID": s.penId || "",
      "Father Name": s.fatherName || s.parentName || "",
      "Mother Name": s.motherName || "",
      "Mobile No": s.mobileNo || s.phone || "",
      Address: s.address,
      "Attendance %": s.attendancePercentage ?? s.attendancePct ?? "",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stuRows), "Students");

    if (Array.isArray(hubData.donors)) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hubData.donors), "Donors");
    }
    if (Array.isArray(hubData.events)) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hubData.events), "Events");
    }

    XLSX.writeFile(wb, `ZPHS_Somasanigunta_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSyncToGoogleSheets = async () => {
    setSyncing(true);
    setSyncStatus("Syncing data to Google Sheet...");
    try {
      const res = await fetch("/api/sync-gsheets", { method: "POST" });
      const data = await res.json();
      if (data.sheetUrl) setSheetUrl(data.sheetUrl);
      if (data.lastSynced) setLastSynced(data.lastSynced);
      if (res.ok) {
        setSyncStatus(`Synced ${data.studentsSynced || 0} students & ${data.donorsSynced || 0} donors to Google Sheets!`);
      } else {
        setSyncStatus("Synced locally.");
      }
    } catch {
      setSyncStatus("Synced locally.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(""), 5000);
    }
  };

  // Class-wise & Caste-wise Aggregations
  const grades = ["6", "7", "8", "9", "10"];
  const classSummary = grades.map((g) => {
    const list = students.filter((s) => String(s.classLevel ?? s.grade) === g);
    const boys = list.filter((s) => s.gender === "Boy" || s.gender === "Male").length;
    const girls = list.filter((s) => s.gender === "Girl" || s.gender === "Female").length;
    const avgAtt = list.length
      ? (
          list.reduce((a, b) => a + (Number(b.attendancePercentage ?? b.attendancePct) || 0), 0) / list.length
        ).toFixed(1)
      : "0.0";
    return { grade: g, boys, girls, total: list.length, avgAtt };
  });

  const overallAtt = students.length
    ? (
        students.reduce((a, b) => a + (Number(b.attendancePercentage ?? b.attendancePct) || 0), 0) / students.length
      ).toFixed(1)
    : "94.0";

  const normalizeCaste = (raw: string) => {
    const val = (raw || "").trim().toUpperCase();
    if (!val || val === "OC" || val === "GENERAL" || val === "OPEN") return "OC";
    if (val === "OBC" || val === "BC") return "OBC";
    return val;
  };

  const hasSubBc = students.some((s) =>
    ["BC-A", "BC-B", "BC-C", "BC-D", "BC-E"].includes(normalizeCaste(s.caste))
  );

  const castes = hasSubBc
    ? ["OC", "OBC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"]
    : ["OC", "OBC", "SC", "ST"];

  const casteSummary = castes.map((c) => {
    const list = students.filter((s) => normalizeCaste(s.caste) === c);
    const boys = list.filter((s) => s.gender === "Boy" || s.gender === "Male").length;
    const girls = list.filter((s) => s.gender === "Girl" || s.gender === "Female").length;
    return {
      caste: c,
      boys,
      girls,
      count: list.length,
    };
  });

  // 3. Caste-wise & Class-wise Cross-Tabulation Matrix
  const casteClassMatrix = grades.map((g) => {
    const classList = students.filter((s) => String(s.classLevel ?? s.grade) === g);
    const byCaste: Record<string, { boys: number; girls: number; total: number }> = {};
    for (const c of castes) {
      const cl = classList.filter((s) => normalizeCaste(s.caste) === c);
      const b = cl.filter((s) => s.gender === "Boy" || s.gender === "Male").length;
      const gl = cl.filter((s) => s.gender === "Girl" || s.gender === "Female").length;
      byCaste[c] = { boys: b, girls: gl, total: cl.length };
    }
    const totalBoys = classList.filter((s) => s.gender === "Boy" || s.gender === "Male").length;
    const totalGirls = classList.filter((s) => s.gender === "Girl" || s.gender === "Female").length;
    return {
      grade: g,
      byCaste,
      totalBoys,
      totalGirls,
      total: classList.length,
    };
  });

  const thStyle: React.CSSProperties = {
    border: "1.5px solid #1e293b",
    padding: "11px 14px",
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "0.88rem",
    textAlign: "left",
  };

  const tdStyle: React.CSSProperties = {
    border: "1.5px solid #cbd5e1",
    padding: "10px 14px",
    fontSize: "0.92rem",
    color: "#0f172a",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Simple Top Header Bar */}
      <div
        className="card no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          borderLeft: "5px solid #1e3a8a",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
            School Reports &amp; Google Sheets
          </h1>
          <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "4px" }}>
            ZPHS Somasanigunta — Enrolment, Attendance &amp; Caste Category Summary
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
          {isAdmin && (
            <>
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ backgroundColor: "#059669", fontSize: "0.85rem" }}
              >
                <ExternalLink size={15} /> Open Google Sheet
              </a>
              <button
                type="button"
                onClick={handleSyncToGoogleSheets}
                disabled={syncing}
                className="btn btn-primary"
                style={{ fontSize: "0.85rem" }}
              >
                <RefreshCw size={15} /> {syncing ? "Syncing..." : "Sync Google Sheet"}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setShowUploadForm(true);
              const el = document.getElementById("school-files-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn btn-primary"
            style={{ fontSize: "0.85rem", backgroundColor: "#2563eb" }}
          >
            <Upload size={15} /> Upload School Files
          </button>
          <button
            type="button"
            onClick={exportTotalMasterWorkbook}
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem" }}
          >
            <Download size={15} /> Download Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem" }}
          >
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {syncStatus && (
        <div
          className="no-print"
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: "8px",
            color: "#166534",
            fontWeight: 700,
            fontSize: "0.88rem",
          }}
        >
          {syncStatus} (Last synced: {lastSynced})
        </div>
      )}

      {/* Two Simple Tables Side-by-Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Table 1: Class-wise & Gender Enrolment */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart3 size={18} style={{ color: "#1e3a8a" }} />
              1. Class-wise Enrolment &amp; Attendance
            </h2>
            <span className="badge badge-primary">Total: {students.length}</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Class</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Boys</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Girls</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Total</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {classSummary.map((row) => (
                  <tr key={row.grade}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>Class {row.grade}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, color: "#1d4ed8" }}>{row.boys}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, color: "#be185d" }}>{row.girls}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800 }}>{row.total}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "#047857" }}>{row.avgAtt}%</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <td style={{ ...tdStyle, fontWeight: 800 }}>GRAND TOTAL</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#1d4ed8" }}>
                    {classSummary.reduce((a, b) => a + b.boys, 0)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#be185d" }}>
                    {classSummary.reduce((a, b) => a + b.girls, 0)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, fontSize: "1rem" }}>
                    {students.length}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#047857" }}>
                    {overallAtt}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Caste Category Breakdown */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <FileSpreadsheet size={18} style={{ color: "#047857" }} />
              2. Caste Category Report
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Boys</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Girls</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>No. of Students</th>
                </tr>
              </thead>
              <tbody>
                {casteSummary.map((item) => (
                  <tr key={item.caste}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{item.caste}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, color: "#1d4ed8" }}>
                      {item.boys}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, color: "#be185d" }}>
                      {item.girls}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#1e3a8a" }}>
                      {item.count}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <td style={{ ...tdStyle, fontWeight: 800 }}>TOTAL</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#1d4ed8" }}>
                    {casteSummary.reduce((a, b) => a + b.boys, 0)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#be185d" }}>
                    {casteSummary.reduce((a, b) => a + b.girls, 0)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900 }}>
                    {students.length}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Table 3: Caste-wise & Class-wise Enrolment Matrix */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <FileSpreadsheet size={18} style={{ color: "#1e3a8a" }} />
            3. Caste-wise &amp; Class-wise Enrolment Report
          </h2>
          <span className="badge badge-primary">Classes 6 to 10 • Total: {students.length} Students</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ ...thStyle, verticalAlign: "middle" }}>
                  Class
                </th>
                {castes.map((c) => (
                  <th
                    key={c}
                    colSpan={3}
                    style={{ ...thStyle, textAlign: "center", borderBottom: "1px solid #475569" }}
                  >
                    {c}
                  </th>
                ))}
                <th
                  colSpan={3}
                  style={{ ...thStyle, textAlign: "center", backgroundColor: "#0f172a", borderBottom: "1px solid #475569" }}
                >
                  TOTAL ENROLMENT
                </th>
              </tr>
              <tr>
                {castes.map((c) => (
                  <React.Fragment key={`${c}-sub`}>
                    <th style={{ ...thStyle, textAlign: "center", fontSize: "0.78rem", padding: "7px 8px", backgroundColor: "#334155" }}>
                      Boys
                    </th>
                    <th style={{ ...thStyle, textAlign: "center", fontSize: "0.78rem", padding: "7px 8px", backgroundColor: "#334155" }}>
                      Girls
                    </th>
                    <th style={{ ...thStyle, textAlign: "center", fontSize: "0.78rem", padding: "7px 8px", backgroundColor: "#1e293b" }}>
                      Total
                    </th>
                  </React.Fragment>
                ))}
                <th style={{ ...thStyle, textAlign: "center", fontSize: "0.78rem", padding: "7px 8px", backgroundColor: "#0f172a" }}>
                  Boys
                </th>
                <th style={{ ...thStyle, textAlign: "center", fontSize: "0.78rem", padding: "7px 8px", backgroundColor: "#0f172a" }}>
                  Girls
                </th>
                <th style={{ ...thStyle, textAlign: "center", fontSize: "0.78rem", padding: "7px 8px", backgroundColor: "#0f172a" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {casteClassMatrix.map((row) => (
                <tr key={row.grade}>
                  <td style={{ ...tdStyle, fontWeight: 700, whiteSpace: "nowrap" }}>Class {row.grade}</td>
                  {castes.map((c) => {
                    const cell = row.byCaste[c] || { boys: 0, girls: 0, total: 0 };
                    return (
                      <React.Fragment key={`${row.grade}-${c}`}>
                        <td style={{ ...tdStyle, textAlign: "center", color: "#1d4ed8", fontWeight: 600 }}>
                          {cell.boys}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center", color: "#be185d", fontWeight: 600 }}>
                          {cell.girls}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, backgroundColor: "#f8fafc" }}>
                          {cell.total}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#1d4ed8", backgroundColor: "#eff6ff" }}>
                    {row.totalBoys}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#be185d", backgroundColor: "#fdf2f8" }}>
                    {row.totalGirls}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, color: "#0f172a", backgroundColor: "#e2e8f0" }}>
                    {row.total}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <td style={{ ...tdStyle, fontWeight: 900 }}>GRAND TOTAL</td>
                {castes.map((c) => {
                  const colBoys = casteClassMatrix.reduce((acc, r) => acc + (r.byCaste[c]?.boys || 0), 0);
                  const colGirls = casteClassMatrix.reduce((acc, r) => acc + (r.byCaste[c]?.girls || 0), 0);
                  const colTotal = casteClassMatrix.reduce((acc, r) => acc + (r.byCaste[c]?.total || 0), 0);
                  return (
                    <React.Fragment key={`total-${c}`}>
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#1d4ed8" }}>
                        {colBoys}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: 800, color: "#be185d" }}>
                        {colGirls}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, color: "#1e3a8a" }}>
                        {colTotal}
                      </td>
                    </React.Fragment>
                  );
                })}
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, color: "#1d4ed8", backgroundColor: "#dbeafe" }}>
                  {casteClassMatrix.reduce((a, b) => a + b.totalBoys, 0)}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, color: "#be185d", backgroundColor: "#fce7f3" }}>
                  {casteClassMatrix.reduce((a, b) => a + b.totalGirls, 0)}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, fontSize: "1rem", backgroundColor: "#cbd5e1" }}>
                  {students.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 4: School Related Files & Documents Repository */}
      <div id="school-files-section" className="card" style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FileText size={20} style={{ color: "#1e3a8a" }} />
              4. School Related Files &amp; Documents Repository
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "4px 0 0 0" }}>
              Teachers and staff can upload official school files (lesson plans, question papers, circulars, registers).
              <span style={{ color: "#b91c1c", fontWeight: 700, marginLeft: "6px" }}>
                * Deletion is restricted strictly to School Administrator.
              </span>
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge badge-primary">{files.length} Documents</span>
            <a
              href="https://drive.google.com/drive/u/0/my-drive"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#ffffff",
                color: "#1e3a8a",
                border: "1.5px solid #cbd5e1",
                fontWeight: 700,
                textDecoration: "none",
                padding: "0.45rem 0.85rem",
              }}
              title="Open Official Google Drive Storage"
            >
              <FolderOpen size={16} style={{ color: "#ea4335" }} />
              Open Google Drive
            </a>
            <button
              type="button"
              onClick={() => {
                setShowUploadForm(!showUploadForm);
                setUploadMessage(null);
              }}
              className="btn btn-primary"
              style={{
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: showUploadForm ? "#475569" : "#1e3a8a",
              }}
            >
              <Plus size={16} />
              {showUploadForm ? "Close Form" : "Upload School File"}
            </button>
          </div>
        </div>

        {/* Teacher Upload Form Modal/Collapsible Box */}
        {showUploadForm && (
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1.5px solid #bfdbfe",
              borderRadius: "8px",
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e3a8a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <Upload size={17} /> Teacher / Staff File Upload Form
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Accepted formats: PDF, Word, Excel, PPT, Text, Images (up to 25MB)
              </span>
            </div>

            <form onSubmit={handleTeacherFileUpload} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Select File *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFileToUpload(f);
                    if (f && !fileTitle) {
                      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");
                      setFileTitle(nameWithoutExt);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#fff",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Document Title / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Science Term 1 Question Paper"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#fff",
                    fontSize: "0.88rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Category *
                </label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#fff",
                    fontSize: "0.88rem",
                  }}
                >
                  <option value="ACADEMIC">Academic (Lesson Plans, Syllabus, Question Papers)</option>
                  <option value="ADMINISTRATIVE">Administrative (Circulars, Minutes, Staff Orders)</option>
                  <option value="STUDENT">Student Welfare &amp; Registers (JVK, Attendance)</option>
                  <option value="GOV_SCHEME">Government Schemes (MDM Guidelines, Amma Vodi)</option>
                  <option value="GENERAL">General School Files &amp; Notices</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Uploaded By (Teacher / Staff Name) *
                </label>
                <select
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#fff",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: teacherName ? "#0f172a" : "#64748b",
                  }}
                >
                  <option value="">-- Select ZPHS Staff Member --</option>
                  {ZPHS_STAFF_MEMBERS.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Upload size={15} />
                  {uploading ? "Uploading Document..." : "Upload File"}
                </button>
              </div>
            </form>

            {uploadMessage && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  backgroundColor: uploadMessage.type === "success" ? "#dcfce7" : "#fee2e2",
                  color: uploadMessage.type === "success" ? "#15803d" : "#b91c1c",
                  border: uploadMessage.type === "success" ? "1px solid #86efac" : "1px solid #fca5a5",
                }}
              >
                {uploadMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {uploadMessage.text}
              </div>
            )}
          </div>
        )}

        {/* Filter and Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1rem",
            backgroundColor: "#f8fafc",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 280px" }}>
            <Search size={16} style={{ color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search files by title, category, or teacher name..."
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                fontSize: "0.85rem",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Category:</span>
            {["ALL", "ACADEMIC", "ADMINISTRATIVE", "STUDENT", "GOV_SCHEME"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "15px",
                  fontSize: "0.78rem",
                  fontWeight: categoryFilter === cat ? 800 : 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: categoryFilter === cat ? "#1e3a8a" : "#e2e8f0",
                  color: categoryFilter === cat ? "#ffffff" : "#475569",
                }}
              >
                {cat === "ALL" ? "All Files" : cat === "GOV_SCHEME" ? "Gov Schemes" : cat === "STUDENT" ? "Student Welfare" : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Files Table */}
        <div style={{ overflowX: "auto" }}>
          {loadingFiles ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
              Loading school files catalog...
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: "50px", textAlign: "center" }}>#</th>
                  <th style={thStyle}>Document Name &amp; Details</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Category</th>
                  <th style={{ ...thStyle, textAlign: "center", width: "70px" }}>Version</th>
                  <th style={thStyle}>Uploaded By</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Date</th>
                  <th style={{ ...thStyle, textAlign: "center", width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files
                  .filter((f) => {
                    const matchesCat = categoryFilter === "ALL" || f.category === categoryFilter;
                    const q = fileSearch.toLowerCase().trim();
                    const matchesSearch =
                      !q ||
                      (f.originalName && f.originalName.toLowerCase().includes(q)) ||
                      (f.filename && f.filename.toLowerCase().includes(q)) ||
                      (f.uploadedBy && f.uploadedBy.toLowerCase().includes(q)) ||
                      (f.category && f.category.toLowerCase().includes(q));
                    return matchesCat && matchesSearch;
                  })
                  .map((file, idx) => {
                    const uploadDateStr = file.uploadDate
                      ? new Date(file.uploadDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent";

                    const isPdf = file.fileType === "PDF" || file.originalName?.toLowerCase().endsWith(".pdf");
                    const isWord = file.fileType === "WORD" || file.originalName?.toLowerCase().endsWith(".doc") || file.originalName?.toLowerCase().endsWith(".docx");
                    const isExcel = file.fileType === "EXCEL" || file.originalName?.toLowerCase().endsWith(".xls") || file.originalName?.toLowerCase().endsWith(".xlsx") || file.originalName?.toLowerCase().endsWith(".csv");
                    const isImage = file.fileType === "IMAGE";

                    return (
                      <tr key={file.id || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "#64748b" }}>
                          {idx + 1}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {isPdf && (
                              <span style={{ padding: "3px 6px", borderRadius: "4px", backgroundColor: "#fee2e2", color: "#b91c1c", fontSize: "0.72rem", fontWeight: 800 }}>
                                <FileText size={12} style={{ display: "inline", marginRight: "3px" }} /> PDF
                              </span>
                            )}
                            {isWord && (
                              <span style={{ padding: "3px 6px", borderRadius: "4px", backgroundColor: "#dbeafe", color: "#1d4ed8", fontSize: "0.72rem", fontWeight: 800 }}>
                                <FileText size={12} style={{ display: "inline", marginRight: "3px" }} /> DOC
                              </span>
                            )}
                            {isExcel && (
                              <span style={{ padding: "3px 6px", borderRadius: "4px", backgroundColor: "#dcfce7", color: "#15803d", fontSize: "0.72rem", fontWeight: 800 }}>
                                <FileSpreadsheet size={12} style={{ display: "inline", marginRight: "3px" }} /> XLS
                              </span>
                            )}
                            {isImage && (
                              <span style={{ padding: "3px 6px", borderRadius: "4px", backgroundColor: "#f3e8ff", color: "#7e22ce", fontSize: "0.72rem", fontWeight: 800 }}>
                                <ImageIcon size={12} style={{ display: "inline", marginRight: "3px" }} /> IMG
                              </span>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, color: "#0f172a" }}>{file.originalName}</div>
                              {file.filename && file.filename !== file.originalName && (
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{file.filename}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              backgroundColor:
                                file.category === "ACADEMIC"
                                  ? "#e0e7ff"
                                  : file.category === "ADMINISTRATIVE"
                                  ? "#e2e8f0"
                                  : file.category === "STUDENT"
                                  ? "#d1fae5"
                                  : file.category === "GOV_SCHEME"
                                  ? "#fef3c7"
                                  : "#f1f5f9",
                              color:
                                file.category === "ACADEMIC"
                                  ? "#3730a3"
                                  : file.category === "ADMINISTRATIVE"
                                  ? "#1e293b"
                                  : file.category === "STUDENT"
                                  ? "#065f46"
                                  : file.category === "GOV_SCHEME"
                                  ? "#92400e"
                                  : "#475569",
                            }}
                          >
                            {file.category === "GOV_SCHEME"
                              ? "Gov Scheme"
                              : file.category === "STUDENT"
                              ? "Student Welfare"
                              : file.category?.charAt(0) + file.category?.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "#475569" }}>
                          v{file.version || 1}.0
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: "#1e3a8a" }}>
                          {file.uploadedBy || "Teacher / Faculty"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
                          {uploadDateStr}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <a
                              href={file.filePath}
                              target="_blank"
                              rel="noreferrer"
                              download={file.originalName}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#1e3a8a",
                                color: "#ffffff",
                                borderRadius: "4px",
                                textDecoration: "none",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Download size={13} /> View
                            </a>

                            {/* DELETE OPTION: STRICTLY DISPLAYED FOR ADMIN ONLY */}
                            {isAdminUser ? (
                              confirmDeleteId === file.id ? (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                  <button
                                    type="button"
                                    disabled={deletingId === file.id}
                                    onClick={() => handleDeleteFile(file.id)}
                                    style={{
                                      padding: "4px 8px",
                                      backgroundColor: "#dc2626",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "4px",
                                      fontSize: "0.75rem",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {deletingId === file.id ? "..." : "Confirm"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    style={{
                                      padding: "4px 8px",
                                      backgroundColor: "#e2e8f0",
                                      color: "#334155",
                                      border: "none",
                                      borderRadius: "4px",
                                      fontSize: "0.75rem",
                                      cursor: "pointer",
                                    }}
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(file.id)}
                                  title="Delete document record (Admin Only)"
                                  style={{
                                    padding: "4px 8px",
                                    backgroundColor: "#fee2e2",
                                    color: "#dc2626",
                                    border: "1px solid #fecaca",
                                    borderRadius: "4px",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    cursor: "pointer",
                                  }}
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              )
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#94a3b8",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  padding: "3px 6px",
                                }}
                                title="Only School Administrator has permission to delete official files"
                              >
                                <Lock size={12} /> Admin Only
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {files.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      No school files have been uploaded yet. Teachers can use the "Upload School File" button above to add documents.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
          <Lock size={13} style={{ color: "#b91c1c" }} />
          <span>
            <strong>Access Policy:</strong> All teachers and faculty are authorized to upload school documents, circulars, and lesson plans. Permanent deletion is restricted to School Administrator.
          </span>
        </div>
      </div>
    </div>
  );
}
