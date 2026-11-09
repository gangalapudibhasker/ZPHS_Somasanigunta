"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, Users, GraduationCap, Building2, ChevronDown, Check } from "lucide-react";

interface RoleSwitcherBarProps {
  currentRole?: string;
  currentName?: string;
}

export default function RoleSwitcherBar({ currentRole = "ADMIN", currentName = "Administrator" }: RoleSwitcherBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const roles = [
    {
      role: "ADMIN",
      username: "admin",
      label: "Headmaster / Admin",
      name: "Sri Gangalapudi Bhaskar Reddy (Headmaster)",
      icon: <ShieldCheck size={16} style={{ color: "#1e3a8a" }} />,
      desc: "Full administrative access: Nominal roll, MDM, SMC, Google Drive backups, reports",
    },
    {
      role: "TEACHER",
      username: "teacher_science",
      label: "Teacher / Faculty",
      name: "Smt. K. Vani (Physical Science)",
      icon: <UserCheck size={16} style={{ color: "#059669" }} />,
      desc: "Attendance marking, grade report entry, upload classroom activity photos & facility notes",
    },
    {
      role: "PARENT",
      username: "parent_rajesh",
      label: "Parent",
      name: "Sri S. Venkateswarlu (Parent of S. Rajesh)",
      icon: <Users size={16} style={{ color: "#d97706" }} />,
      desc: "Monitor child's daily attendance, view report cards, real-time alerts, book conferences",
    },
    {
      role: "STUDENT",
      username: "student_rajesh",
      label: "Student",
      name: "S. Rajesh Kumar (Class 10)",
      icon: <GraduationCap size={16} style={{ color: "#7c3aed" }} />,
      desc: "View academic progress cards, attendance record, examination notices, timetable",
    },
    {
      role: "SMC",
      username: "smc_chairperson",
      label: "SMC Committee",
      name: "Sri B. Murali Krishna (SMC Chairperson)",
      icon: <Building2 size={16} style={{ color: "#dc2626" }} />,
      desc: "15-member committee: Vote on school proposals, view meeting minutes, track action items",
    },
  ];

  const handleSwitch = async (username: string, targetRole: string) => {
    setSwitching(true);
    try {
      const password = username === "admin" ? "admin@zphs2026" : "password123";
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setIsOpen(false);
        if (targetRole === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/portal/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Role switch failed:", err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        padding: "0.5rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.85rem",
        position: "relative",
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
          Active Session Role:
        </span>
        <span
          style={{
            backgroundColor: currentRole === "ADMIN" ? "#1e3a8a" : currentRole === "TEACHER" ? "#065f46" : currentRole === "PARENT" ? "#92400e" : currentRole === "SMC" ? "#991b1b" : "#5b21b6",
            padding: "2px 10px",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: "700",
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {currentRole}
        </span>
        <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{currentName}</span>
      </div>

      {/* Switcher Dropdown */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={switching}
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            borderRadius: "6px",
            padding: "4px 12px",
            fontSize: "0.8rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
        >
          <span>{switching ? "Switching..." : "Switch Test Role"}</span>
          <ChevronDown size={14} />
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: "6px",
              width: "320px",
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              border: "1px solid #cbd5e1",
              padding: "0.5rem",
              zIndex: 1000,
            }}
          >
            <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
              Quick Role-Based Access Demo
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
              {roles.map((r) => {
                const isSelected = r.role === currentRole;
                return (
                  <button
                    key={r.username}
                    onClick={() => handleSwitch(r.username, r.role)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "6px",
                      border: "none",
                      background: isSelected ? "#eff6ff" : "transparent",
                      color: "#0f172a",
                      textAlign: "left",
                      cursor: "pointer",
                      width: "100%",
                      transition: "background 0.15s",
                    }}
                    onMouseOver={(e) => !isSelected && (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseOut={(e) => !isSelected && (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ marginTop: "2px" }}>{r.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "#1e3a8a" }}>{r.label}</span>
                        {isSelected && <Check size={14} style={{ color: "#3b82f6" }} />}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#334155", fontWeight: "600" }}>{r.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
