"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Printer, Upload, Trash2, Edit2, X, Image as ImageIcon } from "lucide-react";

interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  chiefGuest: string;
  venue: string;
  status: string;
  participants?: string;
  coordinator?: string;
  description: string;
}

interface Donor {
  id: string;
  date: string;
  donationDetails?: string;
  donationAmount?: number | string;
  inWhoseName?: string;
  spentFor?: string;
  imageUrl?: string;
  imageUrls?: string[];
  // Legacy fallback fields
  name?: string;
  donorName?: string;
  contribution?: string;
  itemOrDetails?: string;
  estimatedValue?: number;
  amountValue?: number;
}

export default function EventsAndDonorsView({
  isAdmin = false,
  initialTab = "EVENTS",
}: {
  isAdmin?: boolean;
  initialTab?: "EVENTS" | "DONORS";
}) {
  const [activeTab] = useState<"EVENTS" | "DONORS">(initialTab);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [editingDonorId, setEditingDonorId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState<SchoolEvent>({
    id: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "Academic / Cultural",
    chiefGuest: "Sri Gangalapudi Bhaskar Reddy (HM)",
    venue: "ZPHS Somasanigunta Main Grounds",
    status: "UPCOMING",
    participants: "All Students (Classes 6 to 10)",
    description: "",
  });

  const [donorForm, setDonorForm] = useState<{
    date: string;
    donationDetails: string;
    donationAmount: string;
    inWhoseName: string;
    spentFor: string;
    imageUrls: string[];
  }>({
    date: new Date().toISOString().split("T")[0],
    donationDetails: "",
    donationAmount: "",
    inWhoseName: "",
    spentFor: "",
    imageUrls: [],
  });

  useEffect(() => {
    fetch("/api/school-hub")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.events)) setEvents(data.events);
        if (Array.isArray(data.donors)) setDonors(data.donors);
      })
      .catch(() => {});
  }, []);

  const saveDonorsList = async (updated: Donor[]) => {
    setDonors(updated);
    await fetch("/api/school-hub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "donors", value: updated }),
    });
  };

  const saveEventsList = async (updated: SchoolEvent[]) => {
    setEvents(updated);
    await fetch("/api/school-hub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "events", value: updated }),
    });
  };

  // Field normalizers for seeded/existing records
  const getDetails = (d: Donor) => d.donationDetails || d.donorName || d.name || "Donor";
  const getAmount = (d: Donor) => Number(d.donationAmount ?? d.amountValue ?? d.estimatedValue ?? 0) || 0;
  const getInWhoseName = (d: Donor) => d.inWhoseName || d.donorName || d.name || "-";
  const getSpentFor = (d: Donor) => d.spentFor || d.itemOrDetails || d.contribution || "-";
  const getDonorImages = (d: Donor): string[] => {
    if (Array.isArray(d.imageUrls) && d.imageUrls.length > 0) {
      return d.imageUrls.filter(Boolean).slice(0, 3);
    }
    if (d.imageUrl) {
      return [d.imageUrl];
    }
    return [];
  };

  const handleOpenAddDonor = () => {
    setEditingDonorId(null);
    setDonorForm({
      date: new Date().toISOString().split("T")[0],
      donationDetails: "",
      donationAmount: "",
      inWhoseName: "",
      spentFor: "",
      imageUrls: [],
    });
    setShowDonorModal(true);
  };

  const handleOpenEditDonor = (d: Donor) => {
    setEditingDonorId(d.id);
    setDonorForm({
      date: d.date || new Date().toISOString().split("T")[0],
      donationDetails: getDetails(d),
      donationAmount: String(getAmount(d)),
      inWhoseName: getInWhoseName(d),
      spentFor: getSpentFor(d),
      imageUrls: getDonorImages(d),
    });
    setShowDonorModal(true);
  };

  const handleImageFileUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) return data.url;
      return "";
    } catch {
      return "";
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    const imgs = donorForm.imageUrls.slice(0, 3);
    if (editingDonorId) {
      const updated = donors.map((d) =>
        d.id === editingDonorId
          ? {
              id: d.id,
              date: donorForm.date,
              donationDetails: donorForm.donationDetails,
              donationAmount: Number(donorForm.donationAmount) || 0,
              inWhoseName: donorForm.inWhoseName,
              spentFor: donorForm.spentFor,
              imageUrls: imgs,
              imageUrl: imgs[0] || "",
            }
          : d
      );
      await saveDonorsList(updated);
    } else {
      const item: Donor = {
        id: `dnr-${Date.now()}`,
        date: donorForm.date,
        donationDetails: donorForm.donationDetails,
        donationAmount: Number(donorForm.donationAmount) || 0,
        inWhoseName: donorForm.inWhoseName,
        spentFor: donorForm.spentFor,
        imageUrls: imgs,
        imageUrl: imgs[0] || "",
      };
      const updated = [item, ...donors];
      await saveDonorsList(updated);
    }
    setShowDonorModal(false);
    setEditingDonorId(null);
  };

  // Upload 1 to 3 images directly for a row
  const handleRowImagesUpload = async (donorId: string, fileList: FileList) => {
    const target = donors.find((d) => d.id === donorId);
    if (!target) return;
    const existing = getDonorImages(target);
    const remainingSlots = 3 - existing.length;
    if (remainingSlots <= 0) {
      alert("Maximum 3 images allowed per donor. Remove an image first to upload another.");
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, remainingSlots);
    const newUrls: string[] = [];
    for (const file of filesToUpload) {
      const url = await handleImageFileUpload(file);
      if (url) newUrls.push(url);
    }
    if (newUrls.length === 0) return;

    const combined = [...existing, ...newUrls].slice(0, 3);
    const updated = donors.map((d) =>
      d.id === donorId ? { ...d, imageUrls: combined, imageUrl: combined[0] || "" } : d
    );
    await saveDonorsList(updated);
  };

  // Remove a single image from a row in Admin mode
  const handleRemoveRowImage = async (donorId: string, imgIndex: number) => {
    const updated = donors.map((d) => {
      if (d.id !== donorId) return d;
      const imgs = getDonorImages(d).filter((_, idx) => idx !== imgIndex);
      return { ...d, imageUrls: imgs, imageUrl: imgs[0] || "" };
    });
    await saveDonorsList(updated);
  };

  const handleDeleteDonor = async (donorId: string) => {
    if (!confirm("Delete this donor entry?")) return;
    const updated = donors.filter((d) => d.id !== donorId);
    await saveDonorsList(updated);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventId) {
      const updated = events.map((ev) => (ev.id === editingEventId ? { ...newEvent, id: editingEventId } : ev));
      await saveEventsList(updated);
    } else {
      const updated = [{ ...newEvent, id: `evt-${Date.now()}` }, ...events];
      await saveEventsList(updated);
    }
    setShowAddEvent(false);
    setEditingEventId(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    await saveEventsList(events.filter((ev) => ev.id !== eventId));
  };

  const cellStyle: React.CSSProperties = {
    border: "1.5px solid #1e293b",
    padding: "12px 14px",
    verticalAlign: "top",
    fontSize: "0.92rem",
    color: "#0f172a",
  };

  const headerCellStyle: React.CSSProperties = {
    border: "1.5px solid #1e293b",
    padding: "12px 14px",
    backgroundColor: "#f1f5f9",
    fontWeight: 800,
    fontSize: "0.92rem",
    color: "#0f172a",
    textAlign: "left",
  };

  // ============================================================================
  // SIMPLE DONORS VIEW (Up to 3 Related Images)
  // ============================================================================
  if (activeTab === "DONORS") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Top Action Bar */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenAddDonor}
                className="btn btn-primary"
                style={{
                  border: "2px solid #0f172a",
                  fontWeight: 800,
                  padding: "0.55rem 1.1rem",
                }}
              >
                <Plus size={16} /> Add Donor
              </button>
            )}
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              School Donors
            </h1>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary"
            style={{ fontWeight: 700 }}
          >
            <Printer size={16} /> Print
          </button>
        </div>

        {/* Simple 6-Column Bordered Table */}
        <div style={{ backgroundColor: "#ffffff", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #0f172a" }}>
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, width: "120px" }}>Date</th>
                <th style={headerCellStyle}>Donation Details</th>
                <th style={{ ...headerCellStyle, width: "150px" }}>Donation Amount</th>
                <th style={headerCellStyle}>In Whose Name</th>
                <th style={headerCellStyle}>Purpose / Spent For</th>
                <th style={{ ...headerCellStyle, width: "260px", textAlign: "center" }}>Related Image</th>
                {isAdmin && (
                  <th className="no-print" style={{ ...headerCellStyle, width: "135px", textAlign: "center" }}>
                    Admin Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ ...cellStyle, textAlign: "center", padding: "2rem" }}>
                    No donor records available.
                  </td>
                </tr>
              ) : (
                donors.map((d) => {
                  const images = getDonorImages(d);
                  return (
                    <tr key={d.id}>
                      <td style={{ ...cellStyle, whiteSpace: "nowrap", fontWeight: 600 }}>{d.date}</td>
                      <td style={{ ...cellStyle, fontWeight: 700 }}>{getDetails(d)}</td>
                      <td style={{ ...cellStyle, fontWeight: 800, color: "#047857", whiteSpace: "nowrap" }}>
                        Rs. {getAmount(d).toLocaleString("en-IN")}
                      </td>
                      <td style={{ ...cellStyle, fontWeight: 600 }}>{getInWhoseName(d)}</td>
                      <td style={cellStyle}>{getSpentFor(d)}</td>
                      <td style={{ ...cellStyle, textAlign: "center" }}>
                        {images.length > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              justifyContent: "center",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            {images.map((imgUrl, idx) => (
                              <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                                <img
                                  src={imgUrl}
                                  alt={`Donation ${idx + 1}`}
                                  onClick={() => setPreviewImage(imgUrl)}
                                  style={{
                                    width: "74px",
                                    height: "60px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                    border: "1px solid #94a3b8",
                                    cursor: "pointer",
                                  }}
                                  title="Click to enlarge"
                                />
                                {isAdmin && (
                                  <button
                                    type="button"
                                    className="no-print"
                                    onClick={() => handleRemoveRowImage(d.id, idx)}
                                    title="Remove this image"
                                    style={{
                                      position: "absolute",
                                      top: "-5px",
                                      right: "-5px",
                                      width: "18px",
                                      height: "18px",
                                      borderRadius: "50%",
                                      backgroundColor: "#dc2626",
                                      color: "#ffffff",
                                      border: "none",
                                      fontSize: "10px",
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      lineHeight: 1,
                                    }}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>—</span>
                        )}
                      </td>

                      {/* Edit, Upload (Up to 3 Images) & Delete Options ONLY in Admin Login */}
                      {isAdmin && (
                        <td className="no-print" style={{ ...cellStyle, textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "5px" }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditDonor(d)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "#0f766e",
                                backgroundColor: "#f0fdfa",
                                border: "1px solid #99f6e4",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <Edit2 size={12} /> Edit
                            </button>

                            {images.length < 3 && (
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "4px",
                                  padding: "4px 8px",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  color: "#1e3a8a",
                                  backgroundColor: "#eff6ff",
                                  border: "1px solid #bfdbfe",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                                title="Upload up to 3 images"
                              >
                                <Upload size={12} />
                                + Img ({images.length}/3)
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      handleRowImagesUpload(d.id, e.target.files);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                              </label>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteDonor(d.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "#dc2626",
                                backgroundColor: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Admin Modal: Add / Edit Donor (Up to 3 Images) */}
        {isAdmin && showDonorModal && (
          <div className="lightbox no-print" onClick={() => setShowDonorModal(false)}>
            <div
              className="card"
              style={{ maxWidth: "540px", width: "95%", backgroundColor: "white", padding: "1.75rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {editingDonorId ? "Edit Donor Details" : "+ Add Donor"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDonorModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveDonor} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <div>
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={donorForm.date}
                      onChange={(e) => setDonorForm({ ...donorForm, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Donation Amount (Rs.) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 25000"
                      className="form-control"
                      value={donorForm.donationAmount}
                      onChange={(e) => setDonorForm({ ...donorForm, donationAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Donation Details *</label>
                  <input
                    required
                    placeholder="Donor Name, Village, Phone or Item Details"
                    className="form-control"
                    value={donorForm.donationDetails}
                    onChange={(e) => setDonorForm({ ...donorForm, donationDetails: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">In Whose Name *</label>
                  <input
                    required
                    placeholder="In whose name or memory..."
                    className="form-control"
                    value={donorForm.inWhoseName}
                    onChange={(e) => setDonorForm({ ...donorForm, inWhoseName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Purpose / Spent For *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="What purpose the donation was used for..."
                    className="form-control"
                    value={donorForm.spentFor}
                    onChange={(e) => setDonorForm({ ...donorForm, spentFor: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Related Images (Up to 3 Images — {donorForm.imageUrls.length}/3 uploaded)
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    {donorForm.imageUrls.map((url, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          style={{
                            width: "64px",
                            height: "54px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDonorForm((prev) => ({
                              ...prev,
                              imageUrls: prev.imageUrls.filter((_, i) => i !== idx),
                            }))
                          }
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                            fontSize: "10px",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {donorForm.imageUrls.length < 3 && (
                      <label
                        className="btn btn-secondary"
                        style={{
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <ImageIcon size={15} />
                        {uploadingImage
                          ? "Uploading..."
                          : `+ Add Image (${donorForm.imageUrls.length}/3)`}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            const slotsLeft = 3 - donorForm.imageUrls.length;
                            const selected = Array.from(files).slice(0, slotsLeft);
                            const uploaded: string[] = [];
                            for (const f of selected) {
                              const u = await handleImageFileUpload(f);
                              if (u) uploaded.push(u);
                            }
                            if (uploaded.length > 0) {
                              setDonorForm((prev) => ({
                                ...prev,
                                imageUrls: [...prev.imageUrls, ...uploaded].slice(0, 3),
                              }));
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDonorModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={uploadingImage} className="btn btn-primary">
                    {editingDonorId ? "Update Donor" : "Save Donor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full Image Lightbox Preview */}
        {previewImage && (
          <div className="lightbox" onClick={() => setPreviewImage(null)}>
            <img src={previewImage} alt="Full Preview" style={{ maxWidth: "90%", maxHeight: "85vh", borderRadius: "8px" }} />
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // EVENTS VIEW
  // ============================================================================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        className="no-print"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
          color: "white",
          padding: "2rem",
          borderRadius: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.8rem", color: "white", fontWeight: 800, margin: 0 }}>
            School Events &amp; Celebrations
          </h1>
          <p style={{ opacity: 0.9, marginTop: "0.35rem", fontSize: "0.92rem" }}>
            ZPHS Somasanigunta Cultural, Academic &amp; National Festivals Register
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingEventId(null);
                setShowAddEvent(true);
              }}
              className="btn btn-accent"
              style={{ fontWeight: 700 }}
            >
              <Plus size={16} /> Add School Event
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary"
            style={{ backgroundColor: "#10b981" }}
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
        {events.map((evt) => {
          const isCompleted = String(evt.status).toUpperCase() === "COMPLETED";
          return (
            <div key={evt.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span className="badge badge-primary">{evt.category}</span>
                  <span className={isCompleted ? "badge badge-success" : "badge badge-warning"}>
                    {evt.status} • {evt.date}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>{evt.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#475569", marginTop: "0.5rem", lineHeight: 1.5 }}>{evt.description}</p>
              </div>

              <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#475569" }}>
                <div><strong>Chief Guest:</strong> {evt.chiefGuest}</div>
                <div><strong>Venue:</strong> {evt.venue}</div>
                {isAdmin && (
                  <div className="no-print" style={{ marginTop: "0.5rem", display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEventId(evt.id);
                        setNewEvent(evt);
                        setShowAddEvent(true);
                      }}
                      style={{
                        color: "#0f766e",
                        background: "#f0fdfa",
                        border: "1px solid #99f6e4",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id)}
                      style={{
                        color: "#dc2626",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdmin && showAddEvent && (
        <div className="lightbox no-print" onClick={() => setShowAddEvent(false)}>
          <div
            className="card"
            style={{ maxWidth: "500px", width: "95%", backgroundColor: "white", padding: "1.75rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem" }}>
              {editingEventId ? "Edit School Event" : "Add New School Event"}
            </h3>
            <form onSubmit={handleSaveEvent} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                required
                placeholder="Event Title (e.g., Science Exhibition 2026)"
                className="form-control"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <input
                  type="date"
                  className="form-control"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <select
                  className="form-control"
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <input
                placeholder="Chief Guest Name"
                className="form-control"
                value={newEvent.chiefGuest}
                onChange={(e) => setNewEvent({ ...newEvent, chiefGuest: e.target.value })}
              />
              <textarea
                required
                rows={3}
                placeholder="Event description & highlights..."
                className="form-control"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEvent(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEventId ? "Update Event" : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
