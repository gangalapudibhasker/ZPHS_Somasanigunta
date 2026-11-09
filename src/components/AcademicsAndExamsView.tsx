"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Clock,
  GraduationCap,
  Printer,
  Download,
  Plus,
  Check,
  Award,
  Calendar,
  BookOpen,
  X,
} from "lucide-react";

export default function AcademicsAndExamsView({
  isAdmin = false,
  initialTab = "TIMETABLE",
}: {
  isAdmin?: boolean;
  initialTab?: "TIMETABLE" | "EXAMS";
}) {
  const [activeTab, setActiveTab] = useState<"TIMETABLE" | "EXAMS">("TIMETABLE");
  const [selectedTimetableClass, setSelectedTimetableClass] = useState("Class 10");
  const [timetable, setTimetable] = useState<Record<string, any[]>>({});
  const [examSchedule, setExamSchedule] = useState<any[]>([]);

  // Exams filter & data
  const [selectedExam, setSelectedExam] = useState("SA-1");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [gradeReports, setGradeReports] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  // Add Marks Modal
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [reportCardItem, setReportCardItem] = useState<any | null>(null);
  const [marksForm, setMarksForm] = useState({
    admissionNo: "",
    examName: "SA-1",
    teluguMarks: 90,
    hindiMarks: 85,
    englishMarks: 88,
    mathsMarks: 95,
    scienceMarks: 92,
    socialMarks: 90,
    maxMarksPerSubject: 100,
    teacherRemarks: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [hubRes, examRes, studRes] = await Promise.all([
        fetch("/api/school-hub"),
        fetch("/api/examinations"),
        fetch("/api/students"),
      ]);
      const hubData = await hubRes.json();
      const examData = await examRes.json();
      const studData = await studRes.json();

      setTimetable(hubData.timetable || {});
      setExamSchedule(hubData.examSchedule || []);
      if (Array.isArray(examData)) setGradeReports(examData);
      if (Array.isArray(studData)) {
        setStudents(studData);
        if (studData.length > 0 && !marksForm.admissionNo) {
          setMarksForm((prev) => ({ ...prev, admissionNo: studData[0].admissionNo }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    const stud = students.find((s) => s.admissionNo === marksForm.admissionNo);
    if (!stud) return;

    const isFa = marksForm.examName.startsWith("FA");
    const res = await fetch("/api/examinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...marksForm,
        studentId: stud.id,
        classLevel: stud.classLevel,
        maxMarksPerSubject: isFa ? 20 : 100,
      }),
    });
    if (res.ok) {
      setSuccess(`Saved ${marksForm.examName} marks for ${stud.name}!`);
      setShowMarksModal(false);
      loadData();
    }
  };

  const filteredGrades = gradeReports.filter((g) => {
    const matchExam = selectedExam === "ALL" || g.examName === selectedExam;
    const matchClass = selectedClass === "ALL" || String(g.classLevel) === selectedClass;
    return matchExam && matchClass;
  });

  const exportExamsExcel = () => {
    const rows = filteredGrades.map((g) => ({
      "Admission No": g.admissionNo,
      "Roll No": g.rollNo,
      "Student Name": g.studentName,
      "Class": `Class ${g.classLevel}`,
      "Examination": g.examName,
      "Telugu": g.teluguMarks,
      "Hindi": g.hindiMarks,
      "English": g.englishMarks,
      "Mathematics": g.mathsMarks,
      "Science": g.scienceMarks,
      "Social Studies": g.socialMarks,
      "Total Marks": `${g.totalMarks} / ${g.maxMarks}`,
      "Percentage": `${g.percentage}%`,
      "Grade": g.overallGrade,
      "GPA": g.gpa,
      "Remarks": g.teacherRemarks || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exam Results");
    XLSX.writeFile(wb, `ZPHS_Exam_Results_${selectedExam}_Class_${selectedClass}.xlsx`);
  };

  const currentTimetableRows = timetable[selectedTimetableClass] || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Top Banner */}
      <div
        className="no-print"
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
          <h1 style={{ fontSize: "1.9rem", color: "white", fontWeight: "800" }}>
            School Master Timetable (Classes 6 to 10)
          </h1>
          <p style={{ opacity: 0.9, marginTop: "0.35rem", fontSize: "0.95rem" }}>
            Period-wise class timetables for ZPHS Somasanigunta (Academic Year 2026-2027).
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="button" onClick={() => window.print()} className="btn btn-primary" style={{ backgroundColor: "#10b981" }}>
            <Printer size={16} /> Print Timetable
          </button>
        </div>
      </div>

      {success && (
        <div
          className="no-print"
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#dcfce7",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            color: "#15803d",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* TAB 1: TIMETABLE */}
      {activeTab === "TIMETABLE" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "2px solid #1e3a8a", paddingBottom: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src="/images/ap_logo.jpg"
                alt="AP Logo"
                style={{ width: "56px", height: "56px", objectFit: "contain", borderRadius: "50%" }}
              />
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>
                  Zilla Parishad High School, Somasanigunta • Venkatagiri Mandal, Tirupati Dist.
                </div>
                <h2 style={{ fontSize: "1.35rem", color: "#1e3a8a", margin: "2px 0" }}>
                  {selectedTimetableClass} — Master Period Timetable (2026-2027)
                </h2>
                <p style={{ fontSize: "0.82rem", color: "#475569", margin: 0 }}>
                  Morning Assembly: 9:00 AM – 9:15 AM | Lunch &amp; MDM Break: 12:35 PM – 1:20 PM
                </p>
              </div>
            </div>
            <div className="no-print" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Class 10", "Class 9", "Class 8", "Class 7", "Class 6"].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedTimetableClass(cls)}
                  className={selectedTimetableClass === cls ? "btn btn-primary" : "btn btn-secondary"}
                  style={{ fontSize: "0.85rem" }}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              className="custom-table"
              style={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                border: "1.5px solid #1e3a8a",
                fontSize: "0.82rem",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#eff6ff" }}>
                  <th style={{ width: "10%", padding: "10px 6px", border: "1px solid #94a3b8", color: "#1e3a8a", fontWeight: 800 }}>
                    Day
                  </th>
                  <th style={{ width: "11.25%", padding: "10px 5px", border: "1px solid #94a3b8" }}>
                    Period 1<br />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>9:15–10:00</span>
                  </th>
                  <th style={{ width: "11.25%", padding: "10px 5px", border: "1px solid #94a3b8" }}>
                    Period 2<br />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>10:00–10:45</span>
                  </th>
                  <th style={{ width: "11.25%", padding: "10px 5px", border: "1px solid #94a3b8" }}>
                    Period 3<br />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>10:55–11:40</span>
                  </th>
                  <th style={{ width: "11.25%", padding: "10px 5px", border: "1px solid #94a3b8" }}>
                    Period 4<br />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>11:40–12:35</span>
                  </th>
                  <th style={{ width: "11.25%", padding: "10px 5px", border: "1px solid #94a3b8" }}>
                    Period 5<br />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>1:20–2:05</span>
                  </th>
                  <th style={{ width: "11.25%", padding: "10px 5px", border: "1px solid #94a3b8" }}>
                    Period 6<br />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>2:05–2:50</span>
                  </th>
                  <th style={{ width: "11.25%", padding: "10px 5px", border: "1px solid #94a3b8" }}>
                    Period 7<br />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>3:00–3:45</span>
                  </th>
                  <th style={{ width: "11.25%", padding: "10px 5px", border: "1px solid #94a3b8" }}>
                    Period 8<br />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569" }}>3:45–4:30</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTimetableRows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "12px 6px", border: "1px solid #cbd5e1", fontWeight: "800", color: "#1e3a8a", backgroundColor: "#f8fafc" }}>
                      {row.day}
                    </td>
                    <td style={{ padding: "12px 5px", border: "1px solid #cbd5e1" }}>{row.p1}</td>
                    <td style={{ padding: "12px 5px", border: "1px solid #cbd5e1" }}>{row.p2}</td>
                    <td style={{ padding: "12px 5px", border: "1px solid #cbd5e1" }}>{row.p3}</td>
                    <td style={{ padding: "12px 5px", border: "1px solid #cbd5e1" }}>{row.p4}</td>
                    <td style={{ padding: "12px 5px", border: "1px solid #cbd5e1" }}>{row.p5}</td>
                    <td style={{ padding: "12px 5px", border: "1px solid #cbd5e1" }}>{row.p6}</td>
                    <td style={{ padding: "12px 5px", border: "1px solid #cbd5e1" }}>{row.p7}</td>
                    <td style={{ padding: "12px 5px", border: "1px solid #cbd5e1", fontWeight: "600", color: "#059669" }}>
                      {row.p8}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CLASSWISE EXAMINATIONS (FAs, SAs, Pre-Final) */}
      {activeTab === "EXAMS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Examination Calendar Overview */}
          <div className="card">
            <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={20} /> Academic Year 2026-2027 Examination Schedule (FA 1–4, SA 1–2 &amp; SSC Pre-Final)
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Exam Code</th>
                    <th>Examination Name</th>
                    <th>Applicable Classes</th>
                    <th>Schedule Month</th>
                    <th>Pattern / Weightage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {examSchedule.map((ex) => (
                    <tr key={ex.examCode}>
                      <td style={{ fontWeight: "800", color: "#1e3a8a" }}>{ex.examCode}</td>
                      <td style={{ fontWeight: "700" }}>{ex.examName}</td>
                      <td>{ex.classes}</td>
                      <td>{ex.month}</td>
                      <td>{ex.weightage}</td>
                      <td>
                        <span className={ex.status === "COMPLETED" ? "badge badge-success" : "badge badge-warning"}>
                          {ex.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Classwise Marks & Grades Register */}
          <div className="card">
            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <h3 style={{ fontSize: "1.25rem", color: "#0f172a" }}>Classwise Examination Results Register</h3>
                <select
                  className="form-control"
                  style={{ width: "auto" }}
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  <option value="ALL">All Examinations</option>
                  <option value="FA-1">FA-1 (Formative 1)</option>
                  <option value="FA-2">FA-2 (Formative 2)</option>
                  <option value="SA-1">SA-1 (Summative 1)</option>
                  <option value="FA-3">FA-3 (Formative 3)</option>
                  <option value="FA-4">FA-4 (Formative 4)</option>
                  <option value="PRE-FINAL">Pre-Final (Class 10 SSC)</option>
                  <option value="SA-2">SA-2 (Annual / Board)</option>
                </select>
                <select
                  className="form-control"
                  style={{ width: "auto" }}
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="ALL">All Classes (6th–10th)</option>
                  <option value="10">Class 10</option>
                  <option value="9">Class 9</option>
                  <option value="8">Class 8</option>
                  <option value="7">Class 7</option>
                  <option value="6">Class 6</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button type="button" onClick={exportExamsExcel} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
                  <Download size={16} /> Export Excel
                </button>
                <button type="button" onClick={() => setShowMarksModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                  <Plus size={16} /> Enter / Update Exam Marks
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Adm No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Exam</th>
                    <th>Telugu</th>
                    <th>Hindi</th>
                    <th>English</th>
                    <th>Maths</th>
                    <th>Science</th>
                    <th>Social</th>
                    <th>Total</th>
                    <th>%</th>
                    <th>Grade / GPA</th>
                    <th className="no-print">Progress Card</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((g) => (
                    <tr key={g.id}>
                      <td style={{ fontFamily: "monospace" }}>{g.admissionNo}</td>
                      <td style={{ fontWeight: "700", color: "#0f172a" }}>{g.studentName}</td>
                      <td>
                        <span className="badge badge-primary">Class {g.classLevel}</span>
                      </td>
                      <td style={{ fontWeight: "700", color: "#1e3a8a" }}>{g.examName}</td>
                      <td>{g.teluguMarks}</td>
                      <td>{g.hindiMarks}</td>
                      <td>{g.englishMarks}</td>
                      <td style={{ fontWeight: "700" }}>{g.mathsMarks}</td>
                      <td style={{ fontWeight: "700" }}>{g.scienceMarks}</td>
                      <td>{g.socialMarks}</td>
                      <td style={{ fontWeight: "800" }}>
                        {g.totalMarks}/{g.maxMarks}
                      </td>
                      <td>{g.percentage}%</td>
                      <td>
                        <span className="badge badge-success">
                          {g.overallGrade} ({g.gpa})
                        </span>
                      </td>
                      <td className="no-print">
                        <button
                          type="button"
                          onClick={() => setReportCardItem(g)}
                          className="btn btn-secondary"
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                        >
                          <Printer size={13} /> Card
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enter / Update Marks */}
      {showMarksModal && (
        <div className="lightbox" onClick={() => setShowMarksModal(false)}>
          <div
            className="card"
            style={{ maxWidth: "600px", width: "95%", backgroundColor: "white", padding: "2rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a" }}>Enter Student Examination Marks</h3>
              <button onClick={() => setShowMarksModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMarks}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Select Student *</label>
                  <select
                    className="form-control"
                    value={marksForm.admissionNo}
                    onChange={(e) => setMarksForm({ ...marksForm, admissionNo: e.target.value })}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.admissionNo}>
                        {s.name} (Class {s.classLevel} - {s.admissionNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Examination *</label>
                  <select
                    className="form-control"
                    value={marksForm.examName}
                    onChange={(e) => setMarksForm({ ...marksForm, examName: e.target.value })}
                  >
                    <option value="FA-1">FA-1</option>
                    <option value="FA-2">FA-2</option>
                    <option value="SA-1">SA-1</option>
                    <option value="FA-3">FA-3</option>
                    <option value="FA-4">FA-4</option>
                    <option value="PRE-FINAL">PRE-FINAL</option>
                    <option value="SA-2">SA-2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Telugu Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={marksForm.teluguMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, teluguMarks: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hindi Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={marksForm.hindiMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, hindiMarks: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">English Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={marksForm.englishMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, englishMarks: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mathematics Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={marksForm.mathsMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, mathsMarks: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Science Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={marksForm.scienceMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, scienceMarks: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Social Studies Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={marksForm.socialMarks}
                    onChange={(e) => setMarksForm({ ...marksForm, socialMarks: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMarksModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save &amp; Calculate GPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Progress Card Modal */}
      {reportCardItem && (
        <div className="lightbox" onClick={() => setReportCardItem(null)}>
          <div
            className="card"
            style={{ maxWidth: "740px", width: "95%", backgroundColor: "white", padding: "2.25rem", border: "3px solid #1e3a8a" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <strong style={{ color: "#1e3a8a" }}>Official Student Progress Report Card</strong>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => window.print()} className="btn btn-primary" style={{ fontSize: "0.8rem" }}>
                  <Printer size={15} /> Print Progress Card
                </button>
                <button onClick={() => setReportCardItem(null)} className="btn btn-secondary" style={{ fontSize: "0.8rem" }}>
                  <X size={15} /> Close
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center", borderBottom: "2px solid #1e3a8a", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <h2 style={{ color: "#1e3a8a", fontSize: "1.45rem", fontWeight: "800" }}>
                ZILLA PARISHAD HIGH SCHOOL, SOMASANIGUNTA
              </h2>
              <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                Venkatagiri Mandal, Tirupati District • UDISE: 28193503404
              </div>
              <div style={{ marginTop: "6px", fontWeight: "800", color: "#15803d", fontSize: "1rem" }}>
                {reportCardItem.examName} EXAMINATION PROGRESS REPORT ({reportCardItem.academicYear})
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontSize: "0.9rem" }}>
              <div>
                <div><strong>Student Name:</strong> {reportCardItem.studentName}</div>
                <div><strong>Admission No:</strong> {reportCardItem.admissionNo}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div><strong>Class:</strong> Class {reportCardItem.classLevel}</div>
                <div><strong>Overall Grade &amp; GPA:</strong> {reportCardItem.overallGrade} ({reportCardItem.gpa} GPA)</div>
              </div>
            </div>

            <table className="custom-table" style={{ marginBottom: "1.5rem" }}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks Secured</th>
                  <th>Max Marks</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>First Language (Telugu)</td><td>{reportCardItem.teluguMarks}</td><td>{reportCardItem.maxMarks / 6}</td></tr>
                <tr><td>Second Language (Hindi)</td><td>{reportCardItem.hindiMarks}</td><td>{reportCardItem.maxMarks / 6}</td></tr>
                <tr><td>Third Language (English)</td><td>{reportCardItem.englishMarks}</td><td>{reportCardItem.maxMarks / 6}</td></tr>
                <tr><td>Mathematics</td><td>{reportCardItem.mathsMarks}</td><td>{reportCardItem.maxMarks / 6}</td></tr>
                <tr><td>General / Physical &amp; Bio Science</td><td>{reportCardItem.scienceMarks}</td><td>{reportCardItem.maxMarks / 6}</td></tr>
                <tr><td>Social Studies</td><td>{reportCardItem.socialMarks}</td><td>{reportCardItem.maxMarks / 6}</td></tr>
                <tr style={{ fontWeight: "800", backgroundColor: "#f8fafc" }}>
                  <td>TOTAL SCORE</td>
                  <td>{reportCardItem.totalMarks} ({reportCardItem.percentage}%)</td>
                  <td>{reportCardItem.maxMarks}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: "0.85rem", fontStyle: "italic", color: "#334155", marginBottom: "2.5rem" }}>
              <strong>Teacher Remarks:</strong> {reportCardItem.teacherRemarks}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "700" }}>
              <div>Class Teacher Signature</div>
              <div>Parent Signature</div>
              <div>Headmaster: Sri Gangalapudi Bhaskar Reddy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

