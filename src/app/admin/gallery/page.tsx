"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Camera, 
  UploadCloud, 
  Tag, 
  X, 
  Check, 
  AlertCircle 
} from "lucide-react";

interface GalleryImage {
  id: number;
  category: string;
  filePath: string;
  title: string;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "CAMPUS",
  });
  
  const [filePath, setFilePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to load gallery images");
      const data = await res.json();
      setImages(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
      
      setFilePath(data.url);
      setSuccess("Gallery photo uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !filePath) {
      setError("Please fill in the Title and Upload a photo.");
      return;
    }

    const payload = {
      ...formData,
      filePath
    };

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create gallery log");

      setSuccess("Photo added to the school gallery database.");
      setFormData({
        title: "",
        category: "CAMPUS",
      });
      setFilePath(null);
      fetchImages();
    } catch (err: any) {
      setError(err.message || "Failed to submit photo details");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this photo from the gallery?")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess("Photo removed from the gallery.");
      fetchImages();
    } catch (err: any) {
      setError(err.message || "Failed to delete photo");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>School Photo Gallery Manager</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Upload and manage pictures shown in the public school photo gallery</p>
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
        
        {/* Upload Form */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#1e3a8a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={20} /> Add Photo
          </h3>
          
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Photo Title *</label>
              <input
                name="title"
                type="text"
                className="form-control"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Science Fair working models"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category *</label>
              <select name="category" className="form-control" value={formData.category} onChange={handleInputChange}>
                <option value="CAMPUS">School Campus</option>
                <option value="CLASSROOM">Classrooms</option>
                <option value="SCIENCE_LAB">Science Laboratory</option>
                <option value="MATH_LAB">Mathematics Laboratory</option>
                <option value="LIBRARY">School Library</option>
                <option value="SPORTS">Sports Facilities</option>
                <option value="SASA">SASA Activities</option>
              </select>
            </div>

            {/* Drag drop slot */}
            <div style={{ textAlign: "center", backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
              <div style={{ width: "100%", height: "110px", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white", marginBottom: "0.75rem" }}>
                {filePath ? (
                  <img src={filePath} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>No Image Selected</span>
                )}
              </div>
              <label className="btn btn-secondary" style={{ fontSize: "0.75rem", cursor: "pointer", padding: "4px 8px", width: "100%" }}>
                {uploading ? "Uploading..." : "Choose Image File"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
              Save Photo to Gallery
            </button>
          </form>
        </div>

        {/* Gallery Thumbnails List */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Camera size={20} style={{ color: "#64748b" }} /> Gallery Photo Database
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>Loading photos...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", overflowY: "auto", maxHeight: "550px" }}>
              {images.length > 0 ? (
                images.map((img) => (
                  <div 
                    key={img.id} 
                    style={{ 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px", 
                      overflow: "hidden",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "white"
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: "110px", width: "100%" }}>
                      <img src={img.filePath} alt={img.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    {/* Meta info */}
                    <div style={{ padding: "8px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "0.65rem", fontWeight: "bold", color: "#1e3a8a", textTransform: "uppercase" }}>{img.category}</div>
                        <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#0f172a", marginTop: "2px", textOverflow: "ellipsis", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {img.title}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(img.id)}
                        className="btn btn-secondary" 
                        style={{ padding: "3px 6px", fontSize: "0.7rem", marginTop: "6px", width: "100%", color: "#ef4444", gap: "4px" }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div style={{ gridColumn: "span 3", textAlign: "center", padding: "3rem", color: "#64748b" }}>
                  No photos found in the school gallery.
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
