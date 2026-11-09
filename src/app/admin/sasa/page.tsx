"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Layers, 
  Calendar, 
  Tag, 
  UploadCloud, 
  X, 
  Check, 
  AlertCircle 
} from "lucide-react";

interface SasaActivity {
  id: number;
  date: string;
  title: string;
  description: string;
  beforePhoto: string | null;
  afterPhoto: string | null;
  category: string;
}

export default function AdminSasaPage() {
  const [activities, setActivities] = useState<SasaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "CLEANLINESS",
    description: ""
  });
  
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState({ before: false, after: false });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sasa");
      if (!res.ok) throw new Error("Failed to load SASA activities");
      const data = await res.json();
      setActivities(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
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
      
      if (type === "before") {
        setBeforePhoto(data.url);
      } else {
        setAfterPhoto(data.url);
      }
      setSuccess(`${type === "before" ? "Before photo" : "After photo"} uploaded successfully!`);
    } catch (err: any) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setUploadingState((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.date || !formData.description) {
      setError("Please fill in Title, Date, and Description.");
      return;
    }

    const payload = {
      ...formData,
      beforePhoto,
      afterPhoto
    };

    try {
      const res = await fetch("/api/sasa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create activity log");

      setSuccess("SASA activity logged successfully.");
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        category: "CLEANLINESS",
        description: ""
      });
      setBeforePhoto(null);
      setAfterPhoto(null);
      fetchActivities();
    } catch (err: any) {
      setError(err.message || "Failed to submit activity");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SASA activity from logs?")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/sasa?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess("SASA activity deleted from logs.");
      fetchActivities();
    } catch (err: any) {
      setError(err.message || "Failed to delete activity log");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>SASA Activity Log Manager</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Log cleanliness, beautification, and plantation drives with Before/After photos</p>
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
        
        {/* Add Form */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#1e3a8a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={20} /> Log SASA Activity
          </h3>
          
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Activity Title *</label>
              <input
                name="title"
                type="text"
                className="form-control"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Playground Cleaning"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date *</label>
                <input
                  name="date"
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category *</label>
                <select name="category" className="form-control" value={formData.category} onChange={handleInputChange}>
                  <option value="CLEANLINESS">Cleanliness Drive</option>
                  <option value="PLANTATION">Plantation (Trees)</option>
                  <option value="BEAUTIFICATION">School Beautification</option>
                  <option value="COMMUNITY_PARTICIPATION">Community Support</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                rows={3}
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the activity achievements, details, and headcount..."
                required
              ></textarea>
            </div>

            {/* Before and After Image upload slots */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
              {/* Before Slot */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px", color: "#b91c1c" }}>Before State Photo</div>
                <div style={{ width: "100%", height: "80px", border: "1px dashed #cbd5e1", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", backgroundColor: "white" }}>
                  {beforePhoto ? (
                    <img src={beforePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Empty</span>
                  )}
                </div>
                <label className="btn btn-secondary" style={{ fontSize: "0.7rem", cursor: "pointer", padding: "3px 6px", marginTop: "4px", width: "100%" }}>
                  {uploadingState.before ? "Uploading..." : "Upload Before"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhotoUpload(e, "before")} />
                </label>
              </div>

              {/* After Slot */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px", color: "#166534" }}>After State Photo</div>
                <div style={{ width: "100%", height: "80px", border: "1px dashed #cbd5e1", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", backgroundColor: "white" }}>
                  {afterPhoto ? (
                    <img src={afterPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Empty</span>
                  )}
                </div>
                <label className="btn btn-secondary" style={{ fontSize: "0.7rem", cursor: "pointer", padding: "3px 6px", marginTop: "4px", width: "100%" }}>
                  {uploadingState.after ? "Uploading..." : "Upload After"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhotoUpload(e, "after")} />
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
              Submit Activity Log
            </button>
          </form>
        </div>

        {/* List Logs */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={20} style={{ color: "#64748b" }} /> Logged SASA Activity List
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>Loading SASA activities...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", maxHeight: "550px" }}>
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div 
                    key={act.id} 
                    style={{ 
                      padding: "1rem", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px", 
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ color: "#0f172a", fontSize: "1rem" }}>{act.title}</h4>
                        <div style={{ display: "flex", gap: "8px", marginTop: "2px", fontSize: "0.75rem", color: "#64748b" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Calendar size={12} /> {act.date}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Tag size={12} /> {act.category.replace("_", " ")}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(act.id)}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                        title="Delete log entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
                      {act.description}
                    </p>

                    {/* Image thumbnails preview */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "4px", overflow: "hidden", height: "60px" }}>
                        <img src={act.beforePhoto || "/images/placeholders/sasa_clean_before.svg"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "4px", overflow: "hidden", height: "60px" }}>
                        <img src={act.afterPhoto || "/images/placeholders/sasa_clean_after.svg"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                  No activities registered in the database.
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
