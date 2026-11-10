"use client";

import React, { useState, useEffect } from "react";
import { Search, Printer, Award, FileText, CheckCircle2, UserPlus, Edit3, X } from "lucide-react";
import SchoolAdmissionFormDocument, {
  AdmissionFormExtraData,
  parseAdmissionFormData,
} from "@/components/SchoolAdmissionFormDocument";

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
  admissionFormData?: AdmissionFormExtraData | string | null;
}

const DEFAULT_EXTRA_FORM: AdmissionFormExtraData = {
  motherTongue: "Telugu",
  fatherOccupation: "",
  fatherAadhar: "",
  motherOccupation: "",
  motherBankAccount: "",
  motherAadhar: "",
  motherBankNameBranch: "",
  motherBankIfsc: "",
  motherBankMicr: "",
  motherPhone: "",
  rationCardNo: "",
  residingWith: "Parents",
  guardianName: "",
  guardianOccupation: "",
  nationality: "Indian",
  state: "Andhra Pradesh",
  religion: "Hindu",
  subCaste: "",
  previousSchoolName: "",
  previousSchoolCode: "",
  previousClass: "",
  previousMedium: "English",
  eligiblePromotion: "YES",
  previousDaysAttended: "",
  tcNumberDate: "",
  mediumJoined: "English",
  childInfoNo: "",
  firstLanguage: "Telugu",
  secondLanguage: "Hindi",
  mole1: "",
  mole2: "",
  remarks: "",
  dateOfAdmission: new Date().toISOString().split("T")[0],
};

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

  // New Student Registration / Edit Admission Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    admissionNo: "",
    rollNo: "",
    classLevel: 6,
    gender: "Male",
    dob: "",
    caste: "",
    admissionYear: "2026-2027",
    bloodGroup: "O+",
    fatherName: "",
    motherName: "",
    mobileNo: "",
    address: "Somasanigunta, Venkatagiri Mandal",
    aadhaarNo: "",
    apaarId: "",
    penId: "",
  });
  const [extraForm, setExtraForm] = useState<AdmissionFormExtraData>({ ...DEFAULT_EXTRA_FORM });

  const loadStudents = async (selectId?: number) => {
    try {
      const r = await fetch("/api/students");
      const data = await r.json();
      if (Array.isArray(data)) {
        setStudents(data);
        if (selectId) {
          const found = data.find((s: Student) => s.id === selectId);
          if (found) {
            selectStudentRecord(found);
            return;
          }
        }
        if (!selectedStudent && data.length > 0) {
          selectStudentRecord(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const selectStudentRecord = (s: Student) => {
    setSelectedStudent(s);
    setToClass(`Class ${s.classLevel}`);
    setFromClass("Class 6");
    setFromYear(s.admissionYear || "2022-2023");
    setToYear("2026-2027");
  };

  const handleOpenNewRegistration = () => {
    setEditMode(false);
    setFormError("");
    const nextNum = students.length + 1;
    setFormPhoto(null);
    setFormData({
      name: "",
      admissionNo: `ADM/2026/6${String(nextNum).padStart(2, "0")}`,
      rollNo: String(nextNum),
      classLevel: 6,
      gender: "Male",
      dob: "2015-06-15",
      caste: "OBC",
      admissionYear: "2026-2027",
      bloodGroup: "O+",
      fatherName: "",
      motherName: "",
      mobileNo: "",
      address: "Somasanigunta, Venkatagiri Mandal",
      aadhaarNo: "",
      apaarId: "",
      penId: "",
    });
    setExtraForm({ ...DEFAULT_EXTRA_FORM });
    setDocType("ADMISSION_FORM");
    setShowModal(true);
  };

  const handleOpenEditAdmissionForm = (student: Student) => {
    setEditMode(true);
    setFormError("");
    setFormPhoto(student.photo || null);
    setFormData({
      name: student.name || "",
      admissionNo: student.admissionNo || "",
      rollNo: student.rollNo || "1",
      classLevel: student.classLevel || 6,
      gender: student.gender || "Male",
      dob: student.dob || "",
      caste: student.caste || "",
      admissionYear: student.admissionYear || "2026-2027",
      bloodGroup: student.bloodGroup || "O+",
      fatherName: student.fatherName || student.parentName || "",
      motherName: student.motherName || "",
      mobileNo: student.mobileNo || "",
      address: student.address || "",
      aadhaarNo: student.aadhaarNo && !student.aadhaarNo.includes("X") ? student.aadhaarNo : "",
      apaarId: student.apaarId || "",
      penId: student.penId || "",
    });
    setExtraForm({
      ...DEFAULT_EXTRA_FORM,
      ...parseAdmissionFormData(student.admissionFormData),
    });
    setDocType("ADMISSION_FORM");
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "classLevel" ? Number(value) : value,
    }));
  };

  const handleExtraChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExtraForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormPhoto(reader.result);
      }
      setPhotoUploading(false);
    };
    reader.onerror = () => setPhotoUploading(false);
    reader.readAsDataURL(file);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = {
        ...(editMode && selectedStudent ? { id: selectedStudent.id } : {}),
        ...formData,
        parentName: formData.fatherName || formData.motherName || "Parent / Guardian",
        photo: formPhoto,
        admissionFormData: extraForm,
      };

      const res = await fetch("/api/students", {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      if (!res.ok) {
        throw new Error(saved.error || "Failed to save student");
      }

      setShowModal(false);
      setDocType("ADMISSION_FORM");
      setFormSuccess(
        editMode
          ? `Updated Admission Form for ${saved.name}`
          : `New student "${saved.name}" registered and Admission Form generated!`
      );
      setTimeout(() => setFormSuccess(""), 5000);
      await loadStudents(saved.id);
      selectStudentRecord(saved);
    } catch (err: any) {
      setFormError(err.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
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
              Search by Admission Number, Student Name, Mobile Number, Father Name, APAAR ID, or PEN ID — or register a new student directly.
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
            <button
              type="button"
              onClick={handleOpenNewRegistration}
              className="btn btn-primary"
              style={{ backgroundColor: "#f59e0b", color: "#0f172a", fontWeight: 800, border: "none" }}
            >
              <UserPlus size={16} /> + New Student Registration
            </button>
            {selectedStudent && (
              <button
                type="button"
                onClick={() => handleOpenEditAdmissionForm(selectedStudent)}
                className="btn btn-outline"
                style={{ borderColor: "white", color: "white" }}
              >
                <Edit3 size={16} /> Edit Form
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{ backgroundColor: "#10b981" }}
            >
              <Printer size={16} /> Print {docType === "STUDY_CERT" ? "Certificate" : "Admission Form"}
            </button>
          </div>
        </div>

        {formSuccess && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              backgroundColor: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: "10px",
              color: "#166534",
              fontWeight: 700,
            }}
          >
            {formSuccess}
          </div>
        )}

        {/* Search & Student Selector */}
        <div className="grid-cols-2" style={{ gap: "1.5rem" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "#1e3a8a", margin: 0 }}>
                1. Search Student ({students.length} Total)
              </h3>
              <button
                type="button"
                onClick={handleOpenNewRegistration}
                className="btn btn-primary"
                style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", backgroundColor: "#1e3a8a" }}
              >
                <UserPlus size={14} /> + New Student Registration
              </button>
            </div>
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type Admission No (e.g. ADM/2026/601), Student Name, PEN ID, or Father Name..."
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
                        Adm: <strong>{s.admissionNo}</strong> | Father: {s.fatherName || s.parentName} | PEN: {s.penId || "—"}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} style={{ color: "#1e3a8a" }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Customization & Admission Registration Box */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "#1e3a8a", margin: 0 }}>
                2. Customize Parameters &amp; Admission Registration
              </h3>
              {selectedStudent && (
                <button
                  type="button"
                  onClick={() => handleOpenEditAdmissionForm(selectedStudent)}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                >
                  <Edit3 size={14} /> Edit Selected Admission Form
                </button>
              )}
            </div>
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

      {/* 16-Point Official School Admission Form Registration / Edit Modal */}
      {showModal && (
        <div
          className="no-print"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.72)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "940px",
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: "1.5rem",
              backgroundColor: "#f8fafc",
              border: "2px solid #1e3a8a",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #1e3a8a",
                paddingBottom: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <img
                  src="/images/ap_logo.jpg"
                  alt="AP Emblem"
                  style={{ width: "48px", height: "48px", objectFit: "contain" }}
                />
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#92400e", textTransform: "uppercase" }}>
                    SAMAGRA SHIKSHA • ZILLA PARISHAD HIGH SCHOOL, SOMASANIGUNTA
                  </div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1e3a8a", margin: 0 }}>
                    {editMode ? "Edit Student School Admission Form" : "New Student Registration — School Admission Form"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                style={{ padding: "0.4rem 0.65rem" }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontWeight: 700,
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveStudent}>
              {/* Photo Upload Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  backgroundColor: "#ffffff",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "0.92rem" }}>
                    Fill all 16 points of the Official School Admission Form below
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                    Upon saving, the student is added to the school database and the 1-page A4 Admission Form is ready to print.
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div
                    style={{
                      width: "68px",
                      height: "84px",
                      border: "1.5px solid #0f172a",
                      backgroundColor: "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      textAlign: "center",
                    }}
                  >
                    {formPhoto ? (
                      <img src={formPhoto} alt="Student" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "9px", color: "#64748b", fontWeight: 600 }}>Passport Photo</span>
                    )}
                  </div>
                  <label className="btn btn-secondary" style={{ fontSize: "0.8rem", cursor: "pointer" }}>
                    {photoUploading ? "Uploading..." : "Upload Student Photo"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              {/* Items 1 - 4 */}
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", backgroundColor: "#ffffff" }}>
                <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "0.9rem", marginBottom: "0.75rem", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.35rem" }}>
                  Items 1 – 4: Student Personal &amp; Identity Details
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">1. Name of the Student *</label>
                    <input name="name" type="text" className="form-control" value={formData.name} onChange={handleInputChange} required placeholder="Full Name in BLOCK LETTERS" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">2. Gender (Boy / Girl / TG) *</label>
                    <select name="gender" className="form-control" value={formData.gender} onChange={handleInputChange}>
                      <option value="Male">Boy (Male)</option>
                      <option value="Female">Girl (Female)</option>
                      <option value="TG">TG</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">3. Date of Birth *</label>
                    <input name="dob" type="date" className="form-control" value={formData.dob} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">4a. Mother Tongue</label>
                    <input name="motherTongue" type="text" className="form-control" value={extraForm.motherTongue || "Telugu"} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">4b. Aadhar No. of the Student</label>
                    <input name="aadhaarNo" type="text" className="form-control" value={formData.aadhaarNo} onChange={handleInputChange} placeholder="12-digit Aadhar No." />
                  </div>
                </div>
              </div>

              {/* Items 5 - 8 */}
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", backgroundColor: "#ffffff" }}>
                <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "0.9rem", marginBottom: "0.75rem", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.35rem" }}>
                  Items 5 – 8: Father, Mother, Bank Account &amp; Guardian Details
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">5a. Father&apos;s Name</label>
                    <input name="fatherName" type="text" className="form-control" value={formData.fatherName} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">5b. Father&apos;s Occupation</label>
                    <input name="fatherOccupation" type="text" className="form-control" value={extraForm.fatherOccupation || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">5c. Father&apos;s Aadhar No.</label>
                    <input name="fatherAadhar" type="text" className="form-control" value={extraForm.fatherAadhar || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">5d. Father&apos;s Phone No.</label>
                    <input name="mobileNo" type="tel" className="form-control" value={formData.mobileNo} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6a. Mother&apos;s Name</label>
                    <input name="motherName" type="text" className="form-control" value={formData.motherName} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6b. Mother&apos;s Occupation</label>
                    <input name="motherOccupation" type="text" className="form-control" value={extraForm.motherOccupation || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6c. Mother&apos;s Bank A/c No.</label>
                    <input name="motherBankAccount" type="text" className="form-control" value={extraForm.motherBankAccount || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6d. Mother&apos;s Aadhar No.</label>
                    <input name="motherAadhar" type="text" className="form-control" value={extraForm.motherAadhar || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">6e. Name of the Bank &amp; Branch</label>
                    <input name="motherBankNameBranch" type="text" className="form-control" value={extraForm.motherBankNameBranch || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6f. IFSC Code</label>
                    <input name="motherBankIfsc" type="text" className="form-control" value={extraForm.motherBankIfsc || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6g. MICR Code</label>
                    <input name="motherBankMicr" type="text" className="form-control" value={extraForm.motherBankMicr || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6h. Mother&apos;s Phone No.</label>
                    <input name="motherPhone" type="tel" className="form-control" value={extraForm.motherPhone || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">7a. Family Ration Card No.</label>
                    <input name="rationCardNo" type="text" className="form-control" value={extraForm.rationCardNo || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">7b. Residing with Parents / Guardian</label>
                    <select name="residingWith" className="form-control" value={extraForm.residingWith || "Parents"} onChange={handleExtraChange}>
                      <option value="Parents">Parents</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">8a. Guardian&apos;s Name (if any)</label>
                    <input name="guardianName" type="text" className="form-control" value={extraForm.guardianName || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">8b. Guardian&apos;s Occupation</label>
                    <input name="guardianOccupation" type="text" className="form-control" value={extraForm.guardianOccupation || ""} onChange={handleExtraChange} />
                  </div>
                </div>
              </div>

              {/* Items 9 - 11 */}
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", backgroundColor: "#ffffff" }}>
                <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "0.9rem", marginBottom: "0.75rem", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.35rem" }}>
                  Items 9 – 11: Nationality, Religion, Caste &amp; Residence
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">9a. Nationality</label>
                    <input name="nationality" type="text" className="form-control" value={extraForm.nationality || "Indian"} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">9b. State</label>
                    <input name="state" type="text" className="form-control" value={extraForm.state || "Andhra Pradesh"} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">9c. Religion</label>
                    <input name="religion" type="text" className="form-control" value={extraForm.religion || "Hindu"} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">10a. Caste Category</label>
                    <input name="caste" type="text" className="form-control" value={formData.caste} onChange={handleInputChange} placeholder="OC / OBC / SC / ST" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">10b. Sub-caste</label>
                    <input name="subCaste" type="text" className="form-control" value={extraForm.subCaste || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">11. Residence (Village / Habitation Address)</label>
                    <input name="address" type="text" className="form-control" value={formData.address} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* Items 12 - 16 */}
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", backgroundColor: "#ffffff" }}>
                <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "0.9rem", marginBottom: "0.75rem", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.35rem" }}>
                  Items 12 – 16: Previous School, Record Sheet/TC, Languages &amp; Identification Marks
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">12a. Name of Previous School</label>
                    <input name="previousSchoolName" type="text" className="form-control" value={extraForm.previousSchoolName || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12b. Previous School Code</label>
                    <input name="previousSchoolCode" type="text" className="form-control" value={extraForm.previousSchoolCode || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12c. Studying / Studied Class</label>
                    <input name="previousClass" type="text" className="form-control" value={extraForm.previousClass || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12d. Previous Medium</label>
                    <input name="previousMedium" type="text" className="form-control" value={extraForm.previousMedium || "English"} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12e. Eligible for Promotion?</label>
                    <select name="eligiblePromotion" className="form-control" value={extraForm.eligiblePromotion || "YES"} onChange={handleExtraChange}>
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12f. Days Attended</label>
                    <input name="previousDaysAttended" type="text" className="form-control" value={extraForm.previousDaysAttended || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">13a. No. &amp; Date of Record Sheet / TC</label>
                    <input name="tcNumberDate" type="text" className="form-control" value={extraForm.tcNumberDate || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">13b. Class Joined in this School *</label>
                    <select name="classLevel" className="form-control" value={formData.classLevel} onChange={handleInputChange}>
                      <option value={6}>6th Class</option>
                      <option value={7}>7th Class</option>
                      <option value={8}>8th Class</option>
                      <option value={9}>9th Class</option>
                      <option value={10}>10th Class</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">13c. Medium Joined</label>
                    <input name="mediumJoined" type="text" className="form-control" value={extraForm.mediumJoined || "English"} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">13d. Child Info No. (PEN ID)</label>
                    <input name="penId" type="text" className="form-control" value={formData.penId} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">APAAR ID</label>
                    <input name="apaarId" type="text" className="form-control" value={formData.apaarId} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">14a. First Language Opted</label>
                    <input name="firstLanguage" type="text" className="form-control" value={extraForm.firstLanguage || "Telugu"} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">14b. Second Language Opted</label>
                    <input name="secondLanguage" type="text" className="form-control" value={extraForm.secondLanguage || "Hindi"} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">15. Personal Marks for Identification — 1)</label>
                    <input name="mole1" type="text" className="form-control" value={extraForm.mole1 || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">15. Personal Marks for Identification — 2)</label>
                    <input name="mole2" type="text" className="form-control" value={extraForm.mole2 || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">16. Remarks If Any</label>
                    <input name="remarks" type="text" className="form-control" value={extraForm.remarks || ""} onChange={handleExtraChange} />
                  </div>
                </div>
              </div>

              {/* Bottom Office Order Section */}
              <div style={{ border: "2px solid #1e3a8a", borderRadius: "8px", padding: "1rem", backgroundColor: "#eff6ff", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 900, color: "#1e3a8a", fontSize: "0.92rem", marginBottom: "0.75rem" }}>
                  OFFICE ORDER SECTION (Admission Number, Date of Admission &amp; Roll No)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Admission Number *</label>
                    <input name="admissionNo" type="text" className="form-control" value={formData.admissionNo} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date of Admission *</label>
                    <input name="dateOfAdmission" type="date" className="form-control" value={extraForm.dateOfAdmission || ""} onChange={handleExtraChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Academic Year *</label>
                    <input name="admissionYear" type="text" className="form-control" value={formData.admissionYear} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Class Roll Number *</label>
                    <input name="rollNo" type="text" className="form-control" value={formData.rollNo} onChange={handleInputChange} required />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ backgroundColor: "#1e3a8a" }}>
                  {saving ? "Saving..." : editMode ? "Save Updated Admission Form" : "Register Student & Generate Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <div style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: "800", marginTop: "2px" }}>
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
