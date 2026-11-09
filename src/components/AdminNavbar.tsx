"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminNavbar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out of the Admin Portal?")) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.8rem",
        width: "100%",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        fontWeight: "bold",
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "background-color 0.2s"
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#fca5a5")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
    >
      <LogOut size={16} />
      {loading ? "Logging out..." : "Log Out"}
    </button>
  );
}
