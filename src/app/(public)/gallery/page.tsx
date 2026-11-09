import React from "react";
import { prisma } from "@/lib/db";
import PhotoGalleryView from "@/components/PhotoGalleryView";

export const revalidate = 0;

export default async function GalleryPage() {
  // Query all school gallery images from database
  const images = await prisma.galleryImage.findMany({
    orderBy: { uploadDate: "desc" },
  });

  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "#1e3a8a" }}>School Photo Gallery</h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
          Capturing moments, academic celebrations, laboratory experiments, and infrastructure at ZPHS Somasanigunta
        </p>
      </div>

      {/* Render Client-Side Photo Grid with Lightbox */}
      <PhotoGalleryView initialImages={images} />
    </div>
  );
}
