import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BookOpen, Monitor, Shield, Trophy, FlaskConical, Droplets, Camera, PlusCircle } from "lucide-react";

export const revalidate = 0;

export default async function FacilitiesPage() {
  const notes = await prisma.facilityNote.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const activities = await prisma.classroomActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const facilities = [
    {
      id: "ifp",
      title: "Interactive Flat Panels (IFP)",
      subtitle: "Smart classrooms bringing lessons to life",
      icon: <Monitor size={32} style={{ color: "#a21caf" }} />,
      color: "#fae8ff",
      borderColor: "#d946ef",
      image: "/images/ifp-friendly.png",
      details: [
        "**Number of Panels**: 5 high-definition touch flat panels installed.",
        "**Classrooms Covered**: Smart teaching deployed in classrooms for Classes 6, 7, 8, 9, and 10.",
        "**Usage Details**: Used for showcasing interactive 3D simulations, video lectures from the AP Education Department (SCERT), e-textbooks, and interactive drawing activities.",
        "**Features**: Multi-touch support, screen mirroring from teacher devices, built-in education apps, and high-quality speaker arrays.",
      ],
    },
    {
      id: "scilab",
      title: "Science Laboratory",
      subtitle: "Hands-on experimentation and scientific observation",
      icon: <FlaskConical size={32} style={{ color: "#15803d" }} />,
      color: "#dcfce7",
      borderColor: "#22c55e",
      image: "/images/science-friendly.jpg",
      details: [
        "**Equipment**: Fully stocked with chemical reagents, test tubes, microscopes, slides, physical balances, magnets, lenses, prisms, and models of human anatomy.",
        "**Experiment Gallery**: Weekly lab sessions conducted for 8th, 9th, and 10th class students covering photosynthesis, acids and bases, circuit building, and plant cell observations.",
        "**Safety Features**: Fire extinguishers, emergency water bucket stations, and clear safety rule posters on display.",
        "**Activities**: Annual science fairs where students create working models and showcase them to parents and village visitors.",
      ],
    },
    {
      id: "mathlab",
      title: "Mathematics Laboratory",
      subtitle: "Conceptualizing shapes, numbers, and geometry",
      icon: <Shield size={32} style={{ color: "#a16207" }} />,
      color: "#fef9c3",
      borderColor: "#eab308",
      image: "/images/math-friendly.jpg",
      details: [
        "**Teaching Aids**: Abacus counters, wooden 3D geometrical shapes (cones, cylinders, pyramids), fraction circles, coordinate boards, and graph boards.",
        "**Activities**: Visualizing algebraic formulas through tile placements, calculating heights using clinometers, and designing symmetric origami patterns.",
        "**Focus Area**: Removing math anxiety and building intuitive problem-solving skills in junior classes.",
      ],
    },
    {
      id: "library",
      title: "School Library",
      subtitle: "A quiet space for reading and knowledge acquisition",
      icon: <BookOpen size={32} style={{ color: "#be123c" }} />,
      color: "#ffe4e6",
      borderColor: "#f43f5e",
      image: "/images/library-friendly.jpg",
      details: [
        "**Total Books**: 1,250 books cataloged and tracked digitally.",
        "**Categories**: English Literature, Telugu Storybooks, Science Encyclopedias, General Knowledge guides, Competitive Exam prep books, and children's magazines.",
        "**Reading Activities**: Weekly library hour for all classes. 'We Love Reading' challenges held monthly to promote reading speed and comprehension.",
      ],
    },
    {
      id: "sports",
      title: "Sports & Physical Education",
      subtitle: "Nurturing discipline, health, and teamwork",
      icon: <Trophy size={32} style={{ color: "#c2410c" }} />,
      color: "#ffedd5",
      borderColor: "#f97316",
      image: "/images/sports-friendly.jpg",
      details: [
        "**Outdoor Facilities**: Fenced multi-sport ground for Kabaddi, Kho-Kho, and Volleyball.",
        "**Indoor Facilities**: Carrom boards, chess sets, and yoga mats.",
        "**Achievements**: ZPHS Somasanigunta regularly wins the Mandal-level boys Kabaddi tournament and has produced 3 district-level track and field athletes.",
      ],
    },
  ];

  return (
    <div className="container" style={{ paddingTop: "3rem", display: "flex", flexDirection: "column", gap: "3rem" }}>
      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2.4rem", color: "#1e3a8a", fontWeight: "800" }}>School Facilities &amp; Classroom Activities</h1>
        <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1.05rem" }}>
          Exploring the digital, scientific, and recreational resources at ZPHS Somasanigunta
        </p>
        <div style={{ marginTop: "1rem" }}>
          <Link href="/portal/facilities" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
            <Camera size={16} /> Teacher Activity Upload Portal
          </Link>
        </div>
      </div>

      {/* Facilities Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {facilities.map((fac, index) => {
          const isEven = index % 2 === 0;
          const facNotes = notes.filter((n) => n.facilityId === fac.id);
          const facActivities = activities.filter((a) => a.facilityId === fac.id);

          return (
            <div
              key={fac.id}
              id={fac.id}
              className="card"
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: isEven ? "row" : "row-reverse",
                gap: "2.5rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Text Side */}
              <div style={{ flex: "1 1 350px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ padding: "0.75rem", backgroundColor: fac.color, borderRadius: "50%", display: "flex" }}>
                    {fac.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.5rem", color: "#0f172a" }}>{fac.title}</h2>
                    <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "500" }}>{fac.subtitle}</p>
                  </div>
                </div>

                <div
                  style={{
                    height: "4px",
                    width: "60px",
                    backgroundColor: fac.borderColor,
                    borderRadius: "2px",
                    marginBottom: "1.5rem",
                  }}
                />

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {fac.details.map((detail, idx) => {
                    const match = detail.match(/^\*\*(.*?)\*\*(.*)/);
                    if (match) {
                      return (
                        <li key={idx} style={{ fontSize: "0.95rem", lineHeight: "1.6", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                          <span style={{ color: fac.borderColor, marginTop: "0.25rem", flexShrink: 0 }}>•</span>
                          <span>
                            <strong>{match[1]}</strong>{match[2]}
                          </span>
                        </li>
                      );
                    }
                    return (
                      <li key={idx} style={{ fontSize: "0.95rem", lineHeight: "1.6", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                        <span style={{ color: fac.borderColor, marginTop: "0.25rem", flexShrink: 0 }}>•</span>
                        <span>{detail}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* Facility Notes Section */}
                {facNotes.length > 0 && (
                  <div style={{ marginTop: "1.25rem", backgroundColor: "#f8fafc", padding: "0.85rem", borderRadius: "8px", borderLeft: `3px solid ${fac.borderColor}` }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Facility Update / Note:</div>
                    <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#0f172a", marginTop: "2px" }}>{facNotes[0].title}</div>
                    <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "2px" }}>{facNotes[0].content}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>— {facNotes[0].authorName} ({facNotes[0].date})</div>
                  </div>
                )}
              </div>

              {/* Photo Side */}
              <div style={{ flex: "1 1 300px", maxWidth: "100%", overflow: "hidden", borderRadius: "12px", boxShadow: "var(--shadow-md)" }}>
                <img src={fac.image} alt={fac.title} className="facility-img" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Classroom Activity Images Showcase */}
      {activities.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.85rem", color: "#1e3a8a", fontWeight: "800" }}>Classroom Activities In Action</h2>
            <p style={{ color: "#64748b" }}>Live moments and projects uploaded directly by our dedicated faculty</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {activities.map((act) => (
              <div key={act.id} className="card" style={{ padding: "0.75rem", overflow: "hidden" }}>
                <img
                  src={act.photoUrl}
                  alt={act.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.75rem" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-primary">Class {act.classLevel}</span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{act.date}</span>
                </div>
                <h3 style={{ fontSize: "1rem", color: "#0f172a", marginTop: "0.5rem" }}>{act.title}</h3>
                <p style={{ fontSize: "0.825rem", color: "#64748b", lineHeight: "1.4", marginTop: "0.25rem" }}>{act.description}</p>
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600", marginTop: "0.5rem" }}>
                  Teacher: {act.teacherName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
