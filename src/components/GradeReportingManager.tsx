"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Award,
  Download,
  Printer,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  X,
} from "lucide-react";

interface GradeReportItem {
  id: number;
  studentId: number;
  admissionNo: string;
  classLevel: number;
  examName: string;
  academicYear: string;
  teluguMarks: number;
  hindiMarks: number;
  englishMarks: number;
  mathsMarks: number;
  scienceMarks: number;
  socialMarks: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  overallGrade: string;
  gpa: number;
  teacherRemarks: string;
  isPublished: boolean;
  studentName?: string;
  studentPhoto?: string;
  rollNo?: string;
  parentName?: string;
}

interface StudentSummary {
  id: number;
  name: string;
  admissionNo: string;
  rollNo: string;
  classLevel: number;
  gender: string;
  photo?: string | null;
  parentName: string;
}

interface GradeReportingManagerProps {
  initialReports: GradeReportItem[];
  students: StudentSummary[];
  userRole?: string;
}

export default function GradeReportingManager({
  initialReports,
  students,
  userRole = "TEACHER",
}: GradeReportingManagerProps) {
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [selectedExam, setSelectedExam] = useState<string>("SA-1");
  const [reports, setReports] = useState<GradeReportItem[]>(initialReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<GradeReportItem | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentSummary | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    telugu: 0,
    hindi: 0,
    english: 0,
    maths: 0,
    science: 0,
    social: 0,
    teacherRemarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Filter reports
  const classStudents = students.filter((s) => s.classLevel === selectedClass);
  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.includes(searchQuery)
  );

  const getReportForStudent = (admissionNo: string) => {
    return reports.find(
      (r) => r.admissionNo === admissionNo && r.examName === selectedExam
    );
  };

  const handleOpenEdit = (student: StudentSummary) => {
    const existing = getReportForStudent(student.admissionNo);
    setEditingStudent(student);
    if (existing) {
      setFormData({
        telugu: existing.teluguMarks,
        hindi: existing.hindiMarks,
        english: existing.englishMarks,
        maths: existing.mathsMarks,
        science: existing.scienceMarks,
        social: existing.socialMarks,
        teacherRemarks: existing.teacherRemarks || "",
      });
    } else {
      setFormData({
        telugu: 75,
        hindi: 70,
        english: 80,
        maths: 75,
        science: 80,
        social: 75,
        teacherRemarks: "",
      });
    }
  };

  // Live calculation of preview grade & GPA
  const currentTotal =
    Number(formData.telugu) +
    Number(formData.hindi) +
    Number(formData.english) +
    Number(formData.maths) +
    Number(formData.science) +
    Number(formData.social);
  const currentPercent = parseFloat(((currentTotal / 600) * 100).toFixed(1));

  let previewGrade = "B1";
  let previewGpa = 7.0;
  if (currentPercent >= 91) { previewGrade = "A1"; previewGpa = 10.0; }
  else if (currentPercent >= 81) { previewGrade = "A2"; previewGpa = 9.0; }
  else if (currentPercent >= 71) { previewGrade = "B1"; previewGpa = 8.0; }
  else if (currentPercent >= 61) { previewGrade = "B2"; previewGpa = 7.0; }
  else if (currentPercent >= 51) { previewGrade = "C1"; previewGpa = 6.0; }
  else if (currentPercent >= 41) { previewGrade = "C2"; previewGpa = 5.0; }
  else if (currentPercent >= 35) { previewGrade = "D"; previewGpa = 4.0; }
  else { previewGrade = "E"; previewGpa = 3.0; }

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionNo: editingStudent.admissionNo,
          examName: selectedExam,
          teluguMarks: formData.telugu,
          hindiMarks: formData.hindi,
          englishMarks: formData.english,
          mathsMarks: formData.maths,
          scienceMarks: formData.science,
          socialMarks: formData.social,
          teacherRemarks: formData.teacherRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record marks");

      setSaveMessage("Marks recorded and progress card generated!");

      // Update local state
      const updatedReports = reports.filter(
        (r) =>
          !(
            r.admissionNo === editingStudent.admissionNo &&
            r.examName === selectedExam
          )
      );
      updatedReports.push({
        ...data.report,
        studentName: editingStudent.name,
        studentPhoto: editingStudent.photo || "/images/placeholders/student_male.svg",
        rollNo: editingStudent.rollNo,
        parentName: editingStudent.parentName,
      });
      setReports(updatedReports);

      setTimeout(() => {
        setEditingStudent(null);
        setSaveMessage(null);
      }, 1000);
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.35rem", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <GraduationCap size={24} style={{ color: "#3b82f6" }} />
            Automated Academic Grade Reporting &amp; Report Cards
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>
            Computerized evaluation, GPA calculation, SCERT grading standards, and official progress cards
          </p>
        </div>

        {/* Class Level Selector */}
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

      {/* Exam Term Selector & Search Bar */}
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
          <div style={{ display: "flex", gap: "4px" }}>
            {["FA-1", "FA-2", "SA-1", "SA-2", "Pre-Final"].map((exam) => (
              <button
                key={exam}
                onClick={() => setSelectedExam(exam)}
                style={{
                  padding: "0.45rem 0.85rem",
                  borderRadius: "6px",
                  border: selectedExam === exam ? "2px solid #059669" : "1px solid #cbd5e1",
                  backgroundColor: selectedExam === exam ? "#dcfce7" : "#ffffff",
                  color: selectedExam === exam ? "#065f46" : "#475569",
                  fontWeight: "700",
                  fontSize: "0.825rem",
                  cursor: "pointer",
                }}
              >
                {exam}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search student..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "0.45rem 0.75rem 0.45rem 2rem", fontSize: "0.875rem", width: "200px" }}
            />
            <Search size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a
            href={`/api/export?type=GRADES&classLevel=${selectedClass}`}
            className="btn btn-outline"
            style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}
          >
            <Download size={14} /> Export Marks CSV
          </a>
        </div>
      </div>

      {/* Grade Ledger Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table" style={{ margin: 0, width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>Roll</th>
                <th>Student</th>
                <th style={{ textAlign: "center" }}>Telugu</th>
                <th style={{ textAlign: "center" }}>Hindi</th>
                <th style={{ textAlign: "center" }}>English</th>
                <th style={{ textAlign: "center" }}>Maths</th>
                <th style={{ textAlign: "center" }}>Science</th>
                <th style={{ textAlign: "center" }}>Social</th>
                <th style={{ textAlign: "center" }}>Total (600)</th>
                <th style={{ textAlign: "center" }}>Grade / GPA</th>
                <th style={{ textAlign: "center", width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
                    No students in Class {selectedClass}.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const rep = getReportForStudent(s.admissionNo);

                  return (
                    <tr key={s.admissionNo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ textAlign: "center", fontWeight: "700", color: "#1e3a8a" }}>
                        {s.rollNo}
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                          <img
                            src={s.photo || "/images/placeholders/student_male.svg"}
                            alt={s.name}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid #cbd5e1",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: "700", color: "#0f172a" }}>{s.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.admissionNo}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ textAlign: "center", fontWeight: "600" }}>{rep ? rep.teluguMarks : "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: "600" }}>{rep ? rep.hindiMarks : "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: "600" }}>{rep ? rep.englishMarks : "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: "600" }}>{rep ? rep.mathsMarks : "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: "600" }}>{rep ? rep.scienceMarks : "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: "600" }}>{rep ? rep.socialMarks : "—"}</td>

                      <td style={{ textAlign: "center" }}>
                        {rep ? (
                          <div>
                            <div style={{ fontWeight: "800", color: "#0f172a" }}>{rep.totalMarks}</div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{rep.percentage}%</div>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>Not entered</span>
                        )}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {rep ? (
                          <div>
                            <span className="badge badge-accent" style={{ fontWeight: "800" }}>
                              {rep.overallGrade}
                            </span>
                            <div style={{ fontSize: "0.75rem", color: "#1e3a8a", fontWeight: "700", marginTop: "2px" }}>
                              {rep.gpa} GPA
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          {(userRole === "ADMIN" || userRole === "TEACHER") && (
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="btn btn-outline"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                            >
                              <Edit3 size={12} /> {rep ? "Edit" : "Enter"}
                            </button>
                          )}

                          {rep && (
                            <button
                              onClick={() => setSelectedReportForPrint({ ...rep, studentName: s.name, rollNo: s.rollNo, parentName: s.parentName })}
                              className="btn btn-primary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                            >
                              <FileText size={12} /> Card
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Marks Modal */}
      {editingStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setEditingStudent(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              backgroundColor: "#ffffff",
              boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "800" }}>
                  Enter {selectedExam} Marks: {editingStudent.name}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Class {editingStudent.classLevel} | Roll #{editingStudent.rollNo} | Adm: {editingStudent.admissionNo}
                </p>
              </div>
              <button onClick={() => setEditingStudent(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            {saveMessage && (
              <div style={{ padding: "0.75rem", borderRadius: "8px", backgroundColor: "#dcfce7", color: "#166534", marginBottom: "1rem", fontSize: "0.875rem" }}>
                {saveMessage}
              </div>
            )}

            <form onSubmit={handleSaveGrade} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Telugu (Max: 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.telugu}
                    onChange={(e) => setFormData({ ...formData, telugu: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hindi (Max: 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.hindi}
                    onChange={(e) => setFormData({ ...formData, hindi: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">English (Max: 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.english}
                    onChange={(e) => setFormData({ ...formData, english: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mathematics (Max: 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.maths}
                    onChange={(e) => setFormData({ ...formData, maths: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Science (Max: 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.science}
                    onChange={(e) => setFormData({ ...formData, science: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Social Studies (Max: 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.social}
                    onChange={(e) => setFormData({ ...formData, social: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Real-time Calculation Preview Card */}
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1.5px solid #93c5fd",
                  borderRadius: "10px",
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#1e40af", fontWeight: "bold" }}>TOTAL MARKS</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1e3a8a" }}>{currentTotal} / 600</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#1e40af", fontWeight: "bold" }}>PERCENTAGE</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#047857" }}>{currentPercent}%</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#1e40af", fontWeight: "bold" }}>GRADE &amp; GPA</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#b45309" }}>{previewGrade} ({previewGpa})</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teacher's Observations / Constructive Remarks</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Leave empty for automated remarks based on GPA..."
                  value={formData.teacherRemarks}
                  onChange={(e) => setFormData({ ...formData, teacherRemarks: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Calculating & Saving..." : "Save Progress Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Progress Card Modal */}
      {selectedReportForPrint && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            overflowY: "auto",
          }}
          onClick={() => setSelectedReportForPrint(null)}
        >
          <div
            style={{
              maxWidth: "750px",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "var(--shadow-xl)",
              padding: "2.5rem",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
            id="official-report-card"
          >
            {/* Modal Controls (No print) */}
            <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "1rem" }}>
              <button
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.9rem" }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedReportForPrint(null)}
                className="btn btn-outline"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.9rem" }}
              >
                Close
              </button>
            </div>

            {/* Official Report Card Layout */}
            <div
              style={{
                border: "3px double #1e3a8a",
                padding: "2rem",
                borderRadius: "8px",
                backgroundColor: "#fffdfa",
              }}
            >
              {/* Official Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #1e3a8a", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
                  <img
                    src="/images/school_logo.png"
                    alt="ZPHS Somasanigunta"
                    style={{ width: "65px", height: "65px", borderRadius: "50%", border: "2px solid #10b981" }}
                  />
                  <div>
                    <h2 style={{ fontSize: "1.45rem", color: "#1e3a8a", fontWeight: "900", letterSpacing: "0.5px" }}>
                      ZILLA PARISHAD HIGH SCHOOL
                    </h2>
                    <h3 style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: "700" }}>
                      SOMASANIGUNTA, VENKATAGIRI MANDAL, TIRUPATI DISTRICT, AP
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>
                      UDISE Code: 28193503404 | Department of School Education, Govt. of Andhra Pradesh
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    display: "inline-block",
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    padding: "4px 18px",
                    borderRadius: "4px",
                    fontWeight: "800",
                    fontSize: "0.95rem",
                    letterSpacing: "1px",
                  }}
                >
                  OFFICIAL PROGRESS REPORT CARD - {selectedReportForPrint.examName} ({selectedReportForPrint.academicYear})
                </div>
              </div>

              {/* Student Identification Meta */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                  backgroundColor: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <strong>Student Name:</strong> {selectedReportForPrint.studentName}
                </div>
                <div>
                  <strong>Admission No:</strong> {selectedReportForPrint.admissionNo}
                </div>
                <div>
                  <strong>Class &amp; Section:</strong> Class {selectedReportForPrint.classLevel}
                </div>
                <div>
                  <strong>Roll Number:</strong> {selectedReportForPrint.rollNo}
                </div>
                <div>
                  <strong>Parent/Guardian:</strong> {selectedReportForPrint.parentName}
                </div>
                <div>
                  <strong>Exam Term:</strong> {selectedReportForPrint.examName} (AP SCERT Pattern)
                </div>
              </div>

              {/* Subject Marks Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1e3a8a", color: "white" }}>
                    <th style={{ border: "1px solid #1e3a8a", padding: "8px", textAlign: "left" }}>Subject</th>
                    <th style={{ border: "1px solid #1e3a8a", padding: "8px", textAlign: "center" }}>Max Marks</th>
                    <th style={{ border: "1px solid #1e3a8a", padding: "8px", textAlign: "center" }}>Marks Scored</th>
                    <th style={{ border: "1px solid #1e3a8a", padding: "8px", textAlign: "center" }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sub: "First Language (Telugu)", val: selectedReportForPrint.teluguMarks },
                    { sub: "Second Language (Hindi)", val: selectedReportForPrint.hindiMarks },
                    { sub: "Third Language (English)", val: selectedReportForPrint.englishMarks },
                    { sub: "Mathematics", val: selectedReportForPrint.mathsMarks },
                    { sub: "General Science", val: selectedReportForPrint.scienceMarks },
                    { sub: "Social Studies", val: selectedReportForPrint.socialMarks },
                  ].map((row, idx) => {
                    let subGrade = "B1";
                    if (row.val >= 91) subGrade = "A1";
                    else if (row.val >= 81) subGrade = "A2";
                    else if (row.val >= 71) subGrade = "B1";
                    else if (row.val >= 61) subGrade = "B2";
                    else if (row.val >= 51) subGrade = "C1";
                    else if (row.val >= 41) subGrade = "C2";
                    else if (row.val >= 35) subGrade = "D";
                    else subGrade = "E";

                    return (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                        <td style={{ border: "1px solid #cbd5e1", padding: "8px", fontWeight: "600" }}>{row.sub}</td>
                        <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center" }}>100</td>
                        <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center", fontWeight: "700" }}>{row.val}</td>
                        <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center", fontWeight: "800", color: "#1e3a8a" }}>{subGrade}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ backgroundColor: "#e2e8f0", fontWeight: "800" }}>
                    <td style={{ border: "1px solid #94a3b8", padding: "10px" }}>GRAND TOTAL</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "10px", textAlign: "center" }}>600</td>
                    <td style={{ border: "1px solid #94a3b8", padding: "10px", textAlign: "center", fontSize: "1.05rem" }}>
                      {selectedReportForPrint.totalMarks}
                    </td>
                    <td style={{ border: "1px solid #94a3b8", padding: "10px", textAlign: "center", fontSize: "1.05rem", color: "#047857" }}>
                      {selectedReportForPrint.overallGrade} ({selectedReportForPrint.gpa} GPA)
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Performance Summary & Teacher Remarks */}
              <div
                style={{
                  backgroundColor: "#f1f5f9",
                  padding: "1rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  marginBottom: "2rem",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <strong>Aggregate Percentage:</strong> {selectedReportForPrint.percentage}% |{" "}
                  <strong>Cumulative GPA:</strong> {selectedReportForPrint.gpa} / 10.0
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  <strong>Faculty Observations &amp; Remarks:</strong>{" "}
                  <em>"{selectedReportForPrint.teacherRemarks}"</em>
                </div>
              </div>

              {/* Official Signatures Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  paddingTop: "2.5rem",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderTop: "1px solid #0f172a", width: "160px", paddingTop: "4px", fontWeight: "700" }}>
                    Class Teacher Signature
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      border: "2px dashed #94a3b8",
                      borderRadius: "50%",
                      margin: "0 auto 6px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    School Seal
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ borderTop: "1px solid #0f172a", width: "180px", paddingTop: "4px", fontWeight: "700" }}>
                    Headmaster Signature &amp; Stamp
                  </div>
                </div>
              </div>

              {/* Grading Legend Footer */}
              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  marginTop: "1.5rem",
                  paddingTop: "0.75rem",
                  fontSize: "0.7rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                A1: 91-100 (10.0) | A2: 81-90 (9.0) | B1: 71-80 (8.0) | B2: 61-70 (7.0) | C1: 51-60 (6.0) | C2: 41-50 (5.0) | D: 35-40 (4.0) | E: Below 35
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
