"use client";

import React, { useState, useEffect } from "react";
import { Search, Printer, Award, FileText, User, Phone, Hash, Calendar, CheckCircle2 } from "lucide-react";
import SchoolAdmissionFormDocument from "@/components/SchoolAdmissionFormDocument";

interface Student {
  id: number;
  name: string;
  admissionNo: string;
  rollNo: string;
  classLevel: number;
  gender: string;
  dob: string;
  caste?: string | null;
  admissionYear?: string | null;
  bloodGroup: string | null;
  parentName: string;
  fatherName?: string | null;
  motherName?: string | null;
  mobileNo: string;
  address: string;
  aadhaarNo: string;
  apaarId?: string | null;
  penId?: string | null;
  photo: string | null;
}

function formatDateDDMMYYYY(dateStr?: string | null): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yyyy, mm, dd] = trimmed.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }
  return trimmed;
}

function dobToWords(dob: string): string {
  if (!dob) return "";
  try {
    const d = new Date(dob);
    if (isNaN(d.getTime())) return dob;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dob;
  }
}

export default function StudyCertificateGenerator() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [docType, setDocType] = useState<"STUDY_CERT" | "ADMISSION_FORM">("STUDY_CERT");

  // Editable certificate overrides
  const [fromClass, setFromClass] = useState("VI (6th)");
  const [toClass, setToClass] = useState("X (10th)");
  const [fromYear, setFromYear] = useState("2021-2022");
  const [toYear, setToYear] = useState("2026-2027");
  const [conduct, setConduct] = useState("SATISFACTORY / GOOD");
  const [certDate, setCertDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0) {
            selectStudentRecord(data[0]);
          }
        }
      })
      .catch(console.error);
  }, []);

  const selectStudentRecord = (s: Student) => {
    setSelectedStudent(s);
    setToClass(`Class ${s.classLevel}`);
    setFromClass("Class 6");
    setFromYear(s.admissionYear || "2022-2023");
    setToYear("2026-2027");
  };

  const matchedStudents = students.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      (s.mobileNo || "").toLowerCase().includes(q) ||
      (s.fatherName || s.parentName || "").toLowerCase().includes(q) ||
      (s.rollNo || "").toLowerCase().includes(q) ||
      (s.aadhaarNo || "").toLowerCase().includes(q) ||
      (s.apaarId || "").toLowerCase().includes(q) ||
      (s.penId || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Search & Configuration Controls (Hidden on Print) */}
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
            color: "white",
            padding: "2rem",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.85rem", color: "white", fontWeight: "800" }}>
              Automated Study Certificate &amp; Admission Form Generator
            </h1>
            <p style={{ opacity: 0.9, marginTop: "0.35rem", fontSize: "0.95rem" }}>
              Search by Admission Number, Student Name, Mobile Number, Father Name, APAAR ID, or PEN ID to instantly generate and print official certificates.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setDocType("STUDY_CERT")}
              className={docType === "STUDY_CERT" ? "btn btn-accent" : "btn btn-outline"}
              style={{ borderColor: "white", color: "white" }}
            >
              <Award size={16} /> Study &amp; Conduct Certificate
            </button>
            <button
              type="button"
              onClick={() => setDocType("ADMISSION_FORM")}
              className={docType === "ADMISSION_FORM" ? "btn btn-accent" : "btn btn-outline"}
              style={{ borderColor: "white", color: "white" }}
            >
              <FileText size={16} /> Official Admission Form
            </button>
            <button type="button" onClick={() => window.print()} className="btn btn-primary" style={{ backgroundColor: "#10b981" }}>
              <Printer size={16} /> Print {docType === "STUDY_CERT" ? "Certificate" : "Admission Form"}
            </button>
          </div>
        </div>

        {/* Search & Student Selector */}
        <div className="grid-cols-2" style={{ gap: "1.5rem" }}>
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", color: "#1e3a8a", marginBottom: "0.75rem" }}>
              1. Search Student (Admission No / Name / Phone / APAAR / PEN)
            </h3>
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type Admission No (e.g. ADM/2021/045), Student Name, or Phone No..."
                style={{ paddingLeft: "2.5rem" }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Search size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            </div>

            <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {matchedStudents.map((s) => {
                const isSelected = selectedStudent?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectStudentRecord(s)}
                    style={{
                      padding: "0.65rem 0.9rem",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid #1e3a8a" : "1px solid #e2e8f0",
                      backgroundColor: isSelected ? "#eff6ff" : "#f8fafc",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.9rem" }}>
                        {s.name} <span className="badge badge-primary">Class {s.classLevel}</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                        Adm: <strong>{s.admissionNo}</strong> | Father: {s.fatherName || s.parentName} | Ph: {s.mobileNo}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} style={{ color: "#1e3a8a" }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Customization */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", color: "#1e3a8a", marginBottom: "0.75rem" }}>
              2. Customize Certificate Parameters
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Studied From Class</label>
                <input type="text" className="form-control" value={fromClass} onChange={(e) => setFromClass(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">To Class</label>
                <input type="text" className="form-control" value={toClass} onChange={(e) => setToClass(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">From Academic Year</label>
                <input type="text" className="form-control" value={fromYear} onChange={(e) => setFromYear(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">To Academic Year</label>
                <input type="text" className="form-control" value={toYear} onChange={(e) => setToYear(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Character &amp; Conduct</label>
                <input type="text" className="form-control" value={conduct} onChange={(e) => setConduct(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date of Issue</label>
                <input type="date" className="form-control" value={certDate} onChange={(e) => setCertDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Certificate / Admission Form Preview */}
      {selectedStudent && docType === "STUDY_CERT" && (
        <div
          className="card"
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            width: "100%",
            padding: "2.75rem",
            border: "4px double #1e3a8a",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "2px solid #1e3a8a",
              paddingBottom: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <img
              src="/images/ap_logo.jpg"
              alt="Government of Andhra Pradesh Logo"
              style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "contain" }}
            />
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#15803d", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Government of Andhra Pradesh • Department of School Education
              </div>
              <h2 style={{ fontSize: "1.65rem", fontWeight: "900", color: "#1e3a8a", margin: "4px 0" }}>
                ZILLA PARISHAD HIGH SCHOOL
              </h2>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>
                SOMASANIGUNTA, VENKATAGIRI MANDAL, TIRUPATI DISTRICT (A.P.)
              </div>
              <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "2px", fontWeight: "600" }}>
                Recognized by Govt. of AP • UDISE Code: <strong>28193503404</strong> • PIN: 524132
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#334155" }}>
              <div><strong>Date:</strong> {formatDateDDMMYYYY(certDate)}</div>
            </div>
          </div>

          {/* Title Banner */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#1e3a8a",
                color: "white",
                padding: "6px 24px",
                borderRadius: "999px",
                fontSize: "1.1rem",
                fontWeight: "800",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              STUDY AND CONDUCT CERTIFICATE (BONAFIDE)
            </span>
          </div>

          {/* Identification Numbers Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
              backgroundColor: "#f8fafc",
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              marginBottom: "1.75rem",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <strong>Admission No:</strong> <span style={{ color: "#1e3a8a", fontWeight: "800" }}>{selectedStudent.admissionNo}</span>
            </div>
            <div>
              <strong>APAAR ID:</strong> <span style={{ fontFamily: "monospace" }}>{selectedStudent.apaarId || "—"}</span>
            </div>
            <div>
              <strong>PEN ID:</strong> <span style={{ fontFamily: "monospace" }}>{selectedStudent.penId || "—"}</span>
            </div>
          </div>

          {/* Certificate Body Text */}
          <div style={{ fontSize: "1.08rem", lineHeight: "2.1", color: "#0f172a", textAlign: "justify" }}>
            This is to certify that Kumari / Chi.{" "}
            <strong style={{ borderBottom: "1px dotted #0f172a", padding: "0 8px", color: "#1e3a8a", fontSize: "1.15rem" }}>
              {selectedStudent.name}
            </strong>
            , {selectedStudent.gender === "Female" ? "Daughter" : "Son"} of Sri{" "}
            <strong style={{ borderBottom: "1px dotted #0f172a", padding: "0 8px" }}>
              {selectedStudent.fatherName || selectedStudent.parentName}
            </strong>{" "}
            {selectedStudent.motherName ? (
              <>
                and Smt.{" "}
                <strong style={{ borderBottom: "1px dotted #0f172a", padding: "0 8px" }}>
                  {selectedStudent.motherName}
                </strong>
              </>
            ) : null}
            , bearing Admission No.{" "}
            <strong style={{ borderBottom: "1px dotted #0f172a", padding: "0 6px" }}>{selectedStudent.admissionNo}</strong>, is / was a bonafide student of{" "}
            <strong>Zilla Parishad High School, Somasanigunta</strong>. He / She studied from Class{" "}
            <strong style={{ borderBottom: "1px dotted #0f172a", padding: "0 6px" }}>{fromClass}</strong> to Class{" "}
            <strong style={{ borderBottom: "1px dotted #0f172a", padding: "0 6px" }}>{toClass}</strong> during the academic years from{" "}
            <strong style={{ borderBottom: "1px dotted #0f172a", padding: "0 6px" }}>{fromYear}</strong> to{" "}
            <strong style={{ borderBottom: "1px dotted #0f172a", padding: "0 6px" }}>{toYear}</strong>.
          </div>

          <div style={{ marginTop: "1.25rem", fontSize: "1.02rem", lineHeight: "1.9", color: "#0f172a" }}>
            <div>
              • <strong>Date of Birth (as per Admission Register):</strong>{" "}
              <span style={{ fontWeight: "700", color: "#1e3a8a" }}>{formatDateDDMMYYYY(selectedStudent.dob)}</span> ({dobToWords(selectedStudent.dob)})
            </div>
            <div>
              • <strong>Caste / Community:</strong> <span style={{ fontWeight: "700" }}>{selectedStudent.caste || "As per school records"}</span>
            </div>
            <div>
              • <strong>Medium of Instruction:</strong> <span style={{ fontWeight: "700" }}>English</span>
            </div>
            <div>
              • <strong>His / Her Character and Conduct during the study period:</strong>{" "}
              <span style={{ fontWeight: "800", color: "#15803d" }}>{conduct}</span>
            </div>
          </div>

          {/* Footer Signatures */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "4rem",
              paddingTop: "1rem",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>Place: Somasanigunta</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                Date: {formatDateDDMMYYYY(certDate)}
              </div>
            </div>

            <div
              style={{
                border: "2px dashed #94a3b8",
                borderRadius: "50%",
                width: "105px",
                height: "105px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: "0.7rem",
                color: "#64748b",
                fontWeight: "700",
                padding: "8px",
              }}
            >
              SCHOOL SEAL
              <br />
              ZPHS Somasanigunta
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: "800", color: "#1e3a8a", fontSize: "0.95rem" }}>
                Gangalapudi Bhaskar
              </div>
              <div style={{ fontSize: "0.75rem", color: "#334155", fontWeight: "600" }}>
                M.Phil(Maths), M.Sc(Maths), M.Ed., PG dip in Computers
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                HEADMASTER
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Z.P. High School, Somasanigunta</div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && docType === "ADMISSION_FORM" && (
        <SchoolAdmissionFormDocument student={selectedStudent} />
      )}
    </div>
  );
}

