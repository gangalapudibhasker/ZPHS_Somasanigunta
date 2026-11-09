"use client";

import React, { useState } from "react";
import {
  Building,
  Monitor,
  FlaskConical,
  Shield,
  BookOpen,
  Trophy,
  Droplets,
  PlusCircle,
  Camera,
  Calendar,
  User,
  Clock,
  Sparkles,
  X,
  CheckCircle2,
} from "lucide-react";

interface FacilityNote {
  id: number;
  facilityId: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  date: string;
}

interface ClassroomActivity {
  id: number;
  facilityId: string;
  title: string;
  description: string;
  classLevel: number;
  teacherName: string;
  photoUrl: string;
  date: string;
}

interface FacilitiesManagerProps {
  initialNotes: FacilityNote[];
  initialActivities: ClassroomActivity[];
  userRole?: string;
  userName?: string;
}

export default function FacilitiesManager({
  initialNotes,
  initialActivities,
  userRole = "TEACHER",
  userName = "Faculty Member",
}: FacilitiesManagerProps) {
  const [selectedFacility, setSelectedFacility] = useState<string>("ifp");
  const [notes, setNotes] = useState<FacilityNote[]>(initialNotes);
  const [activities, setActivities] = useState<ClassroomActivity[]>(initialActivities);

  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Forms
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    classLevel: 10,
    photoUrl: "/images/ifp-friendly.png",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const facilities = [
    {
      id: "ifp",
      name: "Interactive Flat Panels (IFP)",
      subtitle: "5 High-Definition Touch Smart Classrooms",
      icon: <Monitor size={24} style={{ color: "#a21caf" }} />,
      bgColor: "#fae8ff",
      bannerImg: "/images/ifp-friendly.png",
      description: "Touch-interactive smart panels deployed in Class 6 through 10 loaded with AP SCERT animated 3D modules.",
    },
    {
      id: "scilab",
      name: "Science Laboratory",
      subtitle: "Physics, Chemistry & Biology Practical Lab",
      icon: <FlaskConical size={24} style={{ color: "#15803d" }} />,
      bgColor: "#dcfce7",
      bannerImg: "/images/science-friendly.jpg",
      description: "Equipped with microscopes, anatomical charts, chemical reagents, and practical apparatus for weekly student experiments.",
    },
    {
      id: "mathlab",
      name: "Mathematics Laboratory",
      subtitle: "Visual Manipulatives & Geometry Tools",
      icon: <Shield size={24} style={{ color: "#a16207" }} />,
      bgColor: "#fef9c3",
      bannerImg: "/images/math-friendly.jpg",
      description: "Abacus, wooden 3D geometrical models, clinometers, and algebraic puzzle tiles fostering conceptual clarity.",
    },
    {
      id: "library",
      name: "School Library",
      subtitle: "1,250+ Volumes & Reading Corner",
      icon: <BookOpen size={24} style={{ color: "#be123c" }} />,
      bgColor: "#ffe4e6",
      bannerImg: "/images/library-friendly.jpg",
      description: "Curated collection of encyclopedias, English & Telugu literature, competitive magazines, and student reading logs.",
    },
    {
      id: "sports",
      name: "Sports & Physical Education",
      subtitle: "Multi-Sport Ground & Indoor Facilities",
      icon: <Trophy size={24} style={{ color: "#c2410c" }} />,
      bgColor: "#ffedd5",
      bannerImg: "/images/sports-friendly.jpg",
      description: "Fenced Kabaddi court, Kho-Kho field, volleyball nets, chess, and carrom boards for daily physical fitness.",
    },
  ];

  const currentFac = facilities.find((f) => f.id === selectedFacility) || facilities[0];
  const facilityNotes = notes.filter((n) => n.facilityId === selectedFacility);
  const facilityActivities = activities.filter((a) => a.facilityId === selectedFacility);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.content) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: selectedFacility,
          title: noteForm.title,
          content: noteForm.content,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add note");

      setNotes([data.note, ...notes]);
      setNoteForm({ title: "", content: "" });
      setShowNoteModal(false);
      setFeedback("Facility note saved successfully!");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title || !activityForm.description) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/facilities/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: selectedFacility,
          title: activityForm.title,
          description: activityForm.description,
          classLevel: activityForm.classLevel,
          photoUrl: activityForm.photoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload activity");

      setActivities([data.activity, ...activities]);
      setActivityForm({
        title: "",
        description: "",
        classLevel: 10,
        photoUrl: currentFac.bannerImg,
      });
      setShowActivityModal(false);
      setFeedback("Classroom activity photo uploaded and broadcast to parents!");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: "1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.4rem", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building size={26} style={{ color: "#3b82f6" }} />
            School Facilities, Notes &amp; Classroom Activities
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>
            Faculty activity uploads, operational notes, and digital documentation across ZPHS facilities
          </p>
        </div>

        {/* Action Buttons for Teachers / Admins */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowNoteModal(true)}
            className="btn btn-outline"
            style={{ fontSize: "0.85rem" }}
          >
            <PlusCircle size={16} /> Add Facility Note
          </button>
          <button
            onClick={() => {
              setActivityForm((prev) => ({ ...prev, photoUrl: currentFac.bannerImg }));
              setShowActivityModal(true);
            }}
            className="btn btn-accent"
            style={{ fontSize: "0.85rem" }}
          >
            <Camera size={16} /> Upload Classroom Activity Photo
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            backgroundColor: "#dcfce7",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            color: "#15803d",
            fontSize: "0.9rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={18} /> {feedback}
        </div>
      )}

      {/* Facility Selection Tabs */}
      <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
        {facilities.map((fac) => {
          const isSelected = selectedFacility === fac.id;
          return (
            <button
              key={fac.id}
              onClick={() => setSelectedFacility(fac.id)}
              style={{
                flex: "1 1 200px",
                minWidth: "180px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                borderRadius: "12px",
                border: isSelected ? "2px solid #1e3a8a" : "1px solid #e2e8f0",
                backgroundColor: isSelected ? "#ffffff" : "#f8fafc",
                boxShadow: isSelected ? "var(--shadow-md)" : "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  padding: "0.5rem",
                  borderRadius: "50%",
                  backgroundColor: fac.bgColor,
                  display: "flex",
                }}
              >
                {fac.icon}
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.9rem", color: isSelected ? "#1e3a8a" : "#0f172a" }}>
                  {fac.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {activities.filter((a) => a.facilityId === fac.id).length} Activities
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Facility Hero Card */}
      <div
        className="card"
        style={{
          padding: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2rem",
          flexWrap: "wrap",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ flex: "1 1 340px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "50%", backgroundColor: currentFac.bgColor }}>
              {currentFac.icon}
            </div>
            <div>
              <h3 style={{ fontSize: "1.45rem", color: "#1e3a8a", fontWeight: "800" }}>{currentFac.name}</h3>
              <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "600" }}>{currentFac.subtitle}</p>
            </div>
          </div>
          <p style={{ fontSize: "0.95rem", color: "#334155", lineHeight: "1.6", marginTop: "1rem" }}>
            {currentFac.description}
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ backgroundColor: "#f8fafc", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
              <strong>Operational Status:</strong> <span style={{ color: "#15803d", fontWeight: "700" }}>Fully Active</span>
            </div>
            <div style={{ backgroundColor: "#f8fafc", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
              <strong>Logged Notes:</strong> <span style={{ fontWeight: "700" }}>{facilityNotes.length}</span>
            </div>
            <div style={{ backgroundColor: "#f8fafc", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
              <strong>Classroom Photos:</strong> <span style={{ fontWeight: "700" }}>{facilityActivities.length}</span>
            </div>
          </div>
        </div>

        <div style={{ flex: "1 1 300px", maxWidth: "420px", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
          <img
            src={currentFac.bannerImg}
            alt={currentFac.name}
            style={{ width: "100%", height: "220px", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Grid: Left Column: Operational Notes | Right Column: Classroom Activity Photos */}
      <div className="grid-cols-2">
        {/* Facility Notes Section */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", color: "#0f172a" }}>Facility Operational Notes</h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Maintenance, protocol updates, and equipment notes</p>
            </div>
            <button
              onClick={() => setShowNoteModal(true)}
              className="btn btn-outline"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
            >
              + Add Note
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
            {facilityNotes.length === 0 ? (
              <p style={{ color: "#64748b", padding: "2rem", textAlign: "center", fontSize: "0.9rem" }}>
                No notes logged for this facility yet. Click "Add Facility Note" to record updates.
              </p>
            ) : (
              facilityNotes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <h4 style={{ fontSize: "0.95rem", color: "#1e3a8a", fontWeight: "700" }}>{note.title}</h4>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{note.date}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#334155", lineHeight: "1.5" }}>{note.content}</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem", fontSize: "0.75rem", color: "#64748b" }}>
                    <span>By: <strong>{note.authorName}</strong> ({note.authorRole})</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Classroom Activity Images Upload Feed */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", color: "#0f172a" }}>Classroom Activity Photos</h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Teacher uploads demonstrating student learning in action</p>
            </div>
            <button
              onClick={() => {
                setActivityForm((prev) => ({ ...prev, photoUrl: currentFac.bannerImg }));
                setShowActivityModal(true);
              }}
              className="btn btn-accent"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
            >
              + Upload Activity
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
            {facilityActivities.length === 0 ? (
              <p style={{ color: "#64748b", padding: "2rem", textAlign: "center", fontSize: "0.9rem" }}>
                No classroom activities recorded in this facility. Click "+ Upload Activity" to share photos with parents.
              </p>
            ) : (
              facilityActivities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "row",
                    gap: "1rem",
                    padding: "0.75rem",
                  }}
                >
                  <img
                    src={act.photoUrl}
                    alt={act.title}
                    style={{
                      width: "120px",
                      height: "95px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                        <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>Class {act.classLevel}</span>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{act.date}</span>
                      </div>
                      <h4 style={{ fontSize: "0.9rem", color: "#0f172a", fontWeight: "700", marginTop: "2px" }}>{act.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: "1.3", marginTop: "2px" }}>{act.description}</p>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600", marginTop: "4px" }}>
                      Teacher: {act.teacherName}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Facility Note Modal */}
      {showNoteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowNoteModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", width: "100%", padding: "2rem", backgroundColor: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "800" }}>
                Add Note to {currentFac.name}
              </h3>
              <button onClick={() => setShowNoteModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddNote} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Note Title</label>
                <input
                  type="text"
                  placeholder="e.g. New reagents received, Panel firmware updated"
                  className="form-control"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Note Details / Instructions</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Enter details for faculty, students, or maintenance staff..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowNoteModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Classroom Activity Modal */}
      {showActivityModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowActivityModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "550px", width: "100%", padding: "2rem", backgroundColor: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "800" }}>
                Upload Classroom Activity ({currentFac.name})
              </h3>
              <button onClick={() => setShowActivityModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddActivity} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Activity Title</label>
                <input
                  type="text"
                  placeholder="e.g. Class 10 Heart Simulation Session, 9th Acid-Base Lab"
                  className="form-control"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Class Level</label>
                  <select
                    className="form-control"
                    value={activityForm.classLevel}
                    onChange={(e) => setActivityForm({ ...activityForm, classLevel: Number(e.target.value) })}
                  >
                    {[6, 7, 8, 9, 10].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Photo Asset</label>
                  <select
                    className="form-control"
                    value={activityForm.photoUrl}
                    onChange={(e) => setActivityForm({ ...activityForm, photoUrl: e.target.value })}
                  >
                    <option value="/images/ifp-friendly.png">IFP Smart Classroom Demo</option>
                    <option value="/images/science-friendly.jpg">Science Chemistry Practical</option>
                    <option value="/images/math-friendly.jpg">Mathematics Geometry Lab</option>
                    <option value="/images/library-friendly.jpg">Library Guided Reading</option>
                    <option value="/images/sports-friendly.jpg">Sports Ground Kabaddi</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Activity Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe student learning outcomes, topics covered, and notable observations..."
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowActivityModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-accent">
                  {submitting ? "Uploading..." : "Publish Activity Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
