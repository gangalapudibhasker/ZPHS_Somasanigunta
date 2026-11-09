"use client";

import React, { useState } from "react";
import {
  Users2,
  Vote,
  FileCheck2,
  ListTodo,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Building,
  Check,
  Calendar,
  AlertCircle,
  FileText,
  Lock,
} from "lucide-react";

interface SmcMember {
  id: number;
  memberNumber: number;
  name: string;
  designation: string;
  category: string;
  contactNo: string;
  photo?: string | null;
  isVotingEligible: boolean;
}

interface SmcProposal {
  id: number;
  proposalCode: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  submittedBy: string;
  submissionDate: string;
  votingDeadline: string;
  status: string;
  yesCount: number;
  noCount: number;
  abstainCount: number;
  totalQuorum: number;
}

interface SmcMeeting {
  id: number;
  meetingNo: number;
  date: string;
  time: string;
  location: string;
  title: string;
  agenda: string;
  minutesSummary: string;
  attendeesCount: number;
  status: string;
}

interface SmcActionItem {
  id: number;
  proposalId?: number | null;
  taskDescription: string;
  assignedTo: string;
  targetDate: string;
  priority: string;
  status: string;
  completionNotes?: string | null;
}

interface SmcManagerProps {
  initialMembers: SmcMember[];
  initialProposals: SmcProposal[];
  initialMeetings: SmcMeeting[];
  initialActionItems: SmcActionItem[];
  userRole?: string;
  userName?: string;
}

