"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Printer, 
  X, 
  Check, 
  AlertCircle,
  FileText,
  UploadCloud,
  Sparkles
} from "lucide-react";

interface Candidate {
  id: number;
  photo: string | null;
  signature: string | null;
  studentName: string;
  fatherName: string;
  motherName: string;
  parentOccupation: string | null;
  mobileNumber: string;
  aadhaarNumber: string;
  caste: string;
  communityCategory: string;
  religion: string;
  nationality: string;
  dob: string;
  identificationMarks: string;
  gender: string;
  medium: string;
  admissionNumber: string;
  sscRollNumber: string | null;
  previousSchoolDetails: string | null;
  address: string;
}

export default function AdminNominalRollPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [formSig, setFormSig] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState({ photo: false, sig: false });

  const [formData, setFormData] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    parentOccupation: "",
    mobileNumber: "",
    aadhaarNumber: "",
    caste: "",
    communityCategory: "OC",
    religion: "Hindu",
    nationality: "Indian",
    dob: "",
    identificationMarks: "",
    gender: "Male",
    admissionNumber: "",
    sscRollNumber: "",
    previousSchoolDetails: "",
    address: ""
  });

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nominal-roll");
      if (!res.ok) throw new Error("Failed to load nominal roll database");
      const data = await res.json();
      setCandidates(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "sig") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingState((prev) => ({ ...prev, [type]: true }));
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
      
      if (type === "photo") {
        setFormPhoto(data.url);
      } else {
        setFormSig(data.url);
      }
      setSuccess(`${type === "photo" ? "Candidate photo" : "Candidate signature"} uploaded!`);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadingState((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Auto-generate from Student database (Class 10 only)
  const handleAutoGenerate = async () => {
    if (!confirm("This will pull all Class 10 student records that are not currently in the Nominal Roll. Continue?")) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Fetch Class 10 students
      const studRes = await fetch("/api/students?classLevel=10");
      if (!studRes.ok) throw new Error("Failed to fetch student database");
      const class10Students = await studRes.json();

      let added = 0;
      let skipped = 0;

      for (const student of class10Students) {
        // Check if already exists in candidates
        const exists = candidates.some((c) => c.admissionNumber === student.admissionNo);
        if (exists) {
          skipped++;
          continue;
        }

        // POST to nominal-roll
        const candidatePayload = {
          studentName: student.name.toUpperCase(),
          fatherName: student.parentName.toUpperCase(),
          motherName: "Smt. Candidate Mother", // Placeholder to be edited by Admin
          parentOccupation: "Agriculture",
          mobileNumber: student.mobileNo || "",
          aadhaarNumber: student.aadhaarNo ? student.aadhaarNo.replace(/\s/g, "") : "", // Get unmasked aadhaar
          caste: "OC",
          communityCategory: "OC",
          religion: "Hindu",
          nationality: "Indian",
          dob: student.dob,
          identificationMarks: student.coCurricular || "1. A mole on left arm. 2. A mole on neck.",
          gender: student.gender,
          admissionNumber: student.admissionNo,
          sscRollNumber: `2623108${Math.floor(10 + Math.random() * 89)}`, // Random placeholder SSC roll number
          previousSchoolDetails: "ZPHS Primary School, Somasanigunta",
          address: student.address || "Somasanigunta, AP",
          photo: student.photo,
          signature: "/images/placeholders/signature_sample.svg"
        };

        const postRes = await fetch("/api/nominal-roll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(candidatePayload),
        });

        if (postRes.ok) {
          added++;
        } else {
          skipped++;
        }
      }

      setSuccess(`Auto-Generation Completed: Imported ${added} candidates from Class 10 database (Skipped ${skipped}).`);
      fetchCandidates();
    } catch (err: any) {
      setError(err.message || "Failed to auto-generate candidates list");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedCandidateId(null);
    setFormPhoto(null);
    setFormSig(null);
    setFormData({
      studentName: "",
      fatherName: "",
      motherName: "",
      parentOccupation: "",
      mobileNumber: "",
      aadhaarNumber: "",
      caste: "",
      communityCategory: "OC",
      religion: "Hindu",
      nationality: "Indian",
      dob: "",
      identificationMarks: "",
      gender: "Male",
      admissionNumber: "",
      sscRollNumber: "",
      previousSchoolDetails: "",
      address: ""
    });
    setShowModal(true);
  };

  const openEditModal = (candidate: Candidate) => {
    setEditMode(true);
    setSelectedCandidateId(candidate.id);
    setFormPhoto(candidate.photo);
    setFormSig(candidate.signature);
    setFormData({
      studentName: candidate.studentName,
      fatherName: candidate.fatherName,
      motherName: candidate.motherName,
      parentOccupation: candidate.parentOccupation || "",
      mobileNumber: candidate.mobileNumber,
      aadhaarNumber: candidate.aadhaarNumber,
      caste: candidate.caste,
      communityCategory: candidate.communityCategory,
      religion: candidate.religion,
      nationality: candidate.nationality,
      dob: candidate.dob,
      identificationMarks: candidate.identificationMarks,
      gender: candidate.gender,
      admissionNumber: candidate.admissionNumber,
      sscRollNumber: candidate.sscRollNumber || "",
      previousSchoolDetails: candidate.previousSchoolDetails || "",
      address: candidate.address
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      ...formData,
      photo: formPhoto,
      signature: formSig,
      id: selectedCandidateId
    };

    try {
      const response = await fetch("/api/nominal-roll", {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Operation failed");

      setSuccess(editMode ? "Nominal roll entry updated!" : "Nominal roll entry created!");
      setShowModal(false);
      fetchCandidates();
    } catch (err: any) {
      setError(err.message || "Failed to submit candidate details");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this candidate from the Nominal Roll?")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/nominal-roll?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess("Nominal roll record deleted.");
      fetchCandidates();
    } catch (err: any) {
      setError(err.message || "Failed to delete candidate record");
    }
  };

  const handleExcelExport = () => {
    const dataToExport = filteredCandidates.map((c) => ({
      "Admission Number": c.admissionNumber,
      "SSC Roll Number": c.sscRollNumber || "PENDING",
      "Candidate Name": c.studentName,
      "Gender": c.gender,
      "Date of Birth": c.dob,
      "Father Name": c.fatherName,
      "Mother Name": c.motherName,
      "Aadhaar Number": c.aadhaarNumber,
      "Caste": c.caste,
      "Community": c.communityCategory,
      "Religion": c.religion,
      "Instruction Medium": c.medium,
      "Identification Marks": c.identificationMarks,
      "Mobile Number": c.mobileNumber,
      "Address": c.address,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nominal Roll");
    worksheet["!cols"] = Array(15).fill({ wch: 18 });
    XLSX.writeFile(workbook, "ZPHS_SSC_Nominal_Roll_List.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesCategory = categoryFilter === "ALL" ? true : c.communityCategory === categoryFilter;
    const matchesSearch = 
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.sscRollNumber && c.sscRollNumber.includes(searchQuery)) ||
      c.aadhaarNumber.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Page Title Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }} className="no-print">
        <div>
          <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>Class 10 Nominal Roll (SSC)</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Manage secondary school board exam candidate submissions</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={handleAutoGenerate} className="btn btn-secondary" style={{ fontSize: "0.85rem", backgroundColor: "#fffbeb", color: "#b45309", borderColor: "#fde68a" }}>
            <Sparkles size={16} /> Auto-Generate from 10th Class
          </button>
          <button onClick={handleExcelExport} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            <Download size={16} /> Export Excel
          </button>
          <button onClick={handlePrint} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            <Printer size={16} /> Print Nominal Roll
          </button>
          <button onClick={openAddModal} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
            <Plus size={16} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Ticker warnings */}
      {error && (
        <div className="no-print" style={{ padding: "0.75rem 1rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="no-print" style={{ padding: "0.75rem 1rem", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#15803d", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="card no-print" style={{ padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name, admission no, SSC roll no, or Aadhaar..."
              style={{ paddingLeft: "2.5rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          </div>
          <select 
            className="form-control" 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="OC">OC</option>
            <option value="BC">BC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>
      </div>

      {/* Live Table database (Hides during print, print has custom format!) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }} className="no-print">Loading Nominal Roll...</div>
      ) : (
        <div className="table-container no-print">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Admission No</th>
                <th>SSC Roll No</th>
                <th>Candidate Name</th>
                <th>DOB</th>
                <th>Father Name</th>
                <th>Mother Name</th>
                <th>Category</th>
                <th>Medium</th>
                <th>Aadhaar Number</th>
                <th>Identification Marks (Moles)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ width: "36px", height: "48px", overflow: "hidden", backgroundColor: "#e2e8f0", border: "1px solid #cbd5e1" }}>
                        <img 
                          src={c.photo || "/images/placeholders/student_male.svg"} 
                          alt="" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      </div>
                    </td>
                    <td>{c.admissionNumber}</td>
                    <td style={{ fontWeight: "bold", color: "#1e3a8a" }}>{c.sscRollNumber || "PENDING"}</td>
                    <td style={{ fontWeight: "bold", color: "#0f172a" }}>{c.studentName}</td>
                    <td>{c.dob}</td>
                    <td>{c.fatherName}</td>
                    <td>{c.motherName}</td>
                    <td><span className="badge badge-primary">{c.communityCategory}</span></td>
                    <td><span className="badge badge-success">{c.medium}</span></td>
                    <td style={{ fontFamily: "monospace" }}>{c.aadhaarNumber}</td>
                    <td style={{ fontSize: "0.8rem", maxWidth: "200px" }}>{c.identificationMarks}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => openEditModal(c)}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#1e3a8a", padding: "4px" }}
                          title="Edit Details"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
                    No candidates found in Nominal Roll. Add manually or Auto-Generate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PRINT LAYOUT (Visible only when print is triggered - no-print classes handled by CSS) */}
      <div style={{ display: "none" }} className="print-only">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2>BOARD OF SECONDARY EDUCATION, ANDHRA PRADESH</h2>
          <h3>SSC BOARD EXAMINATION NOMINAL ROLL - ACADEMIC YEAR 2026-2027</h3>
          <h4>Z.P. HIGH SCHOOL, SOMASANIGUNTA, VENKATAGIRI MANDAL (DIET CODE: 28231)</h4>
          <hr style={{ margin: "1rem 0", borderTop: "2px solid black" }} />
        </div>

        {filteredCandidates.map((c, idx) => (
          <div key={c.id} className="nominal-roll-print-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>S.No: {idx + 1}</span>
                <span style={{ marginLeft: "2rem", fontWeight: "bold" }}>Admission No: {c.admissionNumber}</span>
                <span style={{ marginLeft: "2rem", fontWeight: "bold" }}>SSC Roll No: {c.sscRollNumber || "________________"}</span>
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                {/* Photo space */}
                <div style={{ width: "90px", height: "110px", border: "1px solid black", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9f9f9" }}>
                  {c.photo ? (
                    <img src={c.photo} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "8pt", textAlign: "center" }}>Candidate Photo</span>
                  )}
                </div>
                {/* Signature space */}
                <div style={{ width: "130px", height: "45px", border: "1px solid black", alignSelf: "flex-end", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9f9f9" }}>
                  {c.signature ? (
                    <img src={c.signature} alt="Signature" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: "8pt" }}>Signature</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "10pt" }}>
              <div><strong>1. Name of the Candidate:</strong> {c.studentName}</div>
              <div><strong>2. Gender:</strong> {c.gender}</div>
              
              <div><strong>3. Father's Name:</strong> {c.fatherName}</div>
              <div><strong>4. Mother's Name:</strong> {c.motherName}</div>

              <div><strong>5. Date of Birth (DD-MM-YYYY):</strong> {c.dob}</div>
              <div><strong>6. Aadhaar Number:</strong> {c.aadhaarNumber}</div>

              <div><strong>7. Community / Caste:</strong> {c.communityCategory} ({c.caste})</div>
              <div><strong>8. Religion &amp; Nationality:</strong> {c.religion} / {c.nationality}</div>

              <div><strong>9. Medium of Instruction:</strong> {c.medium} (ENGLISH ONLY)</div>
              <div><strong>10. Mobile Number:</strong> {c.mobileNumber}</div>

              <div style={{ gridColumn: "span 2" }}><strong>11. Visible Identification Marks:</strong></div>
              <div style={{ gridColumn: "span 2", paddingLeft: "1.5rem" }}>
                {c.identificationMarks || "1. _________________________________________________ 2. _________________________________________________"}
              </div>

              <div style={{ gridColumn: "span 2" }}><strong>12. Previous School Details:</strong> {c.previousSchoolDetails || "N/A"}</div>
              <div style={{ gridColumn: "span 2" }}><strong>13. Permanent Address:</strong> {c.address}</div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", fontSize: "10pt" }}>
              <div style={{ textAlign: "center", width: "200px", borderTop: "1px dashed black", paddingTop: "0.25rem" }}>
                Candidate's Left Thumb Impression
              </div>
              <div style={{ textAlign: "center", width: "200px", borderTop: "1px dashed black", paddingTop: "0.25rem" }}>
                Signature of the Headmaster
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit candidate overlay form */}
      {showModal && (
        <div className="lightbox" onClick={() => setShowModal(false)}>
          <div 
            className="card" 
            style={{ 
              maxWidth: "700px", 
              width: "100%", 
              backgroundColor: "white", 
              padding: "2rem", 
              maxHeight: "90vh", 
              overflowY: "auto" 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a" }}>
                {editMode ? "Edit Candidate Details" : "Register Nominal Roll Candidate"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              
              {/* Photo & Signature uploads */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
                {/* Photo */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "45px", height: "60px", backgroundColor: "#cbd5e1", border: "1px solid #94a3b8", overflow: "hidden" }}>
                    <img src={formPhoto || "/images/placeholders/student_male.svg"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <label className="btn btn-secondary" style={{ fontSize: "0.75rem", cursor: "pointer", padding: "0.3rem 0.6rem" }}>
                      {uploadingState.photo ? "Uploading..." : "Upload Photo"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, "photo")} disabled={uploadingState.photo} />
                    </label>
                  </div>
                </div>

                {/* Signature */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "80px", height: "30px", backgroundColor: "#cbd5e1", border: "1px solid #94a3b8", overflow: "hidden" }}>
                    <img src={formSig || "/images/placeholders/signature_sample.svg"} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  <div>
                    <label className="btn btn-secondary" style={{ fontSize: "0.75rem", cursor: "pointer", padding: "0.3rem 0.6rem" }}>
                      {uploadingState.sig ? "Uploading..." : "Upload Signature"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, "sig")} disabled={uploadingState.sig} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Form inputs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                
                <div className="form-group">
                  <label className="form-label">Student Name (SSC format) *</label>
                  <input
                    name="studentName"
                    type="text"
                    className="form-control"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="IN BLOCK LETTERS"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admission Number *</label>
                  <input
                    name="admissionNumber"
                    type="text"
                    className="form-control"
                    value={formData.admissionNumber}
                    onChange={handleInputChange}
                    required
                    disabled={editMode}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SSC Board Roll Number</label>
                  <input
                    name="sscRollNumber"
                    type="text"
                    className="form-control"
                    value={formData.sscRollNumber}
                    onChange={handleInputChange}
                    placeholder="9-digit SSC roll number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    name="dob"
                    type="date"
                    className="form-control"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select name="gender" className="form-control" value={formData.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Aadhaar Number *</label>
                  <input
                    name="aadhaarNumber"
                    type="text"
                    className="form-control"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Father's Name *</label>
                  <input
                    name="fatherName"
                    type="text"
                    className="form-control"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mother's Name *</label>
                  <input
                    name="motherName"
                    type="text"
                    className="form-control"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Parent's Occupation</label>
                  <input
                    name="parentOccupation"
                    type="text"
                    className="form-control"
                    value={formData.parentOccupation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    name="mobileNumber"
                    type="tel"
                    className="form-control"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Caste / Sub-Caste *</label>
                  <input
                    name="caste"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Kapu, Madiga, Yadava..."
                    value={formData.caste}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Community Category *</label>
                  <select name="communityCategory" className="form-control" value={formData.communityCategory} onChange={handleInputChange}>
                    <option value="OC">OC (General)</option>
                    <option value="BC">BC (Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Religion *</label>
                  <input name="religion" type="text" className="form-control" value={formData.religion} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Instruction Medium</label>
                  <input name="medium" type="text" className="form-control" value="English" disabled />
                </div>

              </div>

              <div className="form-group">
                <label className="form-label">Visible Identification Marks (Moles / Scars) *</label>
                <textarea
                  name="identificationMarks"
                  rows={2}
                  className="form-control"
                  placeholder="1. A mole on the...&#10;2. A scar on the..."
                  value={formData.identificationMarks}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Previous School Details</label>
                <input
                  name="previousSchoolDetails"
                  type="text"
                  className="form-control"
                  value={formData.previousSchoolDetails}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address *</label>
                <textarea
                  name="address"
                  rows={2}
                  className="form-control"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "2rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editMode ? "Save Details" : "Register Candidate"}</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Embedded print css overrides specifically for window.print */}
      <style jsx global>{`
        @media print {
          body, html {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

    </div>
  );
}
