"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Printer,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
  Send,
  Calendar,
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  admissionNo: string;
  rollNo: string;
  classLevel: number;
  gender: string;
  photo?: string | null;
  parentName: string;
  mobileNo: string;
  attendancePercentage: number;
}

interface AttendanceEntry {
  studentId: number;
  admissionNo: string;
  classLevel: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks: string;
}

interface AttendanceManagerProps {
  initialStudents: Student[];
  userRole?: string;
  userName?: string;
}

export default function AttendanceManager({
  initialStudents,
  userRole = "TEACHER",
  userName = "Class Teacher",
}: AttendanceManagerProps) {
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [sessionType, setSessionType] = useState<string>("FULL_DAY");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"REGISTER" | "HISTORY">("REGISTER");
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  // Filter students by selected class
  const classStudents = students.filter((s) => s.classLevel === selectedClass);
  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.includes(searchQuery)
  );

  // Initialize entries when class or date changes
  useEffect(() => {
    fetchClassAttendance();
  }, [selectedClass, selectedDate]);

  const fetchClassAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/attendance?classLevel=${selectedClass}&date=${selectedDate}`
      );
      if (res.ok) {
        const data = await res.json();
        const recordsMap: Record<string, AttendanceEntry> = {};

        // Prepopulate class students with defaults or recorded values
        classStudents.forEach((stud) => {
          const found = data.records?.find(
            (r: any) => r.admissionNo === stud.admissionNo
          );
          recordsMap[stud.admissionNo] = {
            studentId: stud.id,
            admissionNo: stud.admissionNo,
            classLevel: stud.classLevel,
            status: found ? found.status : "PRESENT",
            remarks: found?.remarks || "",
          };
        });

        setEntries(recordsMap);
      }
    } catch (err) {
      console.error("Failed to load attendance records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (
    admissionNo: string,
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  ) => {
    setEntries((prev) => ({
      ...prev,
      [admissionNo]: {
        ...prev[admissionNo],
        status,
      },
    }));
  };

  const handleRemarksChange = (admissionNo: string, remarks: string) => {
    setEntries((prev) => ({
      ...prev,
      [admissionNo]: {
        ...prev[admissionNo],
        remarks,
      },
    }));
  };

  const markAllAs = (status: "PRESENT" | "ABSENT") => {
    const updated: Record<string, AttendanceEntry> = {};
    classStudents.forEach((stud) => {
      updated[stud.admissionNo] = {
        studentId: stud.id,
        admissionNo: stud.admissionNo,
        classLevel: stud.classLevel,
        status,
        remarks: status === "PRESENT" ? "Present in class" : "Uninformed absence",
      };
    });
    setEntries(updated);
  };

  const handleSaveAttendance = async () => {
    const payload = Object.values(entries).map((entry) => ({
      ...entry,
      date: selectedDate,
      session: sessionType,
    }));

    if (payload.length === 0) {
      setMessage({ type: "error", text: "No student records to save." });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Check if offline
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      // Save to localStorage sync queue
      try {
        const queue = JSON.parse(
          localStorage.getItem("zphs_offline_sync_queue") || "[]"
        );
        queue.push({
          endpoint: "/api/attendance",
          payload,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("zphs_offline_sync_queue", JSON.stringify(queue));
        setMessage({
          type: "success",
          text: "Saved locally in Offline Mode! Attendance will synchronize automatically once reconnected.",
        });
      } catch (e) {
        setMessage({ type: "error", text: "Failed to save offline attendance." });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to submit attendance");
      }

      setMessage({
        type: "success",
        text: `Attendance saved for Class ${selectedClass}! ${resData.absentAlertsTriggered || 0} parent absent alerts dispatched.`,
      });
      // Refresh
      fetchClassAttendance();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Attendance submission failed." });
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const total = classStudents.length;
  const presentCount = Object.values(entries).filter((e) => e.status === "PRESENT").length;
  const absentCount = Object.values(entries).filter((e) => e.status === "ABSENT").length;
  const lateCount = Object.values(entries).filter((e) => e.status === "LATE").length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header Controls */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.35rem", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CalendarCheck2 size={24} style={{ color: "#10b981" }} />
            Daily Attendance Management &amp; Tracking
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>
            ZPHS Somasanigunta | Classes 6th to 10th muster roll register
          </p>
        </div>

        {/* Class Level Selector Buttons */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[6, 7, 8, 9, 10].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: selectedClass === cls ? "2px solid #1e3a8a" : "1px solid #cbd5e1",
                backgroundColor: selectedClass === cls ? "#1e3a8a" : "#ffffff",
                color: selectedClass === cls ? "#ffffff" : "#334155",
                fontWeight: "700",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Class {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Filter Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          backgroundColor: "#ffffff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={18} style={{ color: "#64748b" }} />
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.875rem", width: "160px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Session:</span>
            <select
              className="form-control"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.875rem", width: "130px" }}
            >
              <option value="FULL_DAY">Full Day</option>
              <option value="MORNING">Morning</option>
              <option value="AFTERNOON">Afternoon</option>
            </select>
          </div>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search by name or roll..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "0.45rem 0.75rem 0.45rem 2rem", fontSize: "0.875rem", width: "200px" }}
            />
            <Search size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => markAllAs("PRESENT")}
            className="btn btn-outline"
            style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem", borderColor: "#10b981", color: "#047857" }}
          >
            <CheckCircle2 size={14} /> All Present
          </button>
          <a
            href={`/api/export?type=ATTENDANCE&classLevel=${selectedClass}`}
            className="btn btn-outline"
            style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}
          >
            <Download size={14} /> Export CSV
          </a>
          <button
            onClick={() => window.print()}
            className="btn btn-outline no-print"
            style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid-cols-4">
        <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: "4px solid #3b82f6" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>ENROLLED (CLASS {selectedClass})</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>{total} Students</div>
        </div>
        <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>PRESENT TODAY</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#15803d" }}>{presentCount}</div>
        </div>
        <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>ABSENT TODAY</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#b91c1c" }}>{absentCount}</div>
        </div>
        <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>ATTENDANCE RATE</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e3a8a" }}>{attendanceRate}%</div>
        </div>
      </div>

      {/* Feedback Banner */}
      {message && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "8px",
            backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fca5a5"}`,
            color: message.type === "success" ? "#15803d" : "#991b1b",
            fontSize: "0.9rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Attendance Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table" style={{ margin: 0, width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>Roll</th>
                <th>Student Details</th>
                <th>Parent &amp; Contact</th>
                <th style={{ textAlign: "center", width: "110px" }}>Overall %</th>
                <th style={{ textAlign: "center", width: "300px" }}>Today's Status</th>
                <th style={{ width: "220px" }}>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
                    No students found matching your criteria in Class {selectedClass}.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const entry = entries[s.admissionNo] || {
                    studentId: s.id,
                    admissionNo: s.admissionNo,
                    classLevel: s.classLevel,
                    status: "PRESENT",
                    remarks: "",
                  };

                  return (
                    <tr
                      key={s.admissionNo}
                      style={{
                        backgroundColor: entry.status === "ABSENT" ? "#fef2f2" : entry.status === "LATE" ? "#fffbeb" : "white",
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.15s",
                      }}
                    >
                      <td style={{ textAlign: "center", fontWeight: "700", color: "#1e3a8a" }}>
                        {s.rollNo}
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <img
                            src={s.photo || "/images/placeholders/student_male.svg"}
                            alt={s.name}
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1.5px solid #cbd5e1",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: "700", color: "#0f172a" }}>{s.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              Adm: {s.admissionNo} | {s.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.85rem", color: "#334155" }}>{s.parentName}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>📞 {s.mobileNo}</div>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`badge ${
                            s.attendancePercentage >= 90
                              ? "badge-success"
                              : s.attendancePercentage >= 80
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
                          {s.attendancePercentage}%
                        </span>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "4px", backgroundColor: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.admissionNo, "PRESENT")}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: entry.status === "PRESENT" ? "#10b981" : "transparent",
                              color: entry.status === "PRESENT" ? "#ffffff" : "#475569",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.admissionNo, "ABSENT")}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: entry.status === "ABSENT" ? "#ef4444" : "transparent",
                              color: entry.status === "ABSENT" ? "#ffffff" : "#475569",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.admissionNo, "LATE")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: entry.status === "LATE" ? "#f59e0b" : "transparent",
                              color: entry.status === "LATE" ? "#ffffff" : "#475569",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            Late
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.admissionNo, "EXCUSED")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: entry.status === "EXCUSED" ? "#8b5cf6" : "transparent",
                              color: entry.status === "EXCUSED" ? "#ffffff" : "#475569",
                              fontWeight: "700",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            Leave
                          </button>
                        </div>
                      </td>

                      {/* Remarks Field */}
                      <td>
                        <input
                          type="text"
                          placeholder={entry.status === "ABSENT" ? "e.g. Fever, family event" : "Optional notes"}
                          value={entry.remarks}
                          onChange={(e) => handleRemarksChange(s.admissionNo, e.target.value)}
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            fontSize: "0.8rem",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Submit Toolbar */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
            * Saving attendance automatically logs records into the central register and notifies parents of absent students.
          </div>

          <button
            onClick={handleSaveAttendance}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: "0.65rem 1.5rem", fontSize: "0.95rem" }}
          >
            <Send size={16} />
            {loading ? "Recording & Broadcasting..." : `Submit Class ${selectedClass} Attendance`}
          </button>
        </div>
      </div>
    </div>
  );
}
