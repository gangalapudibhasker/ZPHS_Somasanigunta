"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  Calendar, 
  Tag, 
  X, 
  Check, 
  AlertCircle,
  Pin
} from "lucide-react";

interface Notice {
  id: number;
  date: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "ANNOUNCEMENT",
    content: "",
    isPinned: false
  });
  
  const [editMode, setEditMode] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notices");
      if (!res.ok) throw new Error("Failed to fetch notices");
      const data = await res.json();
      setNotices(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const openAddMode = () => {
    setEditMode(false);
    setSelectedNoticeId(null);
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "ANNOUNCEMENT",
      content: "",
      isPinned: false
    });
  };

  const openEditMode = (notice: Notice) => {
    setEditMode(true);
    setSelectedNoticeId(notice.id);
    setFormData({
      title: notice.title,
      date: notice.date,
      category: notice.category,
      content: notice.content,
      isPinned: notice.isPinned
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.date || !formData.content) {
      setError("Please fill in Title, Date, and Notice Content.");
      return;
    }

    const payload = {
      ...formData,
      id: selectedNoticeId
    };

    try {
      const res = await fetch("/api/notices", {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save notice");

      setSuccess(editMode ? "Notice board circular updated!" : "Notice successfully posted to school board!");
      openAddMode();
      fetchNotices();
    } catch (err: any) {
      setError(err.message || "Failed to submit notice");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notice circular?")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/notices?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess("Notice deleted from board.");
      fetchNotices();
    } catch (err: any) {
      setError(err.message || "Failed to delete notice");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>School Notice Board Manager</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Publish exam schedules, holiday declarations, circulars, and government orders</p>
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
        
        {/* Add/Edit Form */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#1e3a8a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {editMode ? <Edit size={20} /> : <Plus size={20} />} {editMode ? "Edit Notice Post" : "Publish Circular"}
          </h3>
          
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notice Title *</label>
              <input
                name="title"
                type="text"
                className="form-control"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. SA-2 Timetable Released"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Posting Date *</label>
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
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EXAM_SCHEDULE">Exam Schedule</option>
                  <option value="RESULT">Exam Results</option>
                  <option value="GOV_ORDER">Government Order</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notice Content *</label>
              <textarea
                name="content"
                rows={5}
                className="form-control"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Type circular instructions, descriptions, or exam details..."
                required
              ></textarea>
            </div>

            {/* Pin option */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fffbeb", padding: "0.75rem", borderRadius: "8px", border: "1px solid #fde68a" }}>
              <input 
                id="isPinned"
                name="isPinned"
                type="checkbox" 
                checked={formData.isPinned} 
                onChange={handleCheckboxChange} 
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="isPinned" style={{ fontSize: "0.85rem", color: "#b45309", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                <Pin size={14} /> Pin to public ticker banner
              </label>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {editMode && (
                <button type="button" className="btn btn-secondary" onClick={openAddMode} style={{ flex: 1 }}>
                  Cancel Edit
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                {editMode ? "Save Changes" : "Post Notice"}
              </button>
            </div>
          </form>
        </div>

        {/* Notices list table */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bell size={20} style={{ color: "#64748b" }} /> Active Notices Registry
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>Loading notices...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", maxHeight: "550px" }}>
              {notices.length > 0 ? (
                notices.map((n) => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: "1rem", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px", 
                      backgroundColor: n.isPinned ? "#fffbeb" : "#ffffff",
                      borderLeft: n.isPinned ? "4px solid #f59e0b" : "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ color: "#0f172a", fontSize: "1.05rem" }}>{n.title}</h4>
                        <div style={{ display: "flex", gap: "8px", marginTop: "2px", fontSize: "0.75rem", color: "#64748b" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Calendar size={12} /> {n.date}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Tag size={12} /> {n.category.replace("_", " ")}</span>
                          {n.isPinned && <span style={{ color: "#b45309", fontWeight: "bold" }}>📌 PINNED</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button 
                          onClick={() => openEditMode(n)}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#1e3a8a", padding: "4px" }}
                          title="Edit notice"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(n.id)}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                          title="Delete notice"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5", marginTop: "0.5rem" }}>
                      {n.content}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                  No announcements active on the board.
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
