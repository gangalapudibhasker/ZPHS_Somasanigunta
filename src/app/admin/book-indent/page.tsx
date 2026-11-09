"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Printer, 
  X, 
  Check, 
  AlertCircle,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface BookIndent {
  id: number;
  academicYear: string;
  classLevel: number;
  subject: string;
  requiredQty: number;
  availableQty: number;
  indentedQty: number;
  receivedQty: number;
  balanceQty: number;
}

export default function AdminBookIndentPage() {
  const [indents, setIndents] = useState<BookIndent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIndentId, setSelectedIndentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    academicYear: "2026-2027",
    classLevel: 6,
    subject: "",
    requiredQty: "",
    availableQty: "0",
    receivedQty: "0"
  });

  // Bulk Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    academicYear: "2026-2027",
    classSelection: "ALL",
    requiredQty: "50"
  });

  const openBulkModal = () => {
    setBulkData({
      academicYear: "2026-2027",
      classSelection: "ALL",
      requiredQty: "50"
    });
    setShowBulkModal(true);
  };

  const handleBulkInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBulkData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const reqQty = parseInt(bulkData.requiredQty || "50");
    const ay = bulkData.academicYear;

    // Define standard textbook lists
    const stdBooks: Record<number, string[]> = {
      6: ["English Reader", "Telugu Reader", "Mathematics", "General Science", "Social Studies"],
      7: ["English Reader", "Telugu Reader", "Mathematics", "General Science", "Social Studies"],
      8: ["English Reader", "Telugu Reader", "Mathematics", "Physical Science", "Biological Science", "Social Studies"],
      9: ["English Reader", "Telugu Reader", "Mathematics", "Physical Science", "Biological Science", "Social Studies"],
      10: ["English Reader", "Telugu Reader", "Mathematics", "Physical Science", "Biological Science", "Social Studies"]
    };

    let payload: any[] = [];
    if (bulkData.classSelection === "ALL") {
      [6, 7, 8, 9, 10].forEach((c) => {
        stdBooks[c].forEach((sub) => {
          payload.push({
            academicYear: ay,
            classLevel: c,
            subject: sub,
            requiredQty: reqQty,
            availableQty: 0,
            receivedQty: 0
          });
        });
      });
    } else {
      const c = parseInt(bulkData.classSelection);
      stdBooks[c].forEach((sub) => {
        payload.push({
          academicYear: ay,
          classLevel: c,
          subject: sub,
          requiredQty: reqQty,
          availableQty: 0,
          receivedQty: 0
        });
      });
    }

    try {
      const res = await fetch("/api/book-indent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Bulk generation failed");

      setSuccess(`Successfully generated/updated ${payload.length} textbook indents!`);
      setShowBulkModal(false);
      fetchIndents();
    } catch (err: any) {
      setError(err.message || "Failed to batch create indents");
    }
  };

  const fetchIndents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/book-indent");
      if (!res.ok) throw new Error("Failed to load indents data");
      const data = await res.json();
      setIndents(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedIndentId(null);
    setFormData({
      academicYear: "2026-2027",
      classLevel: 6,
      subject: "",
      requiredQty: "",
      availableQty: "0",
      receivedQty: "0"
    });
    setShowModal(true);
  };

  const openEditModal = (indent: BookIndent) => {
    setEditMode(true);
    setSelectedIndentId(indent.id);
    setFormData({
      academicYear: indent.academicYear,
      classLevel: indent.classLevel,
      subject: indent.subject,
      requiredQty: String(indent.requiredQty),
      availableQty: String(indent.availableQty),
      receivedQty: String(indent.receivedQty)
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.subject || !formData.requiredQty) {
      setError("Please fill in Subject and Required Quantity.");
      return;
    }

    const payload = {
      ...formData,
      id: selectedIndentId
    };

    try {
      const res = await fetch("/api/book-indent", {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Operation failed");

      setSuccess(editMode ? "Indent record saved!" : "Indent record created!");
      setShowModal(false);
      fetchIndents();
    } catch (err: any) {
      setError(err.message || "Failed to save record");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this book indent record?")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/book-indent?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess("Record deleted successfully.");
      fetchIndents();
    } catch (err: any) {
      setError(err.message || "Failed to delete record");
    }
  };

  const handleExcelExport = () => {
    const dataToExport = filteredIndents.map((ind) => ({
      "Academic Year": ind.academicYear,
      "Class Level": `Class ${ind.classLevel}`,
      "Subject Textbook": ind.subject,
      "Required Qty": ind.requiredQty,
      "Available Qty (Stock)": ind.availableQty,
      "Indented Qty": ind.indentedQty,
      "Received Qty": ind.receivedQty,
      "Balance (Shortage)": ind.balanceQty,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Textbooks Indents");
    worksheet["!cols"] = Array(8).fill({ wch: 18 });
    XLSX.writeFile(workbook, `ZPHS_Textbooks_Indent_Class_${selectedClass}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredIndents = indents.filter((ind) => {
    return selectedClass === "ALL" ? true : ind.classLevel === parseInt(selectedClass);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }} className="no-print">
        <div>
          <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>Textbook Indent &amp; Stock Manager</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Track textbook allocations, inventories, and government indents</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleExcelExport} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            <Download size={16} /> Export Excel
          </button>
          <button onClick={handlePrint} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            <Printer size={16} /> Print Report
          </button>
          <button onClick={openBulkModal} className="btn btn-accent" style={{ fontSize: "0.85rem" }}>
            <Plus size={16} /> Auto-Add All Books
          </button>
          <button onClick={openAddModal} className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
            <Plus size={16} /> Create Indent
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {/* Selector Filters */}
      <div className="card no-print" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontWeight: "600", fontSize: "0.9rem", color: "#0f172a" }}>Filter Class Level:</label>
          <select 
            className="form-control" 
            style={{ width: "240px", margin: 0 }}
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
        </div>
      </div>

      {/* Table grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }} className="no-print">Loading indent sheets...</div>
      ) : (
        <div className="table-container no-print">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Class</th>
                <th>Subject Text</th>
                <th>Required</th>
                <th>Available</th>
                <th>Indented</th>
                <th>Received</th>
                <th>Progress Status</th>
                <th>Balance (Due)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndents.length > 0 ? (
                filteredIndents.map((ind) => {
                  const pct = ind.indentedQty > 0 
                    ? Math.min(100, Math.round((ind.receivedQty / ind.indentedQty) * 100))
                    : 100;
                  return (
                    <tr key={ind.id}>
                      <td>{ind.academicYear}</td>
                      <td><span className="badge badge-primary">Class {ind.classLevel}</span></td>
                      <td style={{ fontWeight: "bold", color: "#0f172a" }}>{ind.subject}</td>
                      <td>{ind.requiredQty}</td>
                      <td>{ind.availableQty}</td>
                      <td style={{ fontWeight: "600" }}>{ind.indentedQty}</td>
                      <td style={{ color: "#15803d", fontWeight: "bold" }}>{ind.receivedQty}</td>
                      <td>
                        {/* Progress Meter */}
                        <div style={{ width: "120px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "2px" }}>
                            <span>Received</span>
                            <strong>{pct}%</strong>
                          </div>
                          <div style={{ width: "100%", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                            <div 
                              style={{ 
                                width: `${pct}%`, 
                                height: "100%", 
                                backgroundColor: pct === 100 ? "#10b981" : "#3b82f6" 
                              }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td style={{ color: ind.balanceQty > 0 ? "#ef4444" : "#10b981", fontWeight: "bold" }}>
                        {ind.balanceQty === 0 ? "Fully Stocked" : `${ind.balanceQty} Pending`}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            onClick={() => openEditModal(ind)}
                            style={{ border: "none", background: "none", cursor: "pointer", color: "#1e3a8a", padding: "4px" }}
                            title="Edit Record"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(ind.id)}
                            style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No textbook indent sheets registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PRINT REPORT (A4 portrait format) */}
      <div style={{ display: "none" }} className="print-only">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2>TEXTBOOK INDENT &amp; STOCK REGISTER REPORT</h2>
          <h3>ZILLA PARISHAD HIGH SCHOOL, SOMASANIGUNTA</h3>
          <h4>Academic Year: 2026-2027 | Filter: Class {selectedClass}</h4>
          <hr style={{ margin: "1rem 0", borderTop: "2px solid black" }} />
        </div>

        <table className="custom-table" style={{ width: "100%", border: "1px solid black" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9" }}>
              <th style={{ border: "1px solid black" }}>AY</th>
              <th style={{ border: "1px solid black" }}>Class</th>
              <th style={{ border: "1px solid black" }}>Subject Textbook</th>
              <th style={{ border: "1px solid black" }}>Required</th>
              <th style={{ border: "1px solid black" }}>Available</th>
              <th style={{ border: "1px solid black" }}>Indented</th>
              <th style={{ border: "1px solid black" }}>Received</th>
              <th style={{ border: "1px solid black" }}>Shortage Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredIndents.map((ind) => (
              <tr key={ind.id}>
                <td style={{ border: "1px solid black" }}>{ind.academicYear}</td>
                <td style={{ border: "1px solid black" }}>Class {ind.classLevel}</td>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}>{ind.subject}</td>
                <td style={{ border: "1px solid black" }}>{ind.requiredQty}</td>
                <td style={{ border: "1px solid black" }}>{ind.availableQty}</td>
                <td style={{ border: "1px solid black" }}>{ind.indentedQty}</td>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}>{ind.receivedQty}</td>
                <td style={{ border: "1px solid black", color: ind.balanceQty > 0 ? "red" : "black", fontWeight: "bold" }}>{ind.balanceQty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4rem" }}>
          <div>Textbook In-charge Signature</div>
          <div>Headmaster Seal &amp; Signature</div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="lightbox" onClick={() => setShowModal(false)}>
          <div 
            className="card" 
            style={{ 
              maxWidth: "500px", 
              width: "100%", 
              backgroundColor: "white", 
              padding: "2rem",
              position: "relative" 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a" }}>
                {editMode ? "Edit Indent Details" : "Register Textbook Indent"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Academic Year *</label>
                <input
                  name="academicYear"
                  type="text"
                  className="form-control"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Class Level *</label>
                <select name="classLevel" className="form-control" value={formData.classLevel} onChange={handleInputChange}>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subject Textbook Name *</label>
                <input
                  name="subject"
                  type="text"
                  className="form-control"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g. Mathematics Reader"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Required *</label>
                  <input
                    name="requiredQty"
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.requiredQty}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Available</label>
                  <input
                    name="availableQty"
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.availableQty}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Received</label>
                  <input
                    name="receivedQty"
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.receivedQty}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editMode ? "Save Changes" : "Create Record"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="lightbox" onClick={() => setShowBulkModal(false)}>
          <div 
            className="card" 
            style={{ 
              maxWidth: "500px", 
              width: "100%", 
              backgroundColor: "white", 
              padding: "2rem",
              position: "relative" 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a" }}>
                Auto-Generate Standard Textbooks
              </h3>
              <button onClick={() => setShowBulkModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Academic Year *</label>
                <input
                  name="academicYear"
                  type="text"
                  className="form-control"
                  value={bulkData.academicYear}
                  onChange={handleBulkInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Class Level Selection *</label>
                <select name="classSelection" className="form-control" value={bulkData.classSelection} onChange={handleBulkInputChange}>
                  <option value="ALL">All Classes (6 to 10)</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Required Quantity (No. of Students) *</label>
                <input
                  name="requiredQty"
                  type="number"
                  min="1"
                  className="form-control"
                  value={bulkData.requiredQty}
                  onChange={handleBulkInputChange}
                  required
                />
                <small style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px" }}>
                  This will generate standard textbooks (Telugu, English, Math, Science, Social) for the selected class(es) with required quantity set to this value. Existing records with matching subject, class, and year will be updated.
                </small>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Indents</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