export default function SmcManager({
  initialMembers,
  initialProposals,
  initialMeetings,
  initialActionItems,
  userRole = "SMC",
  userName = "SMC Member",
}: SmcManagerProps) {
  const [activeTab, setActiveTab] = useState<"PROPOSALS" | "MEMBERS" | "MINUTES" | "ACTIONS">("PROPOSALS");
  const [proposals, setProposals] = useState<SmcProposal[]>(initialProposals);
  const [actionItems, setActionItems] = useState<SmcActionItem[]>(initialActionItems);
  const [meetings, setMeetings] = useState<SmcMeeting[]>(initialMeetings);

  // Voting state
  const [selectedProposalForVote, setSelectedProposalForVote] = useState<SmcProposal | null>(null);
  const [voteChoice, setVoteChoice] = useState<"YES" | "NO" | "ABSTAIN">("YES");
  const [voteComment, setVoteComment] = useState("");
  const [votingLoading, setVotingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Proposal Creation Modal
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [newProposalForm, setNewProposalForm] = useState({
    title: "",
    description: "",
    category: "INFRASTRUCTURE",
    budget: 50000,
    votingDeadline: "",
  });

  const handleCastVote = async () => {
    if (!selectedProposalForVote) return;
    setVotingLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/smc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: selectedProposalForVote.id,
          vote: voteChoice,
          comment: voteComment,
          memberName: userName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record vote");

      // Update proposal state
      setProposals(proposals.map((p) => (p.id === data.proposal.id ? data.proposal : p)));
      setSelectedProposalForVote(null);
      setVoteComment("");
      setMessage({
        type: "success",
        text: `Your ${voteChoice} vote on "${selectedProposalForVote.title}" was recorded and committee members were notified!`,
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Voting error" });
    } finally {
      setVotingLoading(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/smc/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProposalForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create proposal");

      setProposals([data.proposal, ...proposals]);
      setShowProposalModal(false);
      setMessage({ type: "success", text: "New development proposal published for voting!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateActionStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/smc/action-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionItems(actionItems.map((a) => (a.id === id ? data.item : a)));
        setMessage({ type: "success", text: `Action item status updated to ${status}!` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Action item update failed:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Hero Header */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
          color: "white",
          padding: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                padding: "3px 12px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              Statutory Body: 15 Members
            </span>
          </div>
          <h1 style={{ fontSize: "1.75rem", color: "white", fontWeight: "800" }}>
            School Management Committee (SMC)
          </h1>
          <p style={{ opacity: 0.9, marginTop: "0.25rem", fontSize: "0.95rem", maxWidth: "650px" }}>
            ZPHS Somasanigunta democratic school governance council. Deliberating on campus infrastructure, academic enhancements, transparent budgeting, and community development.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowProposalModal(true)}
            className="btn btn-accent"
            style={{ fontSize: "0.85rem" }}
          >
            <PlusCircle size={16} /> Table New Proposal
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {message && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "8px",
            backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fca5a5"}`,
            color: message.type === "success" ? "#15803d" : "#991b1b",
            fontSize: "0.9rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem", overflowX: "auto" }}>
        {[
          { key: "PROPOSALS", label: "Proposals & Voting", icon: <Vote size={18} />, count: proposals.length },
          { key: "MEMBERS", label: "15 Committee Members", icon: <Users2 size={18} />, count: initialMembers.length },
          { key: "MINUTES", label: "Meeting Minutes", icon: <FileCheck2 size={18} />, count: meetings.length },
          { key: "ACTIONS", label: "Action Item Tracker", icon: <ListTodo size={18} />, count: actionItems.filter((a) => a.status !== "COMPLETED").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === tab.key ? "#1e3a8a" : "transparent",
              color: activeTab === tab.key ? "#ffffff" : "#475569",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab.icon}
            {tab.label}
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 6px",
                borderRadius: "10px",
                backgroundColor: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                color: activeTab === tab.key ? "#ffffff" : "#0f172a",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: PROPOSALS & SECURE VOTING */}
      {activeTab === "PROPOSALS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "700" }}>Active School Development Proposals</h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Each committee member carries 1 vote. Minimum quorum of 8 votes required for resolution adoption.
              </p>
            </div>
            <a
              href="/api/export?type=SMC"
              className="btn btn-outline"
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
            >
              Export Resolutions CSV
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
            {proposals.map((prop) => {
              const totalVotes = prop.yesCount + prop.noCount + prop.abstainCount;
              const quorumPercent = Math.round((totalVotes / 15) * 100);
              const isApproved = prop.status === "APPROVED" || prop.yesCount >= 8;

              return (
                <div key={prop.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <span className="badge badge-primary">{prop.proposalCode}</span>
                      <span className={`badge ${isApproved ? "badge-success" : "badge-warning"}`}>
                        {prop.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.5rem", fontWeight: "700" }}>
                      {prop.title}
                    </h3>

                    <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5", marginBottom: "1rem" }}>
                      {prop.description}
                    </p>

                    <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "1rem" }}>
                      <div>Budget Estimate: <strong style={{ color: "#1e3a8a" }}>₹{prop.budget.toLocaleString()}</strong></div>
                      <div style={{ marginTop: "2px" }}>Submitted by: <strong>{prop.submittedBy}</strong></div>
                      <div style={{ marginTop: "2px" }}>Voting Deadline: <strong>{prop.votingDeadline}</strong></div>
                    </div>

                    {/* Voting Progress Breakdown */}
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>
                        <span>Quorum: {totalVotes} / 15 Members Voted</span>
                        <span>{quorumPercent}%</span>
                      </div>
                      <div style={{ height: "8px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                        <div style={{ width: `${(prop.yesCount / 15) * 100}%`, backgroundColor: "#10b981" }} title={`${prop.yesCount} YES`} />
                        <div style={{ width: `${(prop.noCount / 15) * 100}%`, backgroundColor: "#ef4444" }} title={`${prop.noCount} NO`} />
                        <div style={{ width: `${(prop.abstainCount / 15) * 100}%`, backgroundColor: "#94a3b8" }} title={`${prop.abstainCount} Abstain`} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.5rem 0", borderTop: "1px dashed #e2e8f0" }}>
                      <span style={{ color: "#15803d", fontWeight: "700" }}>✓ {prop.yesCount} YES</span>
                      <span style={{ color: "#b91c1c", fontWeight: "700" }}>✗ {prop.noCount} NO</span>
                      <span style={{ color: "#64748b", fontWeight: "600" }}>– {prop.abstainCount} Abstain</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <button
                      onClick={() => {
                        setSelectedProposalForVote(prop);
                        setVoteChoice("YES");
                      }}
                      className="btn btn-primary"
                      style={{ width: "100%", fontSize: "0.85rem", padding: "0.5rem" }}
                    >
                      <Vote size={16} /> Cast / Modify Vote
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 15 COMMITTEE MEMBERS ROSTER */}
      {activeTab === "MEMBERS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "700" }}>15-Member School Management Committee Roster</h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Constituted under Section 21 of the Right to Education (RTE) Act with democratic stakeholder representation
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {initialMembers.map((m) => (
              <div
                key={m.id}
                className="card"
                style={{
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  borderLeft: `4px solid ${
                    m.designation.includes("Chairperson")
                      ? "#1e3a8a"
                      : m.designation.includes("Secretary")
                      ? "#059669"
                      : "#f59e0b"
                  }`,
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "1rem",
                    color: "#1e3a8a",
                    flexShrink: 0,
                  }}
                >
                  #{m.memberNumber}
                </div>
                <div>
                  <h3 style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: "700" }}>{m.name}</h3>
                  <div style={{ fontSize: "0.8rem", color: "#1e3a8a", fontWeight: "600" }}>{m.designation}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                    Category: <strong>{m.category}</strong> | 📞 {m.contactNo}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#059669", fontWeight: "700", marginTop: "4px" }}>
                    ✓ Voting Eligible
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEETING MINUTES */}
      {activeTab === "MINUTES" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "700" }}>SMC General Body Meeting Minutes</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Official records of agendas, quorum attendance, and resolutions passed by the committee
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {meetings.map((meet) => (
              <div key={meet.id} className="card" style={{ padding: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: "0.25rem" }}>Meeting #{meet.meetingNo}</span>
                    <h3 style={{ fontSize: "1.25rem", color: "#0f172a", fontWeight: "800" }}>{meet.title}</h3>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>
                      📅 {meet.date} at {meet.time} | 📍 {meet.location} | 👥 Quorum: <strong>{meet.attendeesCount}/15 Members Present</strong>
                    </div>
                  </div>
                  <span className="badge badge-success">COMPLETED &amp; SIGNED</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", marginTop: "1rem", backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "10px" }}>
                  <div>
                    <h4 style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Agenda Points:</h4>
                    <pre style={{ fontSize: "0.85rem", color: "#334155", whiteSpace: "pre-wrap", fontFamily: "inherit", marginTop: "0.5rem" }}>
                      {meet.agenda}
                    </pre>
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Minutes &amp; Resolutions Passed:</h4>
                    <p style={{ fontSize: "0.875rem", color: "#0f172a", lineHeight: "1.6", marginTop: "0.5rem" }}>
                      {meet.minutesSummary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACTION ITEM TRACKER */}
      {activeTab === "ACTIONS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "700" }}>SMC Resolution Action Items</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Tracking progress of development tasks assigned to committee members and local authorities
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  backgroundColor: item.status === "COMPLETED" ? "#f0fdf4" : "#ffffff",
                  borderLeft: `4px solid ${
                    item.status === "COMPLETED" ? "#10b981" : item.priority === "HIGH" ? "#ef4444" : "#f59e0b"
                  }`,
                }}
              >
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: item.priority === "HIGH" ? "#fee2e2" : "#fef3c7",
                        color: item.priority === "HIGH" ? "#991b1b" : "#92400e",
                      }}
                    >
                      {item.priority} PRIORITY
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Target Due Date: <strong>{item.targetDate}</strong></span>
                  </div>
                  <h4 style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: "700" }}>{item.taskDescription}</h4>
                  <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "2px" }}>
                    Assigned To: <strong>{item.assignedTo}</strong>
                  </div>
                  {item.completionNotes && (
                    <div style={{ fontSize: "0.75rem", color: "#059669", fontStyle: "italic", marginTop: "4px" }}>
                      Update: {item.completionNotes}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {item.status !== "COMPLETED" ? (
                    <button
                      onClick={() => handleUpdateActionStatus(item.id, "COMPLETED")}
                      className="btn btn-accent"
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                    >
                      <Check size={14} /> Mark Completed
                    </button>
                  ) : (
                    <span className="badge badge-success" style={{ fontWeight: "700" }}>✓ COMPLETED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cast Vote Modal */}
      {selectedProposalForVote && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setSelectedProposalForVote(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", width: "100%", padding: "2rem", backgroundColor: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: "1.25rem" }}>
              <span className="badge badge-primary">{selectedProposalForVote.proposalCode}</span>
              <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "800", marginTop: "0.5rem" }}>
                Cast Vote: {selectedProposalForVote.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                Budget: ₹{selectedProposalForVote.budget.toLocaleString()} | Member: {userName}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="form-label" style={{ fontWeight: "700" }}>Your Committee Vote</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setVoteChoice("YES")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: voteChoice === "YES" ? "2px solid #10b981" : "1px solid #cbd5e1",
                      backgroundColor: voteChoice === "YES" ? "#dcfce7" : "#ffffff",
                      color: voteChoice === "YES" ? "#15803d" : "#334155",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    ✓ YES
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoteChoice("NO")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: voteChoice === "NO" ? "2px solid #ef4444" : "1px solid #cbd5e1",
                      backgroundColor: voteChoice === "NO" ? "#fee2e2" : "#ffffff",
                      color: voteChoice === "NO" ? "#b91c1c" : "#334155",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    ✗ NO
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoteChoice("ABSTAIN")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: voteChoice === "ABSTAIN" ? "2px solid #64748b" : "1px solid #cbd5e1",
                      backgroundColor: voteChoice === "ABSTAIN" ? "#f1f5f9" : "#ffffff",
                      color: voteChoice === "ABSTAIN" ? "#0f172a" : "#334155",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    – ABSTAIN
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Member Rationale / Comment (Optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="State your reasons or technical queries regarding this proposal..."
                  value={voteComment}
                  onChange={(e) => setVoteComment(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedProposalForVote(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={votingLoading}
                  onClick={handleCastVote}
                  className="btn btn-primary"
                >
                  {votingLoading ? "Recording Vote..." : "Submit Secure Vote"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Proposal Modal */}
      {showProposalModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowProposalModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "550px", width: "100%", padding: "2rem", backgroundColor: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.25rem", color: "#1e3a8a", fontWeight: "800", marginBottom: "1rem" }}>
              Table New School Development Proposal
            </h3>

            <form onSubmit={handleCreateProposal} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Proposal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Science Lab Reagent Stock Expansion, Sports Netting"
                  className="form-control"
                  value={newProposalForm.title}
                  onChange={(e) => setNewProposalForm({ ...newProposalForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={newProposalForm.category}
                    onChange={(e) => setNewProposalForm({ ...newProposalForm, category: e.target.value })}
                  >
                    <option value="INFRASTRUCTURE">Civil Infrastructure</option>
                    <option value="DIGITAL_CLASSROOM">Digital Smart IFP</option>
                    <option value="DRINKING_WATER">Drinking Water &amp; Sanitation</option>
                    <option value="ACADEMIC_IMPROVEMENT">Academic Excellence</option>
                    <option value="SPORTS">Sports &amp; Physical Training</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newProposalForm.budget}
                    onChange={(e) => setNewProposalForm({ ...newProposalForm, budget: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Justification &amp; Scope of Work</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe student benefits, contractor quotes, and timeline..."
                  value={newProposalForm.description}
                  onChange={(e) => setNewProposalForm({ ...newProposalForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowProposalModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Table for Voting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
