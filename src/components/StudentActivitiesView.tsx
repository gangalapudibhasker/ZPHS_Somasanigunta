"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Plus,
  MessageCircle,
  Send,
  Smile,
  Trash2,
  Calendar,
  User,
  Sparkles,
  Check,
  AlertCircle,
  X,
  Search,
  Camera,
} from "lucide-react";

interface ActivityComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface StudentActivity {
  id: number;
  title: string;
  studentName: string;
  classLevel: string;
  category: string;
  description: string;
  imageUrl: string;
  date: string;
  reactions: Record<string, number>;
  comments: ActivityComment[];
}

const REACTION_EMOJIS = ["👏", "❤️", "🌟", "🏆", "🎉", "👍"];
const COMMENT_EMOJIS = ["👏", "❤️", "🌟", "🏆", "🎉", "👍", "🔥", "📚", "🎨", "⚽", "😊", "💯"];

export default function StudentActivitiesView({ isAdmin = false }: { isAdmin?: boolean }) {
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload Form / Modal State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    studentName: "",
    classLevel: "Class 10",
    category: "Academic / Smart IFP",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Per-card comment input states
  const [commentAuthor, setCommentAuthor] = useState<Record<number, string>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [openEmojiPickerId, setOpenEmojiPickerId] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<StudentActivity | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student-activities");
      if (!res.ok) throw new Error("Failed to load student activities");
      const data = await res.json();
      setActivities(data);
    } catch (err: any) {
      setError(err.message || "Error loading activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Handle single or multiple image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("file", files[i]);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Image upload failed");
        newUrls.push(data.url);
      }
      setUploadedUrls((prev) => [...prev, ...newUrls]);
      setSuccess(`${newUrls.length} image(s) uploaded and ready to publish!`);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Publish new Student Activity
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title.trim() || uploadedUrls.length === 0) {
      setError("Please enter an Activity Title and upload at least one image.");
      return;
    }

    try {
      const res = await fetch("/api/student-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrls: uploadedUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish activity");

      setActivities(data);
      setSuccess("Student activity image(s) published successfully!");
      setFormData({
        title: "",
        studentName: "",
        classLevel: "Class 10",
        category: "Academic / Smart IFP",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setUploadedUrls([]);
      setShowUploadForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create activity");
    }
  };

  // Handle Emoji Reaction click on an image card
  const handleReaction = async (activityId: number, emoji: string) => {
    // Optimistic update
    setActivities((prev) =>
      prev.map((act) =>
        act.id === activityId
          ? {
              ...act,
              reactions: {
                ...act.reactions,
                [emoji]: (act.reactions[emoji] || 0) + 1,
              },
            }
          : act
      )
    );

    try {
      const res = await fetch("/api/student-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "react", id: activityId, emoji }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActivities((prev) => prev.map((act) => (act.id === activityId ? updated : act)));
      }
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  // Handle adding a comment to an image card
  const handleAddComment = async (e: React.FormEvent, activityId: number) => {
    e.preventDefault();
    const text = (commentText[activityId] || "").trim();
    const author = (commentAuthor[activityId] || "").trim() || (isAdmin ? "Sri Gangalapudi Bhaskar Reddy (HM)" : "Student / Visitor");

    if (!text) return;

    try {
      const res = await fetch("/api/student-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          id: activityId,
          author,
          text,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActivities((prev) => prev.map((act) => (act.id === activityId ? updated : act)));
        setCommentText((prev) => ({ ...prev, [activityId]: "" }));
        setOpenEmojiPickerId(null);
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  // Insert emoji into a card's comment input box
  const insertEmojiIntoComment = (activityId: number, emoji: string) => {
    setCommentText((prev) => ({
      ...prev,
      [activityId]: `${prev[activityId] || ""}${emoji}`,
    }));
  };

  // Delete comment
  const handleDeleteComment = async (activityId: number, commentId: string) => {
    try {
      const res = await fetch("/api/student-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_comment", id: activityId, commentId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActivities((prev) => prev.map((act) => (act.id === activityId ? updated : act)));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Delete entire activity card
  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm("Are you sure you want to delete this student activity image?")) return;
    try {
      const res = await fetch(`/api/student-activities?id=${activityId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setActivities((prev) => prev.filter((a) => a.id !== activityId));
        setSuccess("Activity image removed.");
      }
    } catch (err) {
      console.error("Failed to delete activity:", err);
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesCat = selectedCategory === "ALL" || act.category === selectedCategory;
    const matchesClass = selectedClass === "ALL" || act.classLevel === selectedClass;
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesClass && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 65%, #047857 100%)",
          color: "white",
          padding: "2.25rem",
          borderRadius: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <Sparkles size={20} style={{ color: "#fbbf24" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "#fde68a" }}>
              ZPHS Somasanigunta Interactive Showcase
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", color: "white", fontWeight: "800" }}>Students Activities &amp; Achievements</h1>
          <p style={{ opacity: 0.9, marginTop: "0.35rem", fontSize: "0.95rem", maxWidth: "680px" }}>
            Upload student activity photos, react with emojis 👏 ❤️ 🌟 🏆 🎉, and share encouraging comments for every student creation!
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn btn-accent"
            style={{
              fontSize: "0.95rem",
              padding: "0.75rem 1.4rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <Camera size={18} />
            {showUploadForm ? "Close Upload Form" : "Upload Activity Image"}
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
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

      {/* Upload Activity Image Panel */}
      {showUploadForm && (
        <div className="card" style={{ borderTop: "4px solid #10b981", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.35rem", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Upload size={22} style={{ color: "#10b981" }} /> Upload New Student Activity Image(s)
            </h2>
            <button
              onClick={() => setShowUploadForm(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateActivity}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Activity Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Science Working Model Exhibition"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Name(s)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. S. Rajesh Kumar & Team"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class</label>
                <select
                  className="form-control"
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                >
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="All Classes">All Classes</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Activity Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Academic / Smart IFP">Academic / Smart IFP</option>
                  <option value="Science & Innovation">Science &amp; Innovation</option>
                  <option value="Mathematics Lab">Mathematics Lab</option>
                  <option value="Sports & Games">Sports &amp; Games</option>
                  <option value="Arts & Cultural">Arts &amp; Cultural</option>
                  <option value="SASA / Clean & Green">SASA / Clean &amp; Green</option>
                  <option value="Co-Curricular">Co-Curricular</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Activity Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Activity Description / Notes</label>
              <textarea
                rows={2}
                className="form-control"
                placeholder="Describe what the students created, demonstrated, or achieved..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Image File Dropzone & Preview */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "2px dashed #94a3b8",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center",
                marginBottom: "1.25rem",
              }}
            >
              {uploadedUrls.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  {uploadedUrls.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        width: "140px",
                        height: "105px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "2px solid #10b981",
                      }}
                    >
                      <img src={url} alt="Uploaded preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => setUploadedUrls((prev) => prev.filter((_, i) => i !== idx))}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "rgba(15,23,42,0.8)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label
                className="btn btn-secondary"
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Upload size={16} />
                {uploadingImage ? "Uploading Image(s)..." : "Select Activity Image(s) from Computer"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
                Supports JPG, PNG, WEBP. You can select one or multiple photos at once.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowUploadForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
                <Plus size={16} /> Publish Activity Photo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search activities by title, student name, or description..."
              style={{ paddingLeft: "2.5rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              size={18}
              style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
            />
          </div>

          <select
            className="form-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Academic / Smart IFP">Academic / Smart IFP</option>
            <option value="Science & Innovation">Science &amp; Innovation</option>
            <option value="Mathematics Lab">Mathematics Lab</option>
            <option value="Sports & Games">Sports &amp; Games</option>
            <option value="Arts & Cultural">Arts &amp; Cultural</option>
            <option value="SASA / Clean & Green">SASA / Clean &amp; Green</option>
            <option value="Co-Curricular">Co-Curricular</option>
          </select>

          <select className="form-control" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="ALL">All Classes</option>
            <option value="Class 6">Class 6</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="All Classes">All Classes</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>Loading student activities...</div>
      ) : filteredActivities.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          No student activities match your filter. Click <strong>Upload Activity Image</strong> above to add one!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: "2rem" }}>
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Image Section */}
              <div style={{ position: "relative", height: "260px", backgroundColor: "#0f172a", overflow: "hidden" }}>
                <img
                  src={act.imageUrl}
                  alt={act.title}
                  onClick={() => setLightboxImage(act)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", transition: "transform 0.3s" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="badge badge-primary" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                    {act.classLevel}
                  </span>
                  <span className="badge badge-success" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}>
                    {act.category}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteActivity(act.id)}
                    title="Delete Activity"
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(15, 23, 42, 0.75)",
                      color: "#f87171",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#64748b", marginBottom: "0.35rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "600", color: "#1e3a8a" }}>
                      <User size={14} /> {act.studentName || "ZPHS Students"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} /> {act.date}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.2rem", color: "#0f172a", fontWeight: "700" }}>{act.title}</h3>
                  {act.description && (
                    <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.55", marginTop: "0.4rem" }}>
                      {act.description}
                    </p>
                  )}
                </div>

                {/* Emoji Reactions Bar */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                    React with Emoji:
                  </span>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {REACTION_EMOJIS.map((emoji) => {
                      const count = act.reactions?.[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(act.id, emoji)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            border: count > 0 ? "1px solid #93c5fd" : "1px solid #cbd5e1",
                            backgroundColor: count > 0 ? "#eff6ff" : "#ffffff",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "700",
                            color: "#1e3a8a",
                            transition: "all 0.15s",
                          }}
                          title={`React with ${emoji}`}
                        >
                          <span>{emoji}</span>
                          <span style={{ fontSize: "0.78rem" }}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comments Section */}
                <div
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>
                    <MessageCircle size={16} style={{ color: "#1e3a8a" }} />
                    <span>Comments ({act.comments?.length || 0})</span>
                  </div>

                  {/* Existing Comments List */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      maxHeight: "190px",
                      overflowY: "auto",
                      paddingRight: "4px",
                    }}
                  >
                    {act.comments && act.comments.length > 0 ? (
                      act.comments.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            backgroundColor: "#f8fafc",
                            padding: "0.6rem 0.85rem",
                            borderRadius: "8px",
                            borderLeft: "3px solid #1e3a8a",
                            fontSize: "0.85rem",
                            position: "relative",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                            <strong style={{ color: "#1e3a8a", fontSize: "0.8rem" }}>{c.author}</strong>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{c.createdAt}</span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(act.id, c.id)}
                                  title="Delete comment"
                                  style={{
                                    border: "none",
                                    background: "none",
                                    color: "#94a3b8",
                                    cursor: "pointer",
                                    padding: 0,
                                  }}
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div style={{ color: "#334155", lineHeight: "1.4" }}>{c.text}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>
                        No comments yet. Be the first to encourage the students!
                      </div>
                    )}
                  </div>

                  {/* Add Comment Form with Emoji Picker */}
                  <form onSubmit={(e) => handleAddComment(e, act.id)} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem" }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your Name"
                        style={{ fontSize: "0.8rem", padding: "0.45rem 0.65rem" }}
                        value={commentAuthor[act.id] || ""}
                        onChange={(e) => setCommentAuthor({ ...commentAuthor, [act.id]: e.target.value })}
                      />
                      <div style={{ display: "flex", gap: "0.4rem", position: "relative" }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Write a comment or add emojis..."
                          style={{ fontSize: "0.8rem", padding: "0.45rem 0.65rem", flex: 1 }}
                          value={commentText[act.id] || ""}
                          onChange={(e) => setCommentText({ ...commentText, [act.id]: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setOpenEmojiPickerId(openEmojiPickerId === act.id ? null : act.id)}
                          className="btn btn-secondary"
                          style={{ padding: "0.4rem 0.6rem" }}
                          title="Insert Emoji"
                        >
                          <Smile size={16} />
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ padding: "0.4rem 0.75rem" }}
                          title="Post Comment"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Emoji Bar for Comment */}
                    {openEmojiPickerId === act.id && (
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                          backgroundColor: "#f1f5f9",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        {COMMENT_EMOJIS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => insertEmojiIntoComment(act.id, em)}
                            style={{
                              border: "none",
                              background: "white",
                              borderRadius: "6px",
                              padding: "2px 6px",
                              cursor: "pointer",
                              fontSize: "1rem",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal when clicking an image */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <div
            className="card"
            style={{ maxWidth: "820px", width: "95%", padding: "1.5rem", backgroundColor: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a" }}>{lightboxImage.title}</h3>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {lightboxImage.studentName} • {lightboxImage.classLevel} ({lightboxImage.date})
                </span>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={22} />
              </button>
            </div>
            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title}
              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px", backgroundColor: "#0f172a" }}
            />
            {lightboxImage.description && (
              <p style={{ marginTop: "1rem", color: "#334155", fontSize: "0.95rem" }}>{lightboxImage.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

