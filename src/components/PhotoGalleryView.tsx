"use client";

import React, { useState } from "react";
import { Eye, ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryImage {
  id: number;
  category: string;
  filePath: string;
  title: string;
}

export default function PhotoGalleryView({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images] = useState<GalleryImage[]>(initialImages);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const categories = [
    { value: "ALL", label: "All Photos" },
    { value: "CAMPUS", label: "School Campus" },
    { value: "CLASSROOM", label: "Classrooms" },
    { value: "SCIENCE_LAB", label: "Science Lab" },
    { value: "MATH_LAB", label: "Mathematics Lab" },
    { value: "LIBRARY", label: "Library" },
    { value: "SPORTS", label: "Sports" },
    { value: "SASA", label: "SASA Activities" },
  ];

  // Filter images
  const filteredImages = selectedCategory === "ALL" 
    ? images 
    : images.filter((img) => img.category === selectedCategory);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev! + 1));
  };

  return (
    <div>
      {/* 1. Category Filter Buttons */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "2.5rem" }} className="no-print">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              border: "1px solid",
              borderColor: selectedCategory === cat.value ? "#1e3a8a" : "#cbd5e1",
              borderRadius: "20px",
              cursor: "pointer",
              backgroundColor: selectedCategory === cat.value ? "#1e3a8a" : "white",
              color: selectedCategory === cat.value ? "white" : "#475569",
              transition: "all 0.2s"
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 2. Photos Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid-cols-3">
          {filteredImages.map((img, idx) => (
            <div 
              key={img.id} 
              className="card" 
              style={{ padding: 0, cursor: "pointer", display: "flex", flexDirection: "column" }}
              onClick={() => setActivePhotoIndex(idx)}
            >
              {/* Photo Wrapper */}
              <div style={{ position: "relative", overflow: "hidden", height: "240px" }}>
                <img
                  src={img.filePath}
                  alt={img.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                  className="gallery-thumbnail"
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                {/* Overlay on hover */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(30, 58, 138, 0.4)",
                  opacity: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "opacity 0.3s"
                }}
                className="gallery-overlay"
                onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                onMouseOut={(e) => e.currentTarget.style.opacity = "0"}
                >
                  <Eye size={32} />
                </div>
              </div>
              
              {/* Caption */}
              <div style={{ padding: "1rem" }}>
                <span className="badge badge-primary" style={{ fontSize: "0.7rem", marginBottom: "0.5rem" }}>
                  {img.category.replace("_", " ")}
                </span>
                <h4 style={{ fontSize: "0.95rem", color: "#0f172a" }}>{img.title}</h4>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
            No photos uploaded in this category yet.
          </p>
        </div>
      )}

      {/* 3. Lightbox Slideshow Modal */}
      {activePhotoIndex !== null && filteredImages[activePhotoIndex] && (
        <div className="lightbox" onClick={() => setActivePhotoIndex(null)}>
          {/* Close button */}
          <button 
            onClick={() => setActivePhotoIndex(null)}
            className="lightbox-close"
          >
            <X size={32} />
          </button>

          {/* Previous control */}
          <button 
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: "20px",
              background: "rgba(15,23,42,0.6)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1010
            }}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Main Image container */}
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={filteredImages[activePhotoIndex].filePath}
              alt={filteredImages[activePhotoIndex].title}
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                display: "block",
                margin: "auto",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
              }}
            />
            {/* Caption in lightbox */}
            <div style={{
              marginTop: "1rem",
              textAlign: "center",
              color: "white",
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px"
            }}>
              <span className="badge badge-success" style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}>
                {filteredImages[activePhotoIndex].category.replace("_", " ")}
              </span>
              <h3 style={{ color: "white", fontSize: "1.1rem" }}>{filteredImages[activePhotoIndex].title}</h3>
            </div>
          </div>

          {/* Next control */}
          <button 
            onClick={handleNext}
            style={{
              position: "absolute",
              right: "20px",
              background: "rgba(15,23,42,0.6)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1010
            }}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
