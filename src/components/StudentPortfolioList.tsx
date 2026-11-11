"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Download,
  User,
  Calendar,
  Award,
  Phone,
  MapPin,
  Eye,
  FileBadge,
  X,
  CreditCard,
  Hash,
  Sparkles,
  Printer,
  Camera,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Student {
  id: number;
  name: string;
  admissionNo: string;
  admissionYear?: string;
  rollNo: string;
  classLevel: number;
  gender: string;
  dob: string;
  bloodGroup: string | null;
  parentName: string;
  fatherName?: string;
  motherName?: string;
  caste?: string;
  apaarId?: string;
  penId?: string;
  aadhaarNo?: string;
  mobileNo: string;
  address: string;
  academicPerformance: string;
  attendancePercentage: number;
  coCurricular: string | null;
  sportsAchievements: string | null;
  certificates: string | null; // JSON String of array
  photo: string | null;
  admissionFormData?: any;
}

export default function StudentPortfolioList({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedClass, setSelectedClass] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [performanceFilter, setPerformanceFilter] = useState<string>("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Sync with live API on client load to ensure all photos and updates are shown in real-time
  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter Logic
  const filteredStudents = students.filter((student) => {
    const matchesClass = selectedClass === "ALL" ? true : student.classLevel === selectedClass;
    const matchesGender =
      genderFilter === "ALL"
        ? true
        : student.gender?.toLowerCase() === genderFilter.toLowerCase();
    const matchesPerformance =
      performanceFilter === "ALL" ? true : student.academicPerformance === performanceFilter;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      student.name?.toLowerCase().includes(q) ||
      student.admissionNo?.toLowerCase().includes(q) ||
      String(student.rollNo).includes(q) ||
      (student.fatherName && student.fatherName.toLowerCase().includes(q)) ||
      (student.apaarId && student.apaarId.includes(q)) ||
      (student.penId && student.penId.includes(q));

    return matchesClass && matchesGender && matchesPerformance && matchesSearch;
  });

  // Export to Excel
  const handleExport = () => {
    const dataToExport = filteredStudents.map((s, idx) => ({
      "S.No": idx + 1,
      "Admission No": s.admissionNo,
      "Admission Year": s.admissionYear || "2025-2026",
      "Roll No": s.rollNo,
      Class: `Class ${s.classLevel}`,
      "Student Name": s.name,
      Gender: s.gender,
      Caste: s.caste || "OC",
      "Date of Birth": s.dob,
      "Father Name": s.fatherName || s.parentName || "",
      "Mother Name": s.motherName || "",
      "Mobile No": s.mobileNo,
      "APAAR ID": s.apaarId || "Not Assigned",
      "PEN ID": s.penId || "",
      "Aadhaar No": s.aadhaarNo || "",
      "Blood Group": s.bloodGroup || "N/A",
      Address: s.address,
      "Attendance %": `${s.attendancePercentage}%`,
      "Academic Grade": s.academicPerformance,
      "Has Photo": s.photo ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Portfolios");

    // Auto-fit column widths
    const maxCols = Object.keys(dataToExport[0] || {}).length;
    worksheet["!cols"] = Array(maxCols).fill({ wch: 18 });

    XLSX.writeFile(
      workbook,
      `ZPHS_Somasanigunta_Portfolios_Class_${selectedClass === "ALL" ? "All" : selectedClass}.xlsx`
    );
  };

  return (
    <div>
      {/* 1. Filter Control Panel */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Class Navigation Tabs */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px", overflowX: "auto" }}>
            {["ALL", 6, 7, 8, 9, 10].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls as any)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: selectedClass === cls ? "#1e3a8a" : "transparent",
                  color: selectedClass === cls ? "white" : "#475569",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
                }}
              >
                {cls === "ALL" ? "All Classes" : `Class ${cls}`}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button onClick={handleExport} className="btn btn-accent" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
            <Download size={16} /> Export to Excel
          </button>
        </div>

        {/* Detailed Search and Selector Filters */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem", marginTop: "1.25rem" }}>
          
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search by student name or admission number..."
              className="form-control"
              style={{ paddingLeft: "2.5rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          </div>

          {/* Gender Filter */}
          <select 
            className="form-control" 
            value={genderFilter} 
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Performance Filter */}
          <select 
            className="form-control" 
            value={performanceFilter} 
            onChange={(e) => setPerformanceFilter(e.target.value)}
          >
            <option value="ALL">All Performances</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Below Average">Below Average</option>
          </select>

        </div>
      </div>

      {/* 2. Portfolios Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid-cols-3">
          {filteredStudents.map((s) => {
            const isGirl = s.gender?.toLowerCase() === "girl" || s.gender?.toLowerCase() === "female";
            const placeholderAvatar = isGirl
              ? "/images/placeholders/student_female.svg"
              : "/images/placeholders/student_male.svg";

            return (
              <div
                key={s.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  padding: "1.25rem",
                  border: "1px solid #e2e8f0",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Header: Passport Photo + Name & Core Badges */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "0.85rem" }}>
                  {/* Passport Photo Frame */}
                  <div
                    style={{
                      width: "82px",
                      height: "102px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#f8fafc",
                      border: s.photo ? "2px solid #1e3a8a" : "1.5px dashed #cbd5e1",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {s.photo ? (
                      <img
                        src={s.photo}
                        alt={s.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          width: "100%",
                          backgroundColor: "#f8fafc",
                          color: "#94a3b8",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        <img
                          src={placeholderAvatar}
                          alt={s.name}
                          style={{ width: "42px", height: "42px", opacity: 0.6 }}
                        />
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, marginTop: "2px", color: "#64748b" }}>
                          No Photo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Student Title & Badges */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "0.35rem" }}>
                      <span className="badge badge-primary" style={{ fontSize: "0.72rem", padding: "2px 6px" }}>
                        Class {s.classLevel}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: isGirl ? "#fce7f3" : "#dbeafe",
                          color: isGirl ? "#be185d" : "#1d4ed8",
                        }}
                      >
                        {s.gender || (isGirl ? "Girl" : "Boy")}
                      </span>
                      {s.caste && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                          }}
                        >
                          {s.caste}
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        fontSize: "1.05rem",
                        color: "#0f172a",
                        fontWeight: 800,
                        margin: "0 0 4px 0",
                        lineHeight: "1.25",
                        wordBreak: "break-word",
                      }}
                    >
                      {s.name}
                    </h3>

                    <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span><strong>Roll No:</strong> {s.rollNo}</span>
                      <span><strong>Adm No:</strong> {s.admissionNo}</span>
                    </div>
                  </div>
                </div>

                {/* All Key Student Details Grid */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "0.65rem 0.75rem",
                    marginBottom: "0.85rem",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px 8px",
                    fontSize: "0.78rem",
                  }}
                >
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>Father / Guardian:</span>
                    <strong style={{ color: "#0f172a" }}>{s.fatherName || s.parentName || "—"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>Date of Birth:</span>
                    <strong style={{ color: "#0f172a" }}>{s.dob || "—"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>APAAR ID:</span>
                    <strong style={{ color: s.apaarId ? "#1e3a8a" : "#94a3b8" }}>
                      {s.apaarId || "Not Assigned"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>PEN ID:</span>
                    <strong style={{ color: "#0f172a" }}>{s.penId || "—"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>Mobile Number:</span>
                    <strong style={{ color: "#0f172a" }}>{s.mobileNo || "—"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>Attendance:</span>
                    <strong style={{ color: s.attendancePercentage >= 90 ? "#15803d" : "#b45309" }}>
                      {s.attendancePercentage}% ({s.academicPerformance})
                    </strong>
                  </div>
                </div>

                {/* View Full Portfolio Button */}
                <button
                  type="button"
                  onClick={() => setSelectedStudent(s)}
                  className="btn btn-outline"
                  style={{
                    width: "100%",
                    marginTop: "auto",
                    padding: "0.55rem",
                    fontSize: "0.825rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Eye size={14} /> View Full Portfolio
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
            No students found matching the selected search criteria.
          </p>
        </div>
      )}

      {/* 3. Detailed Full Portfolio Modal View */}
      {selectedStudent && (
        <div className="lightbox" onClick={() => setSelectedStudent(null)}>
          <div
            className="card"
            style={{
              maxWidth: "700px",
              width: "100%",
              backgroundColor: "white",
              padding: "2rem",
              maxHeight: "92vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>

            {/* Modal Header: Full Passport Photo & Titles */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                borderBottom: "1.5px solid #e2e8f0",
                paddingBottom: "1.5rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Large Passport Photo */}
              <div
                style={{
                  width: "115px",
                  height: "140px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: "#f8fafc",
                  border: selectedStudent.photo ? "3px solid #1e3a8a" : "2px dashed #cbd5e1",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedStudent.photo ? (
                  <img
                    src={selectedStudent.photo}
                    alt={selectedStudent.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      width: "100%",
                      backgroundColor: "#f8fafc",
                      color: "#94a3b8",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={
                        selectedStudent.gender?.toLowerCase() === "girl" || selectedStudent.gender?.toLowerCase() === "female"
                          ? "/images/placeholders/student_female.svg"
                          : "/images/placeholders/student_male.svg"
                      }
                      alt={selectedStudent.name}
                      style={{ width: "60px", height: "60px", opacity: 0.6 }}
                    />
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, marginTop: "4px", color: "#64748b" }}>
                      Passport Photo
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "0.5rem" }}>
                  <span className="badge badge-primary">Class {selectedStudent.classLevel}</span>
                  <span className="badge badge-primary">Roll No: {selectedStudent.rollNo}</span>
                  <span className="badge badge-success">{selectedStudent.gender}</span>
                  {selectedStudent.caste && (
                    <span className="badge badge-warning">Caste: {selectedStudent.caste}</span>
                  )}
                  {selectedStudent.bloodGroup && (
                    <span className="badge badge-warning">Blood Group: {selectedStudent.bloodGroup}</span>
                  )}
                </div>

                <h2 style={{ fontSize: "1.65rem", color: "#1e3a8a", fontWeight: 800, margin: "0 0 4px 0" }}>
                  {selectedStudent.name}
                </h2>
                <p style={{ fontSize: "0.88rem", color: "#64748b", margin: 0 }}>
                  Admission No: <strong>{selectedStudent.admissionNo}</strong> • Admission Year:{" "}
                  <strong>{selectedStudent.admissionYear || "2025-2026"}</strong>
                </p>
                <p style={{ fontSize: "0.82rem", color: "#475569", marginTop: "4px" }}>
                  School: <strong>ZPHS Somasanigunta</strong> • UDISE: <strong>28193503404</strong>
                </p>
              </div>
            </div>

            {/* Government & Academic Identifiers Section */}
            <div
              style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <h4 style={{ color: "#1e3a8a", margin: "0 0 0.75rem 0", fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                <CreditCard size={16} /> Official Government &amp; Academic Identifiers
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>APAAR ID:</span>
                  <strong style={{ color: selectedStudent.apaarId ? "#1e3a8a" : "#94a3b8", fontSize: "0.92rem" }}>
                    {selectedStudent.apaarId || "Not Assigned"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>PEN ID:</span>
                  <strong style={{ color: "#0f172a", fontSize: "0.92rem" }}>
                    {selectedStudent.penId || "—"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>Aadhaar Number:</span>
                  <strong style={{ color: "#0f172a", fontSize: "0.92rem" }}>
                    {selectedStudent.aadhaarNo || "—"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Personal Details & Progress Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* Personal & Family Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <h4 style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", color: "#0f172a", fontWeight: 700 }}>
                  Personal &amp; Family Details
                </h4>
                <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span className="flex items-center gap-2">
                    <Calendar size={14} style={{ color: "#64748b" }} /> <strong>DOB:</strong> {selectedStudent.dob}
                  </span>
                  <span className="flex items-center gap-2">
                    <User size={14} style={{ color: "#64748b" }} /> <strong>Father Name:</strong>{" "}
                    {selectedStudent.fatherName || selectedStudent.parentName || "—"}
                  </span>
                  {selectedStudent.motherName && (
                    <span className="flex items-center gap-2">
                      <User size={14} style={{ color: "#64748b" }} /> <strong>Mother Name:</strong>{" "}
                      {selectedStudent.motherName}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Phone size={14} style={{ color: "#64748b" }} /> <strong>Contact:</strong>{" "}
                    {selectedStudent.mobileNo || "—"}
                  </span>
                  <span className="flex items-center gap-2" style={{ alignItems: "flex-start" }}>
                    <MapPin size={14} style={{ color: "#64748b", marginTop: "2px" }} /> <strong>Address:</strong>{" "}
                    {selectedStudent.address || "Somasanigunta"}
                  </span>
                </div>
              </div>

              {/* Progress Summary */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <h4 style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", color: "#0f172a", fontWeight: 700 }}>
                  Academic Progress &amp; Attendance
                </h4>
                <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span><strong>Attendance Ratio:</strong></span>
                      <span
                        style={{
                          color: selectedStudent.attendancePercentage >= 90 ? "#15803d" : "#b45309",
                          fontWeight: "bold",
                        }}
                      >
                        {selectedStudent.attendancePercentage}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${selectedStudent.attendancePercentage}%`,
                          height: "100%",
                          backgroundColor:
                            selectedStudent.attendancePercentage >= 90 ? "#10b981" : "#f59e0b",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <span><strong>Academic Performance:</strong></span>
                    <span className="badge badge-primary" style={{ marginLeft: "0.5rem" }}>
                      {selectedStudent.academicPerformance}
                    </span>
                  </div>
                  <div>
                    <span><strong>General Conduct:</strong></span>
                    <span style={{ marginLeft: "0.5rem", color: "#15803d", fontWeight: 700 }}>
                      Satisfactory / Good
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracurriculars and Awards */}
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>
                <h4 style={{ color: "#0f172a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileBadge size={16} style={{ color: "#10b981" }} /> Co-Curricular Activities
                </h4>
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5", margin: 0 }}>
                  {selectedStudent.coCurricular || "Active participation in school cultural and science exhibitions."}
                </p>
              </div>

              <div>
                <h4 style={{ color: "#0f172a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Award size={16} style={{ color: "#fbbf24" }} /> Sports Achievements
                </h4>
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5", margin: 0 }}>
                  {selectedStudent.sportsAchievements || "Regular participation in daily morning fitness and inter-class sports."}
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                borderTop: "1.5px solid #e2e8f0",
                paddingTop: "1.25rem",
                marginTop: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <Link
                href="/study-certificate"
                className="btn btn-secondary"
                style={{ fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Camera size={14} /> Update Photo / Edit Admission Form
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Printer size={14} /> Print Student Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
