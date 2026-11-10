"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  User, 
  X, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  Printer,
  FileText,
  Camera,
  RefreshCw
} from "lucide-react";
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
  academicPerformance: string;
  attendancePercentage: number;
  coCurricular: string | null;
  sportsAchievements: string | null;
  certificates: string | null;
  photo: string | null;
  generalNotes: string | null;
  admissionFormData?: AdmissionFormExtraData | string | null;
}

const DEFAULT_EXTRA_FORM: AdmissionFormExtraData = {
  motherTongue: "Telugu",
  fatherOccupation: "Agriculture",
  fatherAadhar: "",
  motherOccupation: "Homemaker",
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
  previousSchoolName: "MPPS Somasanigunta",
  previousSchoolCode: "",
  previousClass: "5th",
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [admissionFormStudent, setAdmissionFormStudent] = useState<Student | null>(null);

  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const startCamera = async (facing: "user" | "environment" = cameraFacing) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        mobileCameraInputRef.current?.click();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 800 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 80);
    } catch {
      mobileCameraInputRef.current?.click();
    }
  };

  const handleToggleCameraFacing = () => {
    const next = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(next);
    startCamera(next);
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const w = video.videoWidth || 480;
    const h = video.videoHeight || 600;
    canvas.width = 360;
    canvas.height = 440;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const targetRatio = 360 / 440;
      const srcRatio = w / h;
      let sx = 0,
        sy = 0,
        sw = w,
        sh = h;
      if (srcRatio > targetRatio) {
        sw = h * targetRatio;
        sx = (w - sw) / 2;
      } else {
        sh = w / targetRatio;
        sy = (h - sh) / 2;
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 360, 440);
      setFormPhoto(canvas.toDataURL("image/jpeg", 0.88));
    }
    stopCamera();
  };

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
    address: "",
    aadhaarNo: "",
    apaarId: "",
    penId: "",
    academicPerformance: "Average",
    attendancePercentage: 100,
    coCurricular: "",
    sportsAchievements: "",
    certificates: "[]",
    generalNotes: ""
  });
  const [extraForm, setExtraForm] = useState<AdmissionFormExtraData>({ ...DEFAULT_EXTRA_FORM });

  const handleExtraChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExtraForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch all students on load
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error("Failed to load students data");
      const data = await res.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "classLevel" ? parseInt(value) : name === "attendancePercentage" ? parseFloat(value) : value
    }));
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setError("");

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      setFormPhoto(data.url);
      setSuccess("Profile photo uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditMode(false);
    setSelectedStudentId(null);
    setFormPhoto(null);
    setFormData({
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
      address: "Somasanigunta",
      aadhaarNo: "",
      apaarId: "",
      penId: "",
      academicPerformance: "Average",
      attendancePercentage: 100,
      coCurricular: "",
      sportsAchievements: "",
      certificates: "[]",
      generalNotes: ""
    });
    setExtraForm({ ...DEFAULT_EXTRA_FORM });
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (student: Student) => {
    setEditMode(true);
    setSelectedStudentId(student.id);
    setFormPhoto(student.photo);
    const parsedExtra = parseAdmissionFormData(student.admissionFormData);
    setFormData({
      name: student.name,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo,
      classLevel: student.classLevel,
      gender: student.gender,
      dob: student.dob,
      caste: student.caste || "",
      admissionYear: student.admissionYear || "2026-2027",
      bloodGroup: student.bloodGroup || "O+",
      fatherName: student.fatherName || student.parentName || "",
      motherName: student.motherName || "",
      mobileNo: student.mobileNo,
      address: student.address,
      aadhaarNo: student.aadhaarNo,
      apaarId: student.apaarId || "",
      penId: student.penId || "",
      academicPerformance: student.academicPerformance,
      attendancePercentage: student.attendancePercentage,
      coCurricular: student.coCurricular || "",
      sportsAchievements: student.sportsAchievements || "",
      certificates: student.certificates || "[]",
      generalNotes: student.generalNotes || ""
    });
    setExtraForm({
      ...DEFAULT_EXTRA_FORM,
      ...parsedExtra,
      childInfoNo: parsedExtra.childInfoNo || student.penId || student.apaarId || "",
      remarks: parsedExtra.remarks || student.generalNotes || "",
    });
    setShowModal(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      ...formData,
      generalNotes: extraForm.remarks || formData.generalNotes,
      admissionFormData: {
        ...extraForm,
        childInfoNo: extraForm.childInfoNo || formData.penId || formData.apaarId || "",
      },
      photo: formPhoto,
      id: selectedStudentId
    };

    try {
      const response = await fetch("/api/students", {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Operation failed");

      setSuccess(
        editMode
          ? "Student profile updated!"
          : "Student profile created! Official Admission Form generated below."
      );
      setShowModal(false);
      if (!editMode) {
        setAdmissionFormStudent(resData);
      }
      fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to submit student form");
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this student record? This action cannot be undone.")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess("Student record deleted successfully.");
      fetchStudents();
    } catch (err: any) {
      setError(err.message || "Failed to delete student record");
    }
  };

  // Excel Bulk Import
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rows.length === 0) {
          setError("No data found in selected Excel sheet.");
          return;
        }

        setLoading(true);
        const studentPayloads = [];
        const classCounters: Record<number, number> = { 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };

        const parseExcelClass = (rawClass: any, rawRoll: any): number => {
          const s = String(rawClass || "").trim().toUpperCase();
          if (s === "VI" || s === "6" || s === "6TH") return 6;
          if (s === "VII" || s === "7" || s === "7TH") return 7;
          if (s === "VIII" || s === "8" || s === "8TH") return 8;
          if (s === "IX" || s === "9" || s === "9TH") return 9;
          if (s === "X" || s === "10" || s === "10TH") return 10;
          const d = parseInt(s.replace(/\D/g, ""), 10);
          if (d >= 6 && d <= 10) return d;
          const r = parseInt(String(rawRoll || ""), 10);
          if (r >= 6 && r <= 10) return r;
          return 6;
        };

        for (const row of rows) {
          // Map spreadsheet fields to api fields
          const name = String(row["Name"] || row["studentName"] || "").trim();
          if (!name) {
            continue;
          }

          const parsedClass = parseExcelClass(row["Class"] ?? row["classLevel"], row["Roll No"]);
          classCounters[parsedClass] = (classCounters[parsedClass] || 0) + 1;
          const seqInClass = classCounters[parsedClass];
          const entryYearMap: Record<number, number> = { 6: 2026, 7: 2025, 8: 2024, 9: 2023, 10: 2022 };
          const entryYear = entryYearMap[parsedClass] || 2026;

          const rawAdm = String(row["Admission No"] || row["admissionNo"] || "").trim();
          const admissionNo = rawAdm || `ADM/${entryYear}/${parsedClass}${String(seqInClass).padStart(2, "0")}`;

          const studentPayload = {
            name,
            admissionNo,
            rollNo: String(seqInClass),
            classLevel: parsedClass,
            gender: row["Gender"] || row["gender"] || undefined,
            dob: row["Date of Birth"] || row["dob"] || undefined,
            caste: row["Caste"] || row["caste"] || undefined,
            bloodGroup: row["Blood Group"] || row["bloodGroup"] || undefined,
            fatherName: row["Father Name"] || row["Father name"] || row["fatherName"] || row["Parent Name"] || row["parentName"] || undefined,
            motherName: row["Mother Name"] || row["Mother name"] || row["motherName"] || undefined,
            mobileNo: row["Mobile No"] !== undefined ? String(row["Mobile No"]) : (row["mobileNo"] !== undefined ? String(row["mobileNo"]) : undefined),
            address: row["Address"] || row["address"] || undefined,
            aadhaarNo: row["Aadhaar Number"] !== undefined ? String(row["Aadhaar Number"]) : (row["aadhaarNo"] !== undefined ? String(row["aadhaarNo"]) : undefined),
            apaarId: row["APAAR ID"] !== undefined ? String(row["APAAR ID"]) : (row["apaarId"] !== undefined ? String(row["apaarId"]) : undefined),
            penId: row["PEN ID"] !== undefined ? String(row["PEN ID"]) : (row["penId"] !== undefined ? String(row["penId"]) : undefined),
            academicPerformance: row["Academic Performance"] || row["academicPerformance"] || undefined,
            attendancePercentage: row["Attendance %"] !== undefined ? parseFloat(String(row["Attendance %"]).replace(/%/g, "")) : (row["attendancePercentage"] !== undefined ? parseFloat(row["attendancePercentage"]) : undefined),
            coCurricular: row["Co-Curricular Activities"] || row["coCurricular"] || undefined,
            sportsAchievements: row["Sports Achievements"] || row["sportsAchievements"] || undefined,
            generalNotes: row["General Notes"] || row["generalNotes"] || undefined,
          };

          studentPayloads.push(studentPayload);
        }

        if (studentPayloads.length === 0) {
          setError("No valid student records found in selected Excel sheet.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentPayloads),
        });

        if (res.ok) {
          const results = await res.json();
          setSuccess(`Bulk Import Summary: Successfully added/updated ${results.length} student records.`);
          fetchStudents();
        } else {
          const errData = await res.json();
          throw new Error(errData.error || "Bulk import failed.");
        }
      } catch (err: any) {
        setError(err.message || "Error parsing Excel file. Please ensure correct column headers.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export visible list to Excel
  const handleExcelExport = () => {
    const dataToExport = filteredStudents.map((s) => ({
      "Admission No": s.admissionNo,
      "Admission Year": s.admissionYear || "2026-2027",
      "Roll No": s.rollNo,
      "Class": `Class ${s.classLevel}`,
      "Name": s.name,
      "Gender": s.gender,
      "Date of Birth": s.dob,
      "Caste": s.caste || "",
      "Blood Group": s.bloodGroup || "N/A",
      "Aadhaar Number": s.aadhaarNo,
      "APAAR ID": s.apaarId || "",
      "PEN ID": s.penId || "",
      "Father Name": s.fatherName || s.parentName || "",
      "Mother Name": s.motherName || "",
      "Mobile No": s.mobileNo,
      "Address": s.address,
      "Attendance %": `${s.attendancePercentage}%`,
      "Academic Performance": s.academicPerformance,
      "Co-Curricular Activities": s.coCurricular || "None",
      "Sports Achievements": s.sportsAchievements || "None",
      "General Notes": s.generalNotes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students List");
    
    // Fit column widths
    worksheet["!cols"] = Array(21).fill({ wch: 18 });

    XLSX.writeFile(workbook, `ZPHS_Admin_Students_List_Class_${selectedClass}.xlsx`);
  };

  // Filter student array
  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClass === "ALL" ? true : s.classLevel === parseInt(selectedClass);
    const matchesYear = selectedYear === "ALL" ? true : (s.admissionYear || "2026-2027") === selectedYear;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.includes(searchQuery) ||
      s.aadhaarNo.includes(searchQuery) ||
      (s.apaarId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.penId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.caste || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.mobileNo || "").includes(searchQuery);
    return matchesClass && matchesYear && matchesSearch;
  });

  const admissionYears = ["2026-2027", "2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className={admissionFormStudent ? "no-print" : ""} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>Student Database Management</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Add, edit, delete, and bulk import/export student records</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          
          {/* Bulk Import */}
          <label className="btn btn-secondary" style={{ fontSize: "0.85rem", cursor: "pointer" }}>
            <Upload size={16} /> Import Excel
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              style={{ display: "none" }} 
              onChange={handleExcelImport} 
            />
          </label>

          {/* Export */}
          <button onClick={handleExcelExport} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            <Download size={16} /> Export Excel
          </button>

          {/* Print List */}
          <button onClick={() => window.print()} className="btn btn-secondary no-print" style={{ fontSize: "0.85rem" }}>
            <Printer size={16} /> Print List
          </button>

          {/* Add Manual */}
          <button onClick={openAddModal} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
            <Plus size={16} /> School Admission Form (Register Student)
          </button>
        </div>
      </div>

      {/* Year-wise Admissions Summary Strip */}
      <div className="card no-print" style={{ padding: "1rem 1.25rem", backgroundColor: "#f8fafc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase" }}>
            Year-Wise Admissions Register:
          </span>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSelectedYear("ALL")}
              className={selectedYear === "ALL" ? "btn btn-primary" : "btn btn-secondary"}
              style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            >
              All Years ({students.length})
            </button>
            {admissionYears.map((yr) => {
              const cnt = students.filter((s) => (s.admissionYear || "2026-2027") === yr).length;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={selectedYear === yr ? "btn btn-primary" : "btn btn-secondary"}
                  style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                >
                  {yr} ({cnt})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messaging alerts */}
      {error && (
        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#15803d", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search grid controls */}
      <div className="card no-print" style={{ padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search students by name, admission no, roll no, aadhaar, APAAR ID, or PEN ID..."
              style={{ paddingLeft: "2.5rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          </div>
          <select 
            className="form-control" 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="ALL">All Classes</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
          <select
            className="form-control"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="ALL">All Admission Years</option>
            {admissionYears.map((yr) => (
              <option key={yr} value={yr}>
                Academic Year {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Database Table Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Loading student records...</div>
      ) : (
        <div className={`table-container ${admissionFormStudent ? "no-print" : ""}`}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Adm No</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Name</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Caste</th>
                <th>Aadhaar Number</th>
                <th>APAAR ID</th>
                <th>PEN ID</th>
                <th>Father Name</th>
                <th>Mother Name</th>
                <th>Mobile Number</th>
                <th>Attendance %</th>
                <th>Performance</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
                        <img 
                          src={s.photo || (s.gender === "Male" ? "/images/placeholders/student_male.svg" : "/images/placeholders/student_female.svg")} 
                          alt="" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      </div>
                    </td>
                    <td>{s.admissionNo}</td>
                    <td>{s.rollNo}</td>
                    <td><span className="badge badge-primary">Class {s.classLevel}</span></td>
                    <td style={{ fontWeight: "bold", color: "#0f172a" }}>
                      {s.name}
                      {s.generalNotes && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "normal", marginTop: "4px", fontStyle: "italic" }}>
                          📝 {s.generalNotes}
                        </div>
                      )}
                    </td>
                    <td>{s.gender}</td>
                    <td>{s.dob}</td>
                    <td>{s.caste || "—"}</td>
                    <td style={{ fontFamily: "monospace" }}>{s.aadhaarNo}</td>
                    <td style={{ fontFamily: "monospace" }}>{s.apaarId || "—"}</td>
                    <td style={{ fontFamily: "monospace" }}>{s.penId || "—"}</td>
                    <td>{s.fatherName || s.parentName || "—"}</td>
                    <td>{s.motherName || "—"}</td>
                    <td>{s.mobileNo}</td>
                    <td style={{ fontWeight: "bold", color: s.attendancePercentage >= 90 ? "#15803d" : "#b45309" }}>
                      {s.attendancePercentage}%
                    </td>
                    <td>{s.academicPerformance}</td>
                    <td className="no-print">
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setAdmissionFormStudent(s)}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#059669", padding: "4px" }}
                          title="View & Print Admission Form"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          onClick={() => openEditModal(s)}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#1e3a8a", padding: "4px" }}
                          title="Edit Student"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(s.id)}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={17} style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
                    No student records matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Overlay Modal Form (Converted to Official Samagra Shiksha School Admission Form) */}
      {showModal && (
        <div className="lightbox" onClick={() => setShowModal(false)}>
          <div
            className="card"
            style={{
              maxWidth: "880px",
              width: "96%",
              backgroundColor: "white",
              padding: "2rem",
              maxHeight: "92vh",
              overflowY: "auto",
              border: "2px solid #1e3a8a",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header matching School Admission Form */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #1e3a8a",
                paddingBottom: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src="/images/ap_logo.jpg"
                  alt="AP Emblem"
                  style={{ width: "54px", height: "54px", objectFit: "contain", borderRadius: "50%" }}
                />
                <div>
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      border: "1px solid #f59e0b",
                      padding: "2px 10px",
                      borderRadius: "999px",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      marginBottom: "3px",
                    }}
                  >
                    SAMAGRA SHIKSHA • ZPHS SOMASANIGUNTA
                  </div>
                  <h3 style={{ fontSize: "1.35rem", color: "#111827", fontWeight: 900, margin: 0 }}>
                    {editMode
                      ? "EDIT SCHOOL ADMISSION FORM"
                      : "SCHOOL ADMISSION FORM (STUDENT REGISTRATION)"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Passport Photo Upload Box + Top Summary */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                  backgroundColor: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "0.95rem" }}>
                    Fill all 16 points of the Official School Admission Form below
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "2px" }}>
                    Once submitted, the printable Samagra Shiksha School Admission Form is generated automatically.
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "76px",
                      height: "92px",
                      border: "1.5px solid #111827",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      textAlign: "center",
                      padding: "2px",
                    }}
                  >
                    {formPhoto ? (
                      <img
                        src={formPhoto}
                        alt="Student"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: "9px", color: "#64748b", fontWeight: 600 }}>
                        Passport Size Photo
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <label
                        className="btn btn-secondary"
                        style={{ fontSize: "0.8rem", cursor: "pointer", padding: "0.45rem 0.85rem" }}
                      >
                        <Upload size={14} /> {photoUploading ? "Uploading..." : "Upload Student Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handlePhotoUpload}
                          disabled={photoUploading}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="btn btn-primary"
                        style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem", backgroundColor: "#059669" }}
                      >
                        <Camera size={14} /> Take Photo (Camera)
                      </button>
                      <input
                        ref={mobileCameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={handlePhotoUpload}
                      />
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Upload from device or capture live photo using Camera
                    </div>
                  </div>
                </div>
              </div>

              {cameraOpen && (
                <div
                  style={{
                    border: "2px solid #059669",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "1rem",
                    backgroundColor: "#0f172a",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                    Live Camera Preview — Position student face in frame
                  </div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "240px",
                      height: "290px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #10b981",
                      backgroundColor: "#000",
                    }}
                  />
                  <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="btn btn-primary"
                      style={{ backgroundColor: "#10b981", fontSize: "0.85rem" }}
                    >
                      <Camera size={15} /> Capture Passport Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleCameraFacing}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <RefreshCw size={15} /> Switch Front / Back Camera
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="btn btn-danger"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <X size={15} /> Close Camera
                    </button>
                  </div>
                </div>
              )}

              {/* 1, 2, 3, 4: Student Basic Details */}
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e3a8a",
                    fontSize: "0.9rem",
                    marginBottom: "0.75rem",
                    borderBottom: "1px dashed #cbd5e1",
                    paddingBottom: "0.4rem",
                  }}
                >
                  Items 1 – 4: Student Personal &amp; Identity Details
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem" }}>
                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">1. Name of the Student *</label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Enter Full Name of the Student"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">2. Gender (Boy / Girl / TG) *</label>
                    <select
                      name="gender"
                      className="form-control"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="Male">Boy (Male)</option>
                      <option value="Female">Girl (Female)</option>
                      <option value="TG">TG</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">3. Date of Birth *</label>
                    <input
                      name="dob"
                      type="date"
                      className="form-control"
                      value={formData.dob}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">4a. Mother Tongue</label>
                    <input
                      name="motherTongue"
                      type="text"
                      className="form-control"
                      value={extraForm.motherTongue || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. Telugu"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">4b. Aadhar No. of the Student</label>
                    <input
                      name="aadhaarNo"
                      type="text"
                      className="form-control"
                      value={formData.aadhaarNo}
                      onChange={handleInputChange}
                      placeholder="12-digit Student Aadhar No."
                    />
                  </div>
                </div>
              </div>

              {/* 5, 6, 7, 8: Father, Mother, Bank Details & Guardian */}
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e3a8a",
                    fontSize: "0.9rem",
                    marginBottom: "0.75rem",
                    borderBottom: "1px dashed #cbd5e1",
                    paddingBottom: "0.4rem",
                  }}
                >
                  Items 5 – 8: Father, Mother, Bank Account &amp; Guardian Details
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">5a. Father&apos;s Name</label>
                    <input
                      name="fatherName"
                      type="text"
                      className="form-control"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Father's Full Name"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">5b. Father&apos;s Occupation</label>
                    <input
                      name="fatherOccupation"
                      type="text"
                      className="form-control"
                      value={extraForm.fatherOccupation || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. Agriculture / Labour"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">5c. Father&apos;s Aadhar No.</label>
                    <input
                      name="fatherAadhar"
                      type="text"
                      className="form-control"
                      value={extraForm.fatherAadhar || ""}
                      onChange={handleExtraChange}
                      placeholder="12-digit Father Aadhar"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">5d. Father&apos;s Phone No.</label>
                    <input
                      name="mobileNo"
                      type="tel"
                      className="form-control"
                      value={formData.mobileNo}
                      onChange={handleInputChange}
                      placeholder="10-digit Mobile No."
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6a. Mother&apos;s Name</label>
                    <input
                      name="motherName"
                      type="text"
                      className="form-control"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Mother's Full Name"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6b. Mother&apos;s Occupation</label>
                    <input
                      name="motherOccupation"
                      type="text"
                      className="form-control"
                      value={extraForm.motherOccupation || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. Homemaker / Tailoring"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6c. Mother&apos;s Bank A/c No.</label>
                    <input
                      name="motherBankAccount"
                      type="text"
                      className="form-control"
                      value={extraForm.motherBankAccount || ""}
                      onChange={handleExtraChange}
                      placeholder="Bank Account Number"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6d. Mother&apos;s Aadhar No.</label>
                    <input
                      name="motherAadhar"
                      type="text"
                      className="form-control"
                      value={extraForm.motherAadhar || ""}
                      onChange={handleExtraChange}
                      placeholder="12-digit Mother Aadhar"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">6e. Name of the Bank &amp; Branch</label>
                    <input
                      name="motherBankNameBranch"
                      type="text"
                      className="form-control"
                      value={extraForm.motherBankNameBranch || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. SBI, Venkatagiri Branch"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6f. IFSC Code</label>
                    <input
                      name="motherBankIfsc"
                      type="text"
                      className="form-control"
                      value={extraForm.motherBankIfsc || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. SBIN0000789"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6g. MICR Code</label>
                    <input
                      name="motherBankMicr"
                      type="text"
                      className="form-control"
                      value={extraForm.motherBankMicr || ""}
                      onChange={handleExtraChange}
                      placeholder="MICR Code (optional)"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">6h. Mother&apos;s Phone No.</label>
                    <input
                      name="motherPhone"
                      type="tel"
                      className="form-control"
                      value={extraForm.motherPhone || ""}
                      onChange={handleExtraChange}
                      placeholder="Mother's Mobile No."
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">7a. Family Ration Card No.</label>
                    <input
                      name="rationCardNo"
                      type="text"
                      className="form-control"
                      value={extraForm.rationCardNo || ""}
                      onChange={handleExtraChange}
                      placeholder="Rice / Ration Card No."
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">7b. Residing with Parents / Guardian</label>
                    <select
                      name="residingWith"
                      className="form-control"
                      value={extraForm.residingWith || "Parents"}
                      onChange={handleExtraChange}
                    >
                      <option value="Parents">Parents</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">8a. Guardian&apos;s Name (if any)</label>
                    <input
                      name="guardianName"
                      type="text"
                      className="form-control"
                      value={extraForm.guardianName || ""}
                      onChange={handleExtraChange}
                      placeholder="Leave blank if with parents"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">8b. Guardian&apos;s Occupation</label>
                    <input
                      name="guardianOccupation"
                      type="text"
                      className="form-control"
                      value={extraForm.guardianOccupation || ""}
                      onChange={handleExtraChange}
                    />
                  </div>
                </div>
              </div>

              {/* 9, 10, 11: Nationality, Caste, Sub-Caste & Residence */}
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e3a8a",
                    fontSize: "0.9rem",
                    marginBottom: "0.75rem",
                    borderBottom: "1px dashed #cbd5e1",
                    paddingBottom: "0.4rem",
                  }}
                >
                  Items 9 – 11: Nationality, Religion, Caste &amp; Residence
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">9a. Nationality</label>
                    <input
                      name="nationality"
                      type="text"
                      className="form-control"
                      value={extraForm.nationality || "Indian"}
                      onChange={handleExtraChange}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">9b. State</label>
                    <input
                      name="state"
                      type="text"
                      className="form-control"
                      value={extraForm.state || "Andhra Pradesh"}
                      onChange={handleExtraChange}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">9c. Religion</label>
                    <input
                      name="religion"
                      type="text"
                      className="form-control"
                      value={extraForm.religion || "Hindu"}
                      onChange={handleExtraChange}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">10a. Caste Category</label>
                    <input
                      name="caste"
                      type="text"
                      className="form-control"
                      value={formData.caste}
                      onChange={handleInputChange}
                      placeholder="OC / BC-A / BC-B / BC-D / SC / ST"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">10b. Sub-caste</label>
                    <input
                      name="subCaste"
                      type="text"
                      className="form-control"
                      value={extraForm.subCaste || ""}
                      onChange={handleExtraChange}
                      placeholder="Enter Sub-caste"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Blood Group</label>
                    <select
                      name="bloodGroup"
                      className="form-control"
                      value={formData.bloodGroup || "O+"}
                      onChange={handleInputChange}
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">11. Residence (Full Village / Habitation Address)</label>
                    <input
                      name="address"
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. Somasanigunta, Venkatagiri Mandal, Tirupati Dist."
                    />
                  </div>
                </div>
              </div>

              {/* 12, 13, 14, 15, 16: Previous School, Admission Class, Languages, Moles & Remarks */}
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e3a8a",
                    fontSize: "0.9rem",
                    marginBottom: "0.75rem",
                    borderBottom: "1px dashed #cbd5e1",
                    paddingBottom: "0.4rem",
                  }}
                >
                  Items 12 – 16: Previous School, Record Sheet/TC, Languages &amp; Identification Marks
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">12a. Name of the School Previous Studying/Studied</label>
                    <input
                      name="previousSchoolName"
                      type="text"
                      className="form-control"
                      value={extraForm.previousSchoolName || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. MPPS Somasanigunta"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12b. Previous School UDISE Code</label>
                    <input
                      name="previousSchoolCode"
                      type="text"
                      className="form-control"
                      value={extraForm.previousSchoolCode || ""}
                      onChange={handleExtraChange}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12c. Studying / Studied Class</label>
                    <input
                      name="previousClass"
                      type="text"
                      className="form-control"
                      value={extraForm.previousClass || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. 5th Class"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12d. Previous Medium</label>
                    <input
                      name="previousMedium"
                      type="text"
                      className="form-control"
                      value={extraForm.previousMedium || ""}
                      onChange={handleExtraChange}
                      placeholder="Telugu / English"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12e. Eligible for Promotion?</label>
                    <select
                      name="eligiblePromotion"
                      className="form-control"
                      value={extraForm.eligiblePromotion || "YES"}
                      onChange={handleExtraChange}
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">12f. As on Admission Days Attended</label>
                    <input
                      name="previousDaysAttended"
                      type="text"
                      className="form-control"
                      value={extraForm.previousDaysAttended || ""}
                      onChange={handleExtraChange}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">13a. No. &amp; Date of Record Sheet / Transfer Certificate (TC)</label>
                    <input
                      name="tcNumberDate"
                      type="text"
                      className="form-control"
                      value={extraForm.tcNumberDate || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. TC No. 45/2025-26 dated 10-06-2026"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">13b. Class Joined in this School *</label>
                    <select
                      name="classLevel"
                      className="form-control"
                      value={formData.classLevel}
                      onChange={handleInputChange}
                    >
                      <option value="6">6th Class</option>
                      <option value="7">7th Class</option>
                      <option value="8">8th Class</option>
                      <option value="9">9th Class</option>
                      <option value="10">10th Class</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">13c. Medium Joined</label>
                    <input
                      name="mediumJoined"
                      type="text"
                      className="form-control"
                      value={extraForm.mediumJoined || ""}
                      onChange={handleExtraChange}
                      placeholder="Telugu / English"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">13d. Child Info No. (PEN ID)</label>
                    <input
                      name="penId"
                      type="text"
                      className="form-control"
                      value={formData.penId}
                      onChange={handleInputChange}
                      placeholder="11-digit PEN / Child Info ID"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">APAAR ID</label>
                    <input
                      name="apaarId"
                      type="text"
                      className="form-control"
                      value={formData.apaarId}
                      onChange={handleInputChange}
                      placeholder="12-digit APAAR ID"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">14a. First Language Opted</label>
                    <input
                      name="firstLanguage"
                      type="text"
                      className="form-control"
                      value={extraForm.firstLanguage || ""}
                      onChange={handleExtraChange}
                      placeholder="Telugu"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">14b. Second Language Opted</label>
                    <input
                      name="secondLanguage"
                      type="text"
                      className="form-control"
                      value={extraForm.secondLanguage || ""}
                      onChange={handleExtraChange}
                      placeholder="Hindi"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">15. Personal Marks for Identification — 1)</label>
                    <input
                      name="mole1"
                      type="text"
                      className="form-control"
                      value={extraForm.mole1 || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. 1) A mole on the right palm"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">15. Personal Marks for Identification — 2)</label>
                    <input
                      name="mole2"
                      type="text"
                      className="form-control"
                      value={extraForm.mole2 || ""}
                      onChange={handleExtraChange}
                      placeholder="e.g. 2) A small scar on the left forehead"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                    <label className="form-label">16. Remarks If Any</label>
                    <input
                      name="remarks"
                      type="text"
                      className="form-control"
                      value={extraForm.remarks || ""}
                      onChange={handleExtraChange}
                      placeholder="Any remarks or general notes"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Office Order Section: Admission Number, Date of Admission, Roll No */}
              <div
                style={{
                  border: "2px solid #1e3a8a",
                  borderRadius: "8px",
                  padding: "1rem",
                  backgroundColor: "#eff6ff",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 900,
                    color: "#1e3a8a",
                    fontSize: "0.95rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  OFFICE ORDER SECTION (Headmaster / Clerk Admission Order)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Admission Number *</label>
                    <input
                      name="admissionNo"
                      type="text"
                      className="form-control"
                      value={formData.admissionNo}
                      onChange={handleInputChange}
                      required
                      disabled={editMode}
                      placeholder="e.g. 2026001"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date of Admission *</label>
                    <input
                      name="dateOfAdmission"
                      type="date"
                      className="form-control"
                      value={extraForm.dateOfAdmission || ""}
                      onChange={handleExtraChange}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Academic Year *</label>
                    <select
                      name="admissionYear"
                      className="form-control"
                      value={formData.admissionYear}
                      onChange={handleInputChange}
                    >
                      {admissionYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Class Roll Number *</label>
                    <input
                      name="rollNo"
                      type="text"
                      className="form-control"
                      value={formData.rollNo}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.25rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? "Save Admission Form Changes" : "Register & Print School Admission Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Generated Printable Official Samagra Shiksha School Admission Form Modal */}
      {admissionFormStudent && (
        <div className="lightbox" onClick={() => setAdmissionFormStudent(null)}>
          <div
            className="card"
            style={{
              maxWidth: "880px",
              width: "96%",
              backgroundColor: "white",
              padding: "1.5rem",
              maxHeight: "94vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Action Buttons (Hidden on Print) */}
            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#15803d", fontWeight: "700" }}>
                <Check size={18} />
                <span>Samagra Shiksha — Official School Admission Form</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => {
                    const s = admissionFormStudent;
                    setAdmissionFormStudent(null);
                    openEditModal(s);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  <Edit size={16} /> Edit Form Details
                </button>
                <button onClick={() => window.print()} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                  <Printer size={16} /> Print Admission Form
                </button>
                <button
                  onClick={() => setAdmissionFormStudent(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  <X size={16} /> Close
                </button>
              </div>
            </div>

            <SchoolAdmissionFormDocument student={admissionFormStudent} />
          </div>
        </div>
      )}

    </div>
  );
}
