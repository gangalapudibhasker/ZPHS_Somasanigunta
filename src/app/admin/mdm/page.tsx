"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  Calendar, 
  Utensils, 
  Check, 
  AlertCircle,
  TrendingDown,
  Warehouse
} from "lucide-react";

interface MdmLog {
  id: number;
  date: string;
  item: string;
  receivedQty: number;
  utilizedQty: number;
  balanceQty: number;
  remarks: string | null;
}

interface SummaryItem {
  received: number;
  utilized: number;
  balance: number;
}

interface MdmSummary {
  RICE: SummaryItem;
  EGG: SummaryItem;
  CHIKKY: SummaryItem;
  RAGI_JAVA: SummaryItem;
}

export default function AdminMdmPage() {
  const [logs, setLogs] = useState<MdmLog[]>([]);
  const [summary, setSummary] = useState<MdmSummary>({
    RICE: { received: 0, utilized: 0, balance: 0 },
    EGG: { received: 0, utilized: 0, balance: 0 },
    CHIKKY: { received: 0, utilized: 0, balance: 0 },
    RAGI_JAVA: { received: 0, utilized: 0, balance: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    item: "RICE",
    transactionType: "UTILIZED", // RECEIVED or UTILIZED
    qty: "",
    remarks: ""
  });

  const fetchMdmData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mdm");
      if (!res.ok) throw new Error("Failed to load MDM logs");
      const data = await res.json();
      setLogs(data.logs);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMdmData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.date || !formData.qty) {
      setError("Please fill in the Date and Quantity.");
      return;
    }

    const val = parseFloat(formData.qty);
    if (isNaN(val) || val <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    const payload = {
      date: formData.date,
      item: formData.item,
      receivedQty: formData.transactionType === "RECEIVED" ? val : 0,
      utilizedQty: formData.transactionType === "UTILIZED" ? val : 0,
      remarks: formData.remarks
    };

    try {
      const res = await fetch("/api/mdm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log entry");

      setSuccess("MDM transaction successfully logged.");
      setFormData((prev) => ({ ...prev, qty: "", remarks: "" }));
      fetchMdmData();
    } catch (err: any) {
      setError(err.message || "Failed to log transaction");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this log entry? Current balances will recalculate automatically.")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/mdm?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess("Log entry deleted successfully.");
      fetchMdmData();
    } catch (err: any) {
      setError(err.message || "Failed to delete log entry");
    }
  };

  const handleExcelExport = () => {
    const dataToExport = logs.map((log) => ({
      "Date": log.date,
      "Item Type": log.item,
      "Received Qty": log.receivedQty || 0,
      "Utilized Qty": log.utilizedQty || 0,
      "Balance Qty": log.balanceQty || 0,
      "Remarks": log.remarks || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MDM Stock Ledger");
    worksheet["!cols"] = Array(6).fill({ wch: 18 });
    XLSX.writeFile(workbook, "ZPHS_MDM_Stock_Report.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }} className="no-print">
        <div>
          <h2 style={{ fontSize: "1.75rem", color: "#1e3a8a" }}>Mid-Day Meal (MDM) Dashboard</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Stock tracking, daily consumption logs, and monthly reports</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleExcelExport} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            <Download size={16} /> Export Excel
          </button>
          <button onClick={handlePrint} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="no-print" style={{ padding: "0.75rem 1rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="no-print" style={{ padding: "0.75rem 1rem", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#15803d", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Current Balances Grid */}
      <div className="grid-cols-4">
        {/* Rice Card */}
        <div className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>RICE BALANCE</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>
                {summary.RICE.balance.toFixed(1)} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>Kg</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Rec: {summary.RICE.received} Kg | Ut: {summary.RICE.utilized} Kg
              </div>
            </div>
            <Warehouse size={24} style={{ color: "#3b82f6" }} />
          </div>
          {summary.RICE.balance < 50 && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "#b91c1c", fontWeight: "bold" }}>⚠️ Stock critically low!</div>
          )}
        </div>

        {/* Eggs Card */}
        <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>EGGS BALANCE</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>
                {summary.EGG.balance} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>Units</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Rec: {summary.EGG.received} | Ut: {summary.EGG.utilized}
              </div>
            </div>
            <Utensils size={24} style={{ color: "#f59e0b" }} />
          </div>
          {summary.EGG.balance < 100 && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "#b91c1c", fontWeight: "bold" }}>⚠️ Stock critically low!</div>
          )}
        </div>

        {/* Chikkies Card */}
        <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>CHIKKIES BALANCE</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>
                {summary.CHIKKY.balance} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>Packs</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Rec: {summary.CHIKKY.received} | Ut: {summary.CHIKKY.utilized}
              </div>
            </div>
            <Check size={24} style={{ color: "#10b981" }} />
          </div>
          {summary.CHIKKY.balance < 150 && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "#b91c1c", fontWeight: "bold" }}>⚠️ Stock critically low!</div>
          )}
        </div>

        {/* Ragi Java Card */}
        <div className="card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>RAGI JAVA POWDER</div>
              <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0" }}>
                {summary.RAGI_JAVA.balance.toFixed(1)} <span style={{ fontSize: "1rem", fontWeight: "normal" }}>Kg</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Rec: {summary.RAGI_JAVA.received} Kg | Ut: {summary.RAGI_JAVA.utilized} Kg
              </div>
            </div>
            <TrendingDown size={24} style={{ color: "#8b5cf6" }} />
          </div>
          {summary.RAGI_JAVA.balance < 15 && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "#b91c1c", fontWeight: "bold" }}>⚠️ Stock critically low!</div>
          )}
        </div>
      </div>

      {/* Main Grid: Form Log & History List */}
      <div className="grid-cols-3 no-print">
        {/* Form Log */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#1e3a8a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={20} /> Log MDM Transaction
          </h3>
          
          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transaction Date *</label>
              <input
                name="date"
                type="date"
                className="form-control"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Item *</label>
              <select name="item" className="form-control" value={formData.item} onChange={handleInputChange}>
                <option value="RICE">Rice (in Kg)</option>
                <option value="EGG">Eggs (in Units)</option>
                <option value="CHIKKY">Chikkies (in Packs)</option>
                <option value="RAGI_JAVA">Ragi Java Powder (in Kg)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transaction Type *</label>
              <select name="transactionType" className="form-control" value={formData.transactionType} onChange={handleInputChange}>
                <option value="UTILIZED">Utilized (Consumption)</option>
                <option value="RECEIVED">Received (Stock Delivery)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quantity *</label>
              <input
                name="qty"
                type="number"
                step="0.1"
                min="0.1"
                className="form-control"
                value={formData.qty}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Remarks</label>
              <input
                name="remarks"
                type="text"
                className="form-control"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="e.g. Weekly allocation, daily lunch"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
              Submit Log Entry
            </button>
          </form>
        </div>

        {/* Stock Journal / Log Table */}
        <div style={{ gridColumn: "span 2" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={20} style={{ color: "#64748b" }} /> Stock Transaction Log
            </h3>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>Loading transactions...</div>
            ) : (
              <div style={{ overflowX: "auto", flex: 1 }} className="table-container">
                <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Received</th>
                      <th>Utilized</th>
                      <th>Running Balance</th>
                      <th>Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontWeight: "600" }}>{log.date}</td>
                          <td>
                            <span className={`badge ${
                              log.item === "RICE" ? "badge-primary" :
                              log.item === "EGG" ? "badge-warning" :
                              log.item === "CHIKKY" ? "badge-success" : "badge-danger"
                            }`}>
                              {log.item.replace("_", " ")}
                            </span>
                          </td>
                          <td style={{ color: log.receivedQty > 0 ? "#15803d" : "inherit", fontWeight: log.receivedQty > 0 ? "bold" : "normal" }}>
                            {log.receivedQty > 0 ? `+${log.receivedQty}` : "-"}
                          </td>
                          <td style={{ color: log.utilizedQty > 0 ? "#b45309" : "inherit", fontWeight: log.utilizedQty > 0 ? "bold" : "normal" }}>
                            {log.utilizedQty > 0 ? `-${log.utilizedQty}` : "-"}
                          </td>
                          <td style={{ fontWeight: "700" }}>{log.balanceQty.toFixed(1)}</td>
                          <td>{log.remarks}</td>
                          <td>
                            <button
                              onClick={() => handleDelete(log.id)}
                              style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444" }}
                              title="Delete entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No MDM transactions logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT REPORT (Only visible during printing) */}
      <div style={{ display: "none" }} className="print-only">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2>MID-DAY MEAL (DOKKA SEETHAMMA MADHYAHANA BADI BHOJANAM SCHEME) MONTHLY REPORT</h2>
          <h3>ZILLA PARISHAD HIGH SCHOOL, SOMASANIGUNTA</h3>
          <h4>Academic Year: 2026-2027 | Generated on: {new Date().toLocaleDateString("en-IN")}</h4>
          <hr style={{ margin: "1rem 0", borderTop: "2px solid black" }} />
        </div>

        <h3>1. Current Stock Balances Summary</h3>
        <table className="custom-table" style={{ width: "100%", border: "1px solid black", marginTop: "1rem", marginBottom: "2rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9" }}>
              <th style={{ border: "1px solid black" }}>Item Description</th>
              <th style={{ border: "1px solid black" }}>Total Stock Received</th>
              <th style={{ border: "1px solid black" }}>Total Stock Utilized</th>
              <th style={{ border: "1px solid black" }}>Current Stock Balance</th>
              <th style={{ border: "1px solid black" }}>Unit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black", fontWeight: "bold" }}>Rice</td>
              <td style={{ border: "1px solid black" }}>{summary.RICE.received}</td>
              <td style={{ border: "1px solid black" }}>{summary.RICE.utilized}</td>
              <td style={{ border: "1px solid black", fontWeight: "bold" }}>{summary.RICE.balance.toFixed(1)}</td>
              <td style={{ border: "1px solid black" }}>Kg</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black", fontWeight: "bold" }}>Eggs</td>
              <td style={{ border: "1px solid black" }}>{summary.EGG.received}</td>
              <td style={{ border: "1px solid black" }}>{summary.EGG.utilized}</td>
              <td style={{ border: "1px solid black", fontWeight: "bold" }}>{summary.EGG.balance}</td>
              <td style={{ border: "1px solid black" }}>Units</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black", fontWeight: "bold" }}>Chikkies</td>
              <td style={{ border: "1px solid black" }}>{summary.CHIKKY.received}</td>
              <td style={{ border: "1px solid black" }}>{summary.CHIKKY.utilized}</td>
              <td style={{ border: "1px solid black", fontWeight: "bold" }}>{summary.CHIKKY.balance}</td>
              <td style={{ border: "1px solid black" }}>Packs</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black", fontWeight: "bold" }}>Ragi Java Powder</td>
              <td style={{ border: "1px solid black" }}>{summary.RAGI_JAVA.received}</td>
              <td style={{ border: "1px solid black" }}>{summary.RAGI_JAVA.utilized}</td>
              <td style={{ border: "1px solid black", fontWeight: "bold" }}>{summary.RAGI_JAVA.balance.toFixed(1)}</td>
              <td style={{ border: "1px solid black" }}>Kg</td>
            </tr>
          </tbody>
        </table>

        <h3>2. Log Ledger History</h3>
        <table className="custom-table" style={{ width: "100%", border: "1px solid black", marginTop: "1rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f1f5f9" }}>
              <th style={{ border: "1px solid black" }}>Date</th>
              <th style={{ border: "1px solid black" }}>Item</th>
              <th style={{ border: "1px solid black" }}>Stock Received</th>
              <th style={{ border: "1px solid black" }}>Stock Utilized</th>
              <th style={{ border: "1px solid black" }}>Running Balance</th>
              <th style={{ border: "1px solid black" }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ border: "1px solid black" }}>{log.date}</td>
                <td style={{ border: "1px solid black" }}>{log.item}</td>
                <td style={{ border: "1px solid black" }}>{log.receivedQty || "-"}</td>
                <td style={{ border: "1px solid black" }}>{log.utilizedQty || "-"}</td>
                <td style={{ border: "1px solid black", fontWeight: "bold" }}>{log.balanceQty.toFixed(1)}</td>
                <td style={{ border: "1px solid black" }}>{log.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem" }}>
          <div>MDM School Organizer Signature</div>
          <div>Headmaster / School Committee Chairman</div>
        </div>
      </div>

    </div>
  );
}
