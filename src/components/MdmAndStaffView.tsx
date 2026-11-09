"use client";

import { useState, useEffect } from "react";
import { Utensils, HeartPulse, Users, Printer, Plus, Trash2, Phone, ShieldCheck, Calendar, CheckCircle2, Sparkles } from "lucide-react";

interface SupportStaff {
  id: string;
  name: string;
  role: string;
  category: string;
  qualification: string;
  phone: string;
  experience?: string;
  duties?: string;
  responsibilities?: string;
  shift?: string;
  dutyTimings?: string;
  status: string;
}

export default function MdmAndStaffView({
  isAdmin = false,
  initialTab = "MDM",
}: {
  isAdmin?: boolean;
  initialTab?: "MDM" | "STAFF";
}) {
  const [activeTab, setActiveTab] = useState<"MDM" | "STAFF">(initialTab);
  const [staff, setStaff] = useState<SupportStaff[]>([]);
  const [mdmMenu, setMdmMenu] = useState<any[]>([]);
  const [mdmStats, setMdmStats] = useState<{ stocks: any[]; logs: any[] }>({ stocks: [], logs: [] });
  const [showAddModal, setShowAddModal] = useState(false);

  const [newStaff, setNewStaff] = useState<SupportStaff>({
    id: "",
    name: "",
    role: "MDM Cook / Helper",
    category: "Cook",
    qualification: "Experienced SHG Member",
    phone: "",
    experience: "5 Years",
    duties: "",
    shift: "8:30 AM - 4:30 PM",
    status: "ACTIVE",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/school-hub").then((r) => r.json()).catch(() => ({})),
      fetch("/api/mdm").then((r) => r.json()).catch(() => ({ stocks: [], logs: [] })),
    ]).then(([hubData, mdmData]) => {
      if (Array.isArray(hubData?.supportStaff)) setStaff(hubData.supportStaff);
      if (Array.isArray(hubData?.mdmMenu)) setMdmMenu(hubData.mdmMenu);
      if (mdmData) setMdmStats({ stocks: mdmData.stocks || [], logs: mdmData.logs || [] });
    });
  }, []);

  const saveStaffList = async (updated: SupportStaff[]) => {
    setStaff(updated);
    await fetch("/api/school-hub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "supportStaff", value: updated }),
    });
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const item: SupportStaff = {
      ...newStaff,
      id: `stf-${Date.now()}`,
      responsibilities: newStaff.duties,
      dutyTimings: newStaff.shift,
    };
    const updated = [...staff, item];
    await saveStaffList(updated);
    setShowAddModal(false);
    setNewStaff({
      id: "",
      name: "",
      role: "MDM Cook / Helper",
      category: "Cook",
      qualification: "Experienced SHG Member",
      phone: "",
      experience: "5 Years",
      duties: "",
      shift: "8:30 AM - 4:30 PM",
      status: "ACTIVE",
    });
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Remove this staff record?")) return;
    await saveStaffList(staff.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="bg-gradient-to-r from-orange-700 via-amber-700 to-emerald-800 rounded-3xl p-8 text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-bold uppercase tracking-widest mb-3">
            <Utensils className="w-3.5 h-3.5" /> Student Nutrition, Hygiene &amp; Health Care
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Mid-Day Meals (MDM) &amp; Support Staff (Aya, Cook &amp; Nurse)
          </h1>
          <p className="text-amber-100 text-sm mt-1">
            Dokka Seethamma Mid-Day Meal Scheme Menu, Live Stock &amp; School Support Staff Details
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-black/25 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab("MDM")}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === "MDM" ? "bg-white text-orange-900 shadow" : "text-white hover:bg-white/10"
              }`}
            >
              <Utensils className="w-4 h-4" /> MDM (Mid-Day Meals)
            </button>
            <button
              onClick={() => setActiveTab("STAFF")}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === "STAFF" ? "bg-white text-emerald-900 shadow" : "text-white hover:bg-white/10"
              }`}
            >
              <HeartPulse className="w-4 h-4" /> Aya, Cooks &amp; Nurse Details
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-white/20 transition"
          >
            <Printer className="w-4 h-4" /> Print Page
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase">ZILLA PARISHAD HIGH SCHOOL, SOMASANIGUNTA</h1>
        <p className="text-sm font-bold text-slate-700">
          Mid-Day Meal (MDM) Scheme &amp; Support Staff (Aya, Cook &amp; School Health Nurse) Register
        </p>
      </div>

      {/* Support Staff Cards */}
      {activeTab === "STAFF" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-600" /> School Aya, MDM Cooks &amp; School Nurse Directory
              </h2>
              <p className="text-sm text-slate-500">
                Dedicated support team ensuring campus sanitation, hygienic mid-day meals, and student health &amp; first-aid at ZPHS Somasanigunta.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="print:hidden bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Add Staff Member
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staff.map((person) => {
              const catUpper = String(person.category || "").toUpperCase();
              const badgeColor =
                catUpper === "AYA"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : catUpper === "NURSE"
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : "bg-orange-100 text-orange-800 border-orange-200";
              return (
                <div
                  key={person.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div>
                        <span className={`inline-block text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${badgeColor} mb-2`}>
                          {person.category} • {person.role}
                        </span>
                        <h3 className="text-xl font-black text-slate-900">{person.name}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {person.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                      <div>
                        <p className="text-slate-400 font-bold uppercase">Qualification</p>
                        <p className="font-bold text-slate-800 mt-0.5">{person.qualification}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase">Duty Timings</p>
                        <p className="font-bold text-slate-800 mt-0.5">{person.dutyTimings || person.shift || "8:30 AM – 4:00 PM"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-400 font-bold uppercase">Contact Number</p>
                        <p className="font-bold text-blue-700 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {person.phone}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-slate-700 bg-blue-50/50 border border-blue-100 rounded-xl p-3.5">
                      <p className="text-xs font-extrabold uppercase text-blue-900 mb-1">Key Responsibilities &amp; Duties:</p>
                      <p className="text-slate-700 leading-relaxed">{person.responsibilities || person.duties}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end print:hidden">
                      <button
                        onClick={() => handleDeleteStaff(person.id)}
                        className="text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MDM Weekly Menu + Live Stock + Support Staff Summary */}
      {activeTab === "MDM" && (
        <div className="space-y-8">
          {/* Weekly Nutritious Menu Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-orange-50/70 border-b border-orange-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" /> Weekly Mid-Day Meal (MDM) Nutritious Menu
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Prepared hygienically on campus by Head Cook Smt. K. Ramanamma &amp; Assistant Cook Smt. M. Penchalamma, inspected daily by HM Sri Gangalapudi Bhaskar Reddy.
                </p>
              </div>
              <span className="bg-orange-600 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full">
                100% Enrolment Coverage (Classes 6 to 10)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <th className="p-4">Day of Week</th>
                    <th className="p-4">Main Nutritious Meal Menu</th>
                    <th className="p-4">Protein Supplement</th>
                    <th className="p-4">Sweet / Morning Drink</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {mdmMenu.map((row) => (
                    <tr key={row.day} className="hover:bg-orange-50/30">
                      <td className="p-4 font-extrabold text-orange-900 bg-orange-50/40 w-40">{row.day}</td>
                      <td className="p-4 font-bold text-slate-800">{row.mainDish || row.menu}</td>
                      <td className="p-4 font-semibold text-emerald-700">{row.supplement || row.protein}</td>
                      <td className="p-4 font-semibold text-amber-800">{row.morningDrink || row.special}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live MDM Stock & Daily Log Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Current MDM Commodity Stock
              </h3>
              <div className="space-y-3">
                {mdmStats.stocks.length === 0 ? (
                  <p className="text-sm text-slate-500">Stock records available in Admin MDM Tracker.</p>
                ) : (
                  mdmStats.stocks.map((st: any) => (
                    <div key={st.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800">{st.itemName}</span>
                      <span className="font-black text-emerald-700 text-lg">
                        {st.quantity} <span className="text-xs uppercase">{st.unit}</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" /> Recent Daily Attendance &amp; MDM Consumption Logs
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                      <th className="p-3">Date</th>
                      <th className="p-3">Menu Served</th>
                      <th className="p-3 text-center">Students Fed</th>
                      <th className="p-3 text-center">Rice Used (Kg)</th>
                      <th className="p-3 text-center">Eggs Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mdmStats.logs.slice(0, 6).map((log: any) => (
                      <tr key={log.id}>
                        <td className="p-3 font-bold text-slate-800">{log.date}</td>
                        <td className="p-3 text-slate-700 font-medium">{log.menuPrepared}</td>
                        <td className="p-3 text-center font-black text-blue-700">{log.studentsCount}</td>
                        <td className="p-3 text-center font-semibold">{log.riceUsedKg} Kg</td>
                        <td className="p-3 text-center font-semibold">{log.eggsUsedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Preview of Aya, Cooks & Nurse below MDM */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-rose-600" /> MDM Cooks, School Aya &amp; Health Nurse Details
                </h3>
                <p className="text-xs text-slate-500">
                  Dedicated team responsible for cooking, sanitation (SASA), and student health monitoring.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("STAFF")}
                className="print:hidden text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200"
              >
                Manage / View Full Details →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {staff.map((person) => (
                <div key={person.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                    {person.category}
                  </span>
                  <h4 className="font-extrabold text-slate-900 mt-2">{person.name}</h4>
                  <p className="text-xs font-semibold text-slate-600">{person.role}</p>
                  <p className="text-xs font-bold text-blue-700 mt-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {person.phone}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{person.responsibilities || person.duties}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal to Add Aya / Cook / Nurse */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Add Support Staff (Aya / Cook / Nurse)</h3>
            <form onSubmit={handleAddStaff} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                  <input
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="e.g., Smt. K. Lakshmi"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
                  <select
                    value={newStaff.category}
                    onChange={(e) => setNewStaff({ ...newStaff, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  >
                    <option value="AYA">Aya (Sanitation &amp; Care)</option>
                    <option value="COOK">Cook (MDM Mid-Day Meals)</option>
                    <option value="NURSE">Nurse / ANM (School Health)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Designation / Role *</label>
                  <input
                    required
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number *</label>
                  <input
                    required
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Qualification</label>
                  <input
                    value={newStaff.qualification}
                    onChange={(e) => setNewStaff({ ...newStaff, qualification: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Duty Timings</label>
                  <input
                    value={newStaff.shift}
                    onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Duties &amp; Responsibilities</label>
                <textarea
                  rows={3}
                  required
                  value={newStaff.duties}
                  onChange={(e) => setNewStaff({ ...newStaff, duties: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
