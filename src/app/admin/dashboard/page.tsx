import React from "react";
import { prisma } from "@/lib/db";
import { 
  Users, 
  UserCheck, 
  Bell, 
  FolderOpen, 
  Layers, 
  AlertTriangle, 
  CheckCircle,
  FileSpreadsheet,
  PlusCircle,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Query Statistics
  const totalStudents = await prisma.student.count();
  const boysCount = await prisma.student.count({ where: { gender: "Male" } });
  const girlsCount = await prisma.student.count({ where: { gender: "Female" } });
  
  const noticesCount = await prisma.notice.count();
  const filesCount = await prisma.officeFile.count();
  const sasaCount = await prisma.sasaActivity.count();
  const nominalRollCount = await prisma.nominalRoll.count();

  // 2. Query MDM Balances
  const mdmSums = await prisma.mdmLog.groupBy({
    by: ["item"],
    _sum: {
      receivedQty: true,
      utilizedQty: true,
    },
  });

  const mdmBalances = {
    RICE: 0,
    EGG: 0,
    CHIKKY: 0,
    RAGI_JAVA: 0,
  };

  mdmSums.forEach((sum) => {
    const item = sum.item as keyof typeof mdmBalances;
    if (mdmBalances[item] !== undefined) {
      mdmBalances[item] = (sum._sum.receivedQty || 0) - (sum._sum.utilizedQty || 0);
    }
  });

  // Calculate warnings
  const warnings = [];
  if (mdmBalances.RICE < 50) {
    warnings.push({ item: "Rice", val: `${mdmBalances.RICE.toFixed(1)} Kg`, threshold: "50 Kg" });
  }
  if (mdmBalances.EGG < 100) {
    warnings.push({ item: "Eggs", val: `${mdmBalances.EGG} Units`, threshold: "100 Units" });
  }
  if (mdmBalances.CHIKKY < 150) {
    warnings.push({ item: "Chikkies", val: `${mdmBalances.CHIKKY} Packs`, threshold: "150 Packs" });
  }
  if (mdmBalances.RAGI_JAVA < 15) {
    warnings.push({ item: "Ragi Powder", val: `${mdmBalances.RAGI_JAVA.toFixed(1)} Kg`, threshold: "15 Kg" });
  }

  // 3. Fetch recent activities
  const recentStudents = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentFiles = await prisma.officeFile.findMany({
    orderBy: { uploadDate: "desc" },
    take: 4,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Welcome Banner */}
      <div 
        style={{ 
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)", 
          color: "white", 
          padding: "2rem", 
          borderRadius: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <div>
          <h2 style={{ color: "white", fontSize: "1.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Welcome, Sri Gangalapudi Bhaskar Reddy <Sparkles size={24} style={{ color: "#fbbf24" }} />
          </h2>
          <div style={{ fontSize: "0.85rem", color: "#fde68a", fontWeight: "600", marginTop: "0.25rem" }}>
            Headmaster — M.Phil(Maths), M.Sc(Maths), M.Ed., PG dip in Computers
          </div>
          <p style={{ opacity: 0.85, marginTop: "0.35rem", fontSize: "0.95rem" }}>
            ZPHS Somasanigunta administrative control panel. Here is your overview for today.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/admin/students?action=new" className="btn btn-accent" style={{ fontSize: "0.85rem" }}>
            <PlusCircle size={16} /> New Admission
          </Link>
          <Link href="/admin/donors" className="btn btn-primary" style={{ backgroundColor: "#10b981", fontSize: "0.85rem" }}>
            <PlusCircle size={16} /> Donors Details (+ Add Donor)
          </Link>
          <Link href="/admin/nominal-roll" className="btn btn-outline" style={{ borderColor: "white", color: "white", fontSize: "0.85rem" }}>
            <FileSpreadsheet size={16} /> Nominal Roll
          </Link>
        </div>
      </div>

      {/* Warnings Board if stock is low */}
      {warnings.length > 0 && (
        <div 
          style={{ 
            backgroundColor: "#fffbeb", 
            border: "1px solid #fef3c7", 
            borderLeft: "6px solid #f59e0b",
            borderRadius: "12px", 
            padding: "1.25rem 1.5rem" 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#b45309", fontWeight: "bold", fontSize: "1.05rem", marginBottom: "0.5rem" }}>
            <AlertTriangle size={20} />
            <span>Inventory Alert: Mid-Day Meal Stock Low!</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#78350f", marginBottom: "0.75rem" }}>
            The following MDM items are below the recommended warning threshold. Please coordinate replenishments.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {warnings.map((warn) => (
              <div key={warn.item} style={{ backgroundColor: "white", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "0.85rem" }}>
                <strong>{warn.item}:</strong> <span style={{ color: "#dc2626", fontWeight: "bold" }}>{warn.val}</span> (Min: {warn.threshold})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid-cols-4">
        <div className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Total Students</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>{totalStudents}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {boysCount} Boys / {girlsCount} Girls
              </div>
            </div>
            <Users size={24} style={{ color: "#3b82f6" }} />
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>SSC Candidates</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>{nominalRollCount}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Class 10 Nominal Roll
              </div>
            </div>
            <FileSpreadsheet size={24} style={{ color: "#10b981" }} />
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Office Documents</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>{filesCount}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Digitized Files Catalog
              </div>
            </div>
            <FolderOpen size={24} style={{ color: "#8b5cf6" }} />
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Notice Board</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>{noticesCount}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Active School Notices
              </div>
            </div>
            <Bell size={24} style={{ color: "#f59e0b" }} />
          </div>
        </div>
      </div>

      {/* Main Grid Detail Panels */}
      <div className="grid-cols-2">
        {/* Recent Admissions */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem", color: "#0f172a" }}>Recent Student Registrations</h3>
            <Link href="/admin/students" style={{ fontSize: "0.8rem", color: "#1e3a8a", fontWeight: "600" }}>
              Manage
            </Link>
          </div>
          
          {recentStudents.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
              {recentStudents.map((stud) => (
                <div key={stud.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e2e8f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>
                      {stud.gender === "Male" ? "👦" : "👧"}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>{stud.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Adm: {stud.admissionNo}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="badge badge-primary">Class {stud.classLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b", padding: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>No students registered yet.</p>
          )}
        </div>

        {/* Recent Office Files */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem", color: "#0f172a" }}>Recent File Uploads</h3>
            <Link href="/admin/files" style={{ fontSize: "0.8rem", color: "#1e3a8a", fontWeight: "600" }}>
              Cabinet
            </Link>
          </div>

          {recentFiles.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
              {recentFiles.map((f) => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem" }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "260px" }}>
                      {f.originalName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Category: {f.category.replace("_", " ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
                    <span className="badge badge-success">V{f.version}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b", padding: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
