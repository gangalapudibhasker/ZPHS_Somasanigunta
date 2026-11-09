"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderOpen, 
  Search, 
  Trash2, 
  UploadCloud, 
  FileText, 
  Download, 
  Clock, 
  User,
  AlertCircle,
  Check
} from "lucide-react";

interface OfficeFile {
  id: number;
  filename: string;
  originalName: string;
  filePath: string;
  fileType: string;
  category: string;
  uploadDate: string;
  version: number;
  uploadedBy: string | null;
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<OfficeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Upload Form State
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("ADMINISTRATIVE");

  const categories = [
    { value: "ALL", label: "All Documents" },
    { value: "ADMINISTRATIVE", label: "Administrative (Orders/Memos)" },
    { value: "ACADEMIC", label: "Academic (Timetables/Lesson Plans)" },
    { value: "STUDENT", label: "Student Records (Register/TCs)" },
    { value: "GOV_SCHEME", label: "Gov Schemes (JVK/MDM/SASA)" },
  ];

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const url = `/api/files?category=${selectedCategory}&search=${searchQuery}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch documents list");
      const data = await res.json();
      setFiles(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedCategory, searchQuery]);

  // Handle file select and immediate upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileSelected = e.target.files?.[0];
    if (!fileSelected) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const uploadData = new FormData();
    uploadData.append("file", fileSelected);

    try {
      // 1. Upload file binary to server
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || "Binary upload failed");

      // 2. Catalog metadata in Database
      const catalogPayload = {
        originalName: uploadJson.originalName,
        filename: uploadJson.filename,
        filePath: uploadJson.url,
        category: uploadCategory,
      };

      const catalogRes = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catalogPayload),
      });

      const catalogJson = await catalogRes.json();
      if (!catalogRes.ok) throw new Error(catalogJson.error || "Metadata cataloging failed");

      setSuccess(`Successfully uploaded document: "${uploadJson.originalName}" as Version ${catalogJson.version}.`);
      fetchFiles();
    } catch (err: any) {
      setError(err.message || "File upload process failed");
    } finally {
      setUploading(false);
      // Clear input
      e.target.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document from the digital repository? The file reference will be lost.")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/files?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess("Document deleted from repository.");
      fetchFiles();
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>Digital Office Files Cabinet</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Store, organize, search, and download administrative and academic school documents</p>
      </div>

      {/* Messages */}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        
        {/* Upload Panel */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#1e3a8a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UploadCloud size={20} /> Upload New Document
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Document Category *</label>
              <select 
                className="form-control" 
                value={uploadCategory} 
                onChange={(e) => setUploadCategory(e.target.value)}
              >
                <option value="ADMINISTRATIVE">Administrative Files</option>
                <option value="ACADEMIC">Academic Files</option>
                <option value="STUDENT">Student Records</option>
                <option value="GOV_SCHEME">Government Schemes</option>
              </select>
            </div>

            {/* Custom drag/drop look file uploader */}
            <div className="file-upload-zone">
              <FileText size={40} style={{ color: "#94a3b8", margin: "0 auto 1rem auto" }} />
              
              <label style={{ cursor: "pointer", display: "block" }}>
                <span className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", margin: "auto" }}>
                  {uploading ? "Uploading Document..." : "Select File"}
                </span>
                <input 
                  type="file" 
                  accept=".pdf, .doc, .docx, .xls, .xlsx" 
                  style={{ display: "none" }} 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                />
              </label>
              
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.75rem" }}>
                Supports PDF, Word (.doc, .docx), and Excel (.xls, .xlsx) files
              </div>
            </div>
          </div>
        </div>

        {/* Catalog List */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FolderOpen size={20} style={{ color: "#64748b" }} /> File Directory Cabinet
          </h3>

          {/* Filtering tabs */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px", overflowX: "auto", marginBottom: "1.25rem" }}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: selectedCategory === cat.value ? "#1e3a8a" : "transparent",
                  color: selectedCategory === cat.value ? "white" : "#475569",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
                }}
              >
                {cat.value === "ALL" ? "All" : cat.value.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Local Search Input */}
          <div style={{ position: "relative", marginBottom: "1.25rem" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search documents by original filename..."
              style={{ paddingLeft: "2.5rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          </div>

          {/* Files grid list */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Loading file directory...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto", maxHeight: "400px" }}>
              {files.length > 0 ? (
                files.map((f) => (
                  <div 
                    key={f.id} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      padding: "1rem", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      fontSize: "0.875rem"
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", overflow: "hidden" }}>
                      <div style={{ 
                        backgroundColor: f.fileType === "PDF" ? "#fee2e2" : f.fileType === "EXCEL" ? "#dcfce7" : "#eff6ff",
                        color: f.fileType === "PDF" ? "#ef4444" : f.fileType === "EXCEL" ? "#10b981" : "#3b82f6",
                        padding: "0.5rem", 
                        borderRadius: "8px", 
                        display: "flex" 
                      }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontWeight: "700", color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {f.originalName}
                        </div>
                        <div style={{ display: "flex", gap: "10px", fontSize: "0.75rem", color: "#64748b", marginTop: "2px", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Clock size={11} /> {new Date(f.uploadDate).toLocaleDateString("en-IN")}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><User size={11} /> {f.uploadedBy}</span>
                          <span className="badge badge-success" style={{ padding: "1px 6px" }}>Version {f.version}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      {/* Download */}
                      <a 
                        href={f.filePath} 
                        download={f.originalName} 
                        className="btn btn-secondary" 
                        style={{ padding: "0.4rem", borderRadius: "6px" }}
                        title="Download Document"
                      >
                        <Download size={14} />
                      </a>
                      
                      {/* Delete */}
                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="btn btn-secondary" 
                        style={{ padding: "0.4rem", borderRadius: "6px", color: "#ef4444" }}
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
                  No documents found matching the filters.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
