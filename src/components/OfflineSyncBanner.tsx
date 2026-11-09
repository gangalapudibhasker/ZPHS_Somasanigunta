"use client";

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";

export default function OfflineSyncBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingDrafts, setPendingDrafts] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedRecently, setSyncedRecently] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        triggerAutoSync();
      };

      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check pending offline items in localStorage
      checkPendingDrafts();

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const checkPendingDrafts = () => {
    try {
      const drafts = localStorage.getItem("zphs_offline_sync_queue");
      if (drafts) {
        const parsed = JSON.parse(drafts);
        setPendingDrafts(parsed.length || 0);
      } else {
        setPendingDrafts(0);
      }
    } catch {
      setPendingDrafts(0);
    }
  };

  const triggerAutoSync = async () => {
    try {
      const draftsStr = localStorage.getItem("zphs_offline_sync_queue");
      if (!draftsStr) return;
      const drafts = JSON.parse(draftsStr);
      if (drafts.length === 0) return;

      setIsSyncing(true);
      // Process drafts
      for (const item of drafts) {
        if (item.endpoint && item.payload) {
          await fetch(item.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload),
          });
        }
      }

      localStorage.removeItem("zphs_offline_sync_queue");
      setPendingDrafts(0);
      setIsSyncing(false);
      setSyncedRecently(true);
      setTimeout(() => setSyncedRecently(false), 4000);
    } catch (err) {
      console.error("Offline sync error:", err);
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingDrafts === 0 && !syncedRecently) {
    return null; // Silent when everything is normal and online
  }

  return (
    <div
      style={{
        backgroundColor: !isOnline ? "#fef2f2" : syncedRecently ? "#f0fdf4" : "#eff6ff",
        borderBottom: `2px solid ${!isOnline ? "#ef4444" : syncedRecently ? "#22c55e" : "#3b82f6"}`,
        padding: "0.5rem 1rem",
        fontSize: "0.825rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {!isOnline ? (
          <>
            <WifiOff size={16} style={{ color: "#dc2626" }} />
            <strong style={{ color: "#991b1b" }}>Offline Mode Active:</strong>
            <span style={{ color: "#7f1d1d" }}>
              No internet connection detected. Changes are saved locally to your device and will synchronize automatically once reconnected.
            </span>
          </>
        ) : syncedRecently ? (
          <>
            <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
            <strong style={{ color: "#166534" }}>Offline Data Synchronized:</strong>
            <span style={{ color: "#14532d" }}>All pending offline draft entries were successfully uploaded to the central server.</span>
          </>
        ) : (
          <>
            <Wifi size={16} style={{ color: "#2563eb" }} />
            <span style={{ color: "#1e40af" }}>
              {pendingDrafts} local updates ready to synchronize.
            </span>
          </>
        )}
      </div>

      {isOnline && pendingDrafts > 0 && (
        <button
          onClick={triggerAutoSync}
          disabled={isSyncing}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "4px 10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <RefreshCw size={12} className={isSyncing ? "spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </button>
      )}
    </div>
  );
}
