import React from "react";
import { prisma } from "@/lib/db";
import { Calendar, Tag, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function SasaPage() {
  // Query all SASA activities from database
  const sasaActivities = await prisma.sasaActivity.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span className="badge badge-success" style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
          Swarna Andhra - Swachh Andhra (SASA)
        </span>
        <h1 style={{ fontSize: "2.25rem", color: "#1e3a8a" }}>SASA Gallery &amp; Initiatives</h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
          Documenting cleanliness drives, boundary tree plantations, and campus beautification at ZPHS Somasanigunta
        </p>
      </div>

      {sasaActivities.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {sasaActivities.map((act) => (
            <div key={act.id} className="card" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", color: "#0f172a" }}>{act.title}</h2>
                  <p style={{ color: "#475569", marginTop: "0.5rem", lineHeight: "1.6", maxWidth: "800px" }}>
                    {act.description}
                  </p>
                </div>
                <div className="flex gap-4" style={{ flexShrink: 0 }}>
                  <span className="badge badge-primary" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Tag size={12} /> {act.category.replace("_", " ")}
                  </span>
                  <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Calendar size={12} /> {act.date}
                  </span>
                </div>
              </div>

              {/* Before and After Image Side-by-Side Panel */}
              <div className="grid-cols-2" style={{ gap: "2rem" }}>
                {/* Before Image */}
                <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "2px solid #fca5a5" }}>
                  <img 
                    src={act.beforePhoto || "/images/placeholders/sasa_clean_before.svg"} 
                    alt="Before State" 
                    style={{ width: "100%", height: "280px", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                  }}>
                    BEFORE STATE
                  </div>
                </div>

                {/* After Image */}
                <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "2px solid #86efac" }}>
                  <img 
                    src={act.afterPhoto || "/images/placeholders/sasa_clean_after.svg"} 
                    alt="After State" 
                    style={{ width: "100%", height: "280px", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                  }}>
                    AFTER STATE (COMPLETED)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
            No SASA activities have been logged in the gallery database yet.
          </p>
        </div>
      )}
    </div>
  );
}
