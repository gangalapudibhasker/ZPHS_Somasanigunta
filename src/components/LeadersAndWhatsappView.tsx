"use client";

import { useState, useEffect } from "react";
import { Award, MessageCircle, Crown, Users, Printer, ExternalLink, Send, Edit3, Save } from "lucide-react";

export default function LeadersAndWhatsappView({
  isAdmin = false,
  initialTab = "LEADERS",
}: {
  isAdmin?: boolean;
  initialTab?: "LEADERS" | "WHATSAPP";
}) {
  const [activeTab, setActiveTab] = useState<"LEADERS" | "WHATSAPP">(initialTab);
  const [leaders, setLeaders] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState(
    "Dear Parents of ZPHS Somasanigunta, please ensure your ward attends school regularly before 8:45 AM in full uniform."
  );

  useEffect(() => {
    fetch("/api/school-hub")
      .then((r) => r.json())
      .then((data) => {
        if (data.leaders) setLeaders(data.leaders);
        if (Array.isArray(data.whatsappGroups)) setGroups(data.whatsappGroups);
      })
      .catch(() => {});
  }, []);

  const saveGroups = async (updated: any[]) => {
    setGroups(updated);
    await fetch("/api/school-hub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "whatsappGroups", value: updated }),
    });
    setEditingGroup(null);
  };

  // Support both schoolLeaders array format and spl/aspl object format
  const schoolCabinet: any[] = leaders?.schoolLeaders
    ? leaders.schoolLeaders
    : leaders?.spl
    ? [leaders.spl, leaders.aspl, leaders.sportsLeader, leaders.sasaLeader].filter(Boolean)
    : [];

  const classLeadersList: any[] = Array.isArray(leaders?.classLeaders) ? leaders.classLeaders : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-emerald-800 rounded-3xl p-8 text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Crown className="w-3.5 h-3.5" /> Student Democracy &amp; Parent Connect
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            SPL, Class Leaders &amp; Class-wise WhatsApp Groups
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            School Pupil Leader (SPL) Cabinet, Class Monitors (6th–10th) &amp; Official Class WhatsApp Broadcast Hub
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-black/25 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab("LEADERS")}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === "LEADERS" ? "bg-white text-indigo-950 shadow" : "text-white hover:bg-white/10"
              }`}
            >
              <Crown className="w-4 h-4" /> SPL &amp; Class Leaders
            </button>
            <button
              onClick={() => setActiveTab("WHATSAPP")}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === "WHATSAPP" ? "bg-emerald-500 text-white shadow" : "text-white hover:bg-white/10"
              }`}
            >
              <MessageCircle className="w-4 h-4" /> Class WhatsApp Groups
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-white/20 transition"
          >
            <Printer className="w-4 h-4" /> Print List
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase">ZILLA PARISHAD HIGH SCHOOL, SOMASANIGUNTA</h1>
        <p className="text-sm font-bold text-slate-700">
          Student Council (SPL / ASPL), Class Leaders (Classes 6–10) &amp; Class WhatsApp Directory
        </p>
      </div>

      {activeTab === "LEADERS" && (
        <div className="space-y-8">
          {/* Top School Cabinet: SPL, ASPL, Sports, SASA */}
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" /> School Pupil Leader (SPL) &amp; Student Cabinet ({leaders?.academicYear || "2026-2027"})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {schoolCabinet.map((item: any, idx: number) => {
                const styles = [
                  { badge: "bg-amber-500 text-white", border: "border-amber-300 bg-amber-50/40" },
                  { badge: "bg-indigo-600 text-white", border: "border-indigo-200 bg-indigo-50/40" },
                  { badge: "bg-emerald-600 text-white", border: "border-emerald-200 bg-emerald-50/40" },
                  { badge: "bg-teal-700 text-white", border: "border-teal-200 bg-teal-50/40" },
                ][idx % 4];
                const title = item.position || item.title || "Student Leader";
                const name = item.studentName || item.name || "Student";
                const cls = item.classLevel || `Class ${item.grade || "10"}`;
                const desc = item.duties || item.motto || "Elected student representative.";

                return (
                  <div key={item.id || idx} className={`rounded-2xl border-2 p-6 shadow-sm flex flex-col justify-between ${styles.border}`}>
                    <div>
                      <span className={`inline-block text-[11px] font-black uppercase px-3 py-1 rounded-full ${styles.badge} mb-3`}>
                        {title}
                      </span>
                      <h3 className="text-xl font-black text-slate-900">{name}</h3>
                      <p className="text-xs font-bold text-slate-600 mt-1">
                        {cls} • Roll No: {item.rollNo}
                      </p>
                      <p className="text-xs text-slate-700 mt-3 italic bg-white/80 p-3 rounded-xl border border-slate-200/80">
                        {desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center text-xs font-extrabold text-slate-700">
                      <span>Elected Council Member</span>
                      <span className="text-emerald-700">{item.admissionNo || "Active"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Class-wise Leaders Table (Classes 6 to 10) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-6 h-6 text-indigo-600" /> Class-wise Elected Leaders (Classes 6th to 10th)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each class has a Boy Class Leader and Girl Class Leader guided by their Class Teacher.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <th className="p-4">Class</th>
                    <th className="p-4">Boy Class Leader</th>
                    <th className="p-4">Girl Class Leader</th>
                    <th className="p-4">Class Teacher Guide</th>
                    <th className="p-4 text-center">Class Strength</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {classLeadersList.map((cl: any, idx: number) => (
                    <tr key={cl.classLevel || cl.grade || idx} className="hover:bg-indigo-50/30">
                      <td className="p-4 font-black text-indigo-950 text-base bg-indigo-50/40">
                        {cl.classLevel || `Class ${cl.grade}`}
                      </td>
                      <td className="p-4 font-bold text-slate-900">{cl.boyLeader}</td>
                      <td className="p-4 font-bold text-slate-900">{cl.girlLeader}</td>
                      <td className="p-4 font-medium text-slate-600">{cl.classTeacher}</td>
                      <td className="p-4 text-center font-extrabold text-emerald-700">
                        {cl.strength || 30} Students
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP GROUPS FOR EACH CLASS */}
      {activeTab === "WHATSAPP" && (
        <div className="space-y-6">
          {/* Quick Instant WhatsApp Broadcast Composer */}
          <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-lg print:hidden">
            <h2 className="text-lg font-extrabold flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-emerald-300" /> Quick Class-wise WhatsApp Message Composer
            </h2>
            <p className="text-xs text-emerald-200 mb-4">
              Type an official circular, homework reminder, or exam alert below and click &ldquo;Broadcast&rdquo; on any class card below.
            </p>
            <textarea
              rows={2}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-emerald-600/50 p-3.5 text-sm text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((grp) => {
              const label = grp.classLevel || `Class ${grp.grade}`;
              const members = grp.membersCount ?? grp.memberCount ?? 40;
              const desc = grp.description || grp.activeBroadcast || "Official WhatsApp communication group.";
              const cleanPhone = String(grp.adminPhone || "918555079452").replace(/\D/g, "");

              return (
                <div
                  key={grp.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {label} Official Group
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" /> {members} Members
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{grp.groupName}</h3>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">
                      Group Admin: <span className="text-slate-900">{grp.classTeacher}</span>
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950">
                      <p className="font-extrabold uppercase text-[10px] text-emerald-700 mb-1">Group Purpose &amp; Updates:</p>
                      <p className="font-medium">{desc}</p>
                    </div>

                    {editingGroup === grp.id && (
                      <div className="mt-3 space-y-2 print:hidden">
                        <label className="block text-[11px] font-bold text-slate-600">WhatsApp Group Invite Link:</label>
                        <input
                          value={grp.inviteLink}
                          onChange={(e) => {
                            const updated = groups.map((g) => (g.id === grp.id ? { ...g, inviteLink: e.target.value } : g));
                            setGroups(updated);
                          }}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                        <button
                          onClick={() => saveGroups(groups)}
                          className="w-full bg-blue-600 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Invite Link
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2 print:hidden">
                    <a
                      href={grp.inviteLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Join Group
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `*${grp.groupName}*\n${broadcastMessage}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" /> Broadcast
                    </a>
                    <button
                      onClick={() => setEditingGroup(editingGroup === grp.id ? null : grp.id)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                      title="Edit Invite Link"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
