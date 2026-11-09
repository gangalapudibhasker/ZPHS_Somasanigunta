"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Search, Download, User, Calendar, Award, Phone, MapPin, Eye, FileBadge, X } from "lucide-react";

interface Student {
  id: number;
  name: string;
  admissionNo: string;
  rollNo: string;
  classLevel: number;
  gender: string;
  dob: string;
  bloodGroup: string | null;
  parentName: string;
  mobileNo: string;
  address: string;
  academicPerformance: string;
  attendancePercentage: number;
  coCurricular: string | null;
  sportsAchievements: string | null;
  certificates: string | null; // JSON String of array
  photo: string | null;
}

export default function StudentPortfolioList({ initialStudents }: { initialStudents: Student[] }) {
  const [students] = useState<Student[]>(initialStudents);
  const [selectedClass, setSelectedClass] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [performanceFilter, setPerformanceFilter] = useState<string>("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Filter Logic
  const filteredStudents = students.filter((student) => {
    const matchesClass = selectedClass === "ALL" ? true : student.classLevel === selectedClass;
    const matchesGender = genderFilter === "ALL" ? true : student.gender === genderFilter;
    const matchesPerformance = performanceFilter === "ALL" ? true : student.academicPerformance === performanceFilter;
    
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.includes(searchQuery);

    return matchesClass && matchesGender && matchesPerformance && matchesSearch;
  });

  // Export to Excel
  const handleExport = () => {
    const dataToExport = filteredStudents.map((s) => ({
      "Admission No": s.admissionNo,
      "Roll No": s.rollNo,
      "Class": `Class ${s.classLevel}`,
      "Name": s.name,
      "Gender": s.gender,
      "Date of Birth": s.dob,
      "Blood Group": s.bloodGroup || "N/A",
      "Parent Name": s.parentName,
      "Mobile No": s.mobileNo,
      "Address": s.address,
      "Attendance %": `${s.attendancePercentage}%`,
      "Academic Performance": s.academicPerformance,
      "Co-Curricular Activities": s.coCurricular || "None",
      "Sports Achievements": s.sportsAchievements || "None",
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
          {filteredStudents.map((s) => (
            <div key={s.id} className="card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1.25rem" }}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                {/* Photo */}
                <div style={{ width: "70px", height: "70px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                  <img
                    src={s.photo || (s.gender === "Male" ? "/images/placeholders/student_male.svg" : "/images/placeholders/student_female.svg")}
                    alt={s.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: "0.25rem" }}>Class {s.classLevel}</span>
                  <h3 style={{ fontSize: "1.1rem", color: "#0f172a" }}>{s.name}</h3>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                    <span>Roll No: {s.rollNo}</span>
                    <span>Adm No: {s.admissionNo}</span>
                  </div>
                </div>
              </div>

              {/* Stats Preview */}
              <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Attendance:</span>
                  <strong style={{ color: s.attendancePercentage >= 90 ? "#15803d" : "#b45309" }}>{s.attendancePercentage}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Academic Grade:</span>
                  <strong style={{ color: "#1e3a8a" }}>{s.academicPerformance}</strong>
                </div>
              </div>

              {/* View Button */}
              <button 
                onClick={() => setSelectedStudent(s)}
                className="btn btn-outline" 
                style={{ width: "100%", marginTop: "auto", padding: "0.5rem", fontSize: "0.825rem" }}
              >
                <Eye size={14} /> View Full Portfolio
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
            No students found matching the selected search criteria.
          </p>
        </div>
      )}

      {/* 3. Detailed Portfolio Modal View */}
      {selectedStudent && (
        <div className="lightbox" onClick={() => setSelectedStudent(null)}>
          <div 
            className="card" 
            style={{ 
              maxWidth: "650px", 
              width: "100%", 
              backgroundColor: "white", 
              padding: "2rem", 
              maxHeight: "90vh", 
              overflowY: "auto",
              position: "relative" 
            }}
            onClick={(e) => e.stopPropagation()} // Stop closing on card click
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
                cursor: "pointer"
              }}
            >
              <X size={24} />
            </button>

            {/* Modal Header */}
            <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#f1f5f9", boxShadow: "var(--shadow-sm)" }}>
                <img
                  src={selectedStudent.photo || (selectedStudent.gender === "Male" ? "/images/placeholders/student_male.svg" : "/images/placeholders/student_female.svg")}
                  alt={selectedStudent.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "0.5rem" }}>Class {selectedStudent.classLevel} - Roll No: {selectedStudent.rollNo}</span>
                <h2 style={{ fontSize: "1.6rem", color: "#1e3a8a" }}>{selectedStudent.name}</h2>
                <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "4px" }}>Admission No: {selectedStudent.admissionNo}</p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <span className="badge badge-success">{selectedStudent.gender}</span>
                  {selectedStudent.bloodGroup && (
                    <span className="badge badge-warning">Blood Group: {selectedStudent.bloodGroup}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content Sections */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* Personal Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <h4 style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", color: "#0f172a" }}>Personal Details</h4>
                <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span className="flex items-center gap-2"><Calendar size={14} style={{ color: "#64748b" }} /> <strong>DOB:</strong> {selectedStudent.dob}</span>
                  <span className="flex items-center gap-2"><User size={14} style={{ color: "#64748b" }} /> <strong>Parent:</strong> {selectedStudent.parentName}</span>
                  <span className="flex items-center gap-2"><Phone size={14} style={{ color: "#64748b" }} /> <strong>Contact:</strong> {selectedStudent.mobileNo}</span>
                  <span className="flex items-center gap-2" style={{ alignItems: "flex-start" }}><MapPin size={14} style={{ color: "#64748b", marginTop: "2px" }} /> <strong>Address:</strong> {selectedStudent.address}</span>
                </div>
              </div>

              {/* Progress Summary */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <h4 style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "4px", color: "#0f172a" }}>Academic progress</h4>
                <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span><strong>Attendance Ratio:</strong></span>
                      <span style={{ color: selectedStudent.attendancePercentage >= 90 ? "#15803d" : "#b45309", fontWeight: "bold" }}>
                        {selectedStudent.attendancePercentage}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          width: `${selectedStudent.attendancePercentage}%`, 
                          height: "100%", 
                          backgroundColor: selectedStudent.attendancePercentage >= 90 ? "#10b981" : "#f59e0b" 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <span><strong>Academic Performance:</strong></span>
                    <span className="badge badge-primary" style={{ marginLeft: "0.5rem" }}>{selectedStudent.academicPerformance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracurriculars and Awards */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <h4 style={{ color: "#0f172a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileBadge size={16} style={{ color: "#10b981" }} /> Co-Curricular Activities
                </h4>
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>
                  {selectedStudent.coCurricular || "No co-curricular activities registered for this academic year."}
                </p>
              </div>

              <div>
                <h4 style={{ color: "#0f172a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Award size={16} style={{ color: "#fbbf24" }} /> Sports Achievements
                </h4>
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>
                  {selectedStudent.sportsAchievements || "No sports awards registered for this academic term."}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
