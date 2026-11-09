"use client";

import React from "react";

export interface AdmissionFormExtraData {
  motherTongue?: string;
  fatherOccupation?: string;
  fatherAadhar?: string;
  motherOccupation?: string;
  motherBankAccount?: string;
  motherAadhar?: string;
  motherBankNameBranch?: string;
  motherBankIfsc?: string;
  motherBankMicr?: string;
  motherPhone?: string;
  rationCardNo?: string;
  residingWith?: string;
  guardianName?: string;
  guardianOccupation?: string;
  nationality?: string;
  state?: string;
  religion?: string;
  subCaste?: string;
  previousSchoolName?: string;
  previousSchoolCode?: string;
  previousClass?: string;
  previousMedium?: string;
  eligiblePromotion?: string;
  previousDaysAttended?: string;
  tcNumberDate?: string;
  mediumJoined?: string;
  childInfoNo?: string;
  firstLanguage?: string;
  secondLanguage?: string;
  mole1?: string;
  mole2?: string;
  remarks?: string;
  dateOfAdmission?: string;
}

export function parseAdmissionFormData(raw: any): AdmissionFormExtraData {
  if (!raw) return {};
  if (typeof raw === "object") return raw as AdmissionFormExtraData;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function getDateBoxes(dateStr?: string): string[] {
  if (!dateStr) return ["", "", "", "", "", "", "", ""];
  const trimmed = dateStr.trim();
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yyyy, mm, dd] = trimmed.split("-");
    return [...dd.split(""), ...mm.split(""), ...yyyy.split("")];
  }
  // Try DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[-/]/);
    return [...parts[0].split(""), ...parts[1].split(""), ...parts[2].split("")];
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 8) {
    return digits.split("");
  }
  return ["", "", "", "", "", "", "", ""];
}

function formatDateDDMMYYYY(dateStr?: string | null): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yyyy, mm, dd] = trimmed.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }
  return trimmed;
}

export default function SchoolAdmissionFormDocument({ student }: { student: any }) {
  const extra = parseAdmissionFormData(student?.admissionFormData);

  const genderRaw = (student?.gender || "").toLowerCase();
  const isBoy = genderRaw === "male" || genderRaw === "boy" || genderRaw === "m";
  const isGirl = genderRaw === "female" || genderRaw === "girl" || genderRaw === "f";
  const isTG = genderRaw === "tg" || genderRaw === "transgender" || genderRaw === "other";

  const dobBoxes = getDateBoxes(student?.dob);
  const admissionDateBoxes = getDateBoxes(
    extra.dateOfAdmission || (student?.admissionYear ? `12-06-${String(student.admissionYear).slice(0, 4)}` : "")
  );

  const motherTongue = extra.motherTongue || "Telugu";
  const nationality = extra.nationality || "Indian";
  const state = extra.state || "Andhra Pradesh";
  const religion = extra.religion || "Hindu";
  const residingWith = extra.residingWith || "Parents";
  const mediumJoined =
    !extra.mediumJoined || extra.mediumJoined === "Telugu / English" || extra.mediumJoined === "English / Telugu"
      ? "English"
      : extra.mediumJoined;
  const firstLanguage = extra.firstLanguage || "Telugu";
  const secondLanguage = extra.secondLanguage || "Hindi";
  const childInfoNo = extra.childInfoNo || student?.penId || student?.apaarId || "";
  const remarks = extra.remarks || student?.generalNotes || "";

  const lineStyle: React.CSSProperties = {
    display: "inline-block",
    borderBottom: "1.3px solid #111827",
    padding: "0 5px 1px 5px",
    fontWeight: 700,
    color: "#0f172a",
    minHeight: "18px",
    lineHeight: "1.2",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "4.5px",
    fontSize: "12px",
    color: "#111827",
    lineHeight: "1.32",
  };

  const numStyle: React.CSSProperties = {
    width: "24px",
    fontWeight: 700,
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    whiteSpace: "nowrap",
  };

  const boxStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    border: "1.3px solid #111827",
    fontWeight: 800,
    fontSize: "11.5px",
    backgroundColor: "#ffffff",
    color: "#111827",
  };

  return (
    <div
      className="printable-certificate"
      style={{
        backgroundColor: "#ffffff",
        color: "#111827",
        padding: "14px 22px",
        maxWidth: "794px",
        minHeight: "268mm",
        margin: "0 auto",
        border: "2px solid #111827",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      {/* Top Header matching Samagra Shiksha School Admission Form */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 110px",
          alignItems: "center",
          gap: "10px",
          marginBottom: "4px",
        }}
      >
        {/* Left: AP State / School Emblem */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <img
            src="/images/ap_logo.jpg"
            alt="Government of Andhra Pradesh Emblem"
            style={{ width: "76px", height: "76px", objectFit: "contain", borderRadius: "50%" }}
          />
        </div>

        {/* Center: Samagra Shiksha & Title */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "2px 14px",
              borderRadius: "999px",
              border: "1.3px dashed #d97706",
              backgroundColor: "#fffbeb",
              fontSize: "10px",
              fontWeight: 800,
              color: "#92400e",
              letterSpacing: "0.06em",
              marginBottom: "2px",
            }}
          >
            SAMAGRA SHIKSHA
          </div>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#1e3a8a", marginBottom: "2px" }}>
            ZILLA PARISHAD HIGH SCHOOL, SOMASANIGUNTA
          </div>
          <h1
            style={{
              fontSize: "19px",
              fontWeight: 900,
              letterSpacing: "0.03em",
              margin: "1px 0 0 0",
              color: "#000000",
              textTransform: "uppercase",
            }}
          >
            SCHOOL ADMISSION FORM
          </h1>
        </div>

        {/* Right: Passport Size Photo Box */}
        <div
          style={{
            width: "104px",
            height: "118px",
            border: "1.5px solid #111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "3px",
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          {student?.photo ? (
            <img
              src={student.photo}
              alt={student.name || "Student"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#374151", lineHeight: "1.3" }}>
              Paste here the latest passport size photo of the student
            </span>
          )}
        </div>
      </div>

      {/* 1. Name of the Student */}
      <div style={rowStyle}>
        <span style={numStyle}>1.</span>
        <span style={labelStyle}>Name of the Student:-</span>
        <span style={{ ...lineStyle, flex: 1, fontSize: "13px", textTransform: "uppercase" }}>
          {student?.name || ""}
        </span>
      </div>

      {/* 2. Gender */}
      <div style={rowStyle}>
        <span style={numStyle}>2.</span>
        <span style={labelStyle}>Gender:-</span>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "26px", marginLeft: "24px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: 700 }}>
            Boy <span style={boxStyle}>{isBoy ? "✓" : ""}</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: 700 }}>
            Girl <span style={boxStyle}>{isGirl ? "✓" : ""}</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: 700 }}>
            TG <span style={boxStyle}>{isTG ? "✓" : ""}</span>
          </span>
        </div>
      </div>

      {/* 3. Date of Birth */}
      <div style={rowStyle}>
        <span style={numStyle}>3.</span>
        <span style={labelStyle}>Date of Birth:-</span>
        <div style={{ display: "inline-flex", alignItems: "center", marginLeft: "10px" }}>
          {dobBoxes.map((char, idx) => (
            <span
              key={idx}
              style={{
                ...boxStyle,
                marginRight: idx === 1 || idx === 3 ? "5px" : "-1.3px",
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <span style={{ ...lineStyle, flex: 1, marginLeft: "8px", fontSize: "11.5px" }}>
          {student?.dob ? formatDateDDMMYYYY(student.dob) : ""}
        </span>
      </div>

      {/* 4. Mother Tongue & Student Aadhar */}
      <div style={rowStyle}>
        <span style={numStyle}>4.</span>
        <span style={labelStyle}>Mother Tongue:-</span>
        <span style={{ ...lineStyle, width: "125px" }}>{motherTongue}</span>
        <span style={{ ...labelStyle, marginLeft: "6px" }}>Aadhar No. of the Student:-</span>
        <span style={{ ...lineStyle, flex: 1 }}>{student?.aadhaarNo || ""}</span>
      </div>

      {/* 5. Father's Name, Occupation, Aadhar, Phone */}
      <div style={{ marginBottom: "6px", fontSize: "12.2px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "5px" }}>
          <span style={numStyle}>5.</span>
          <span style={labelStyle}>Father&apos;s Name:-</span>
          <span style={{ ...lineStyle, flex: 1.3 }}>{student?.fatherName || ""}</span>
          <span style={{ ...labelStyle, marginLeft: "6px" }}>Occupation:-</span>
          <span style={{ ...lineStyle, flex: 0.9 }}>{extra.fatherOccupation || ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingLeft: "24px" }}>
          <span style={labelStyle}>Aadhar No.:-</span>
          <span style={{ ...lineStyle, flex: 1.3 }}>{extra.fatherAadhar || ""}</span>
          <span style={{ ...labelStyle, marginLeft: "6px" }}>Phone No.:-</span>
          <span style={{ ...lineStyle, flex: 0.9 }}>{student?.mobileNo || ""}</span>
        </div>
      </div>

      {/* 6. Mother's Name, Occupation, Bank A/c, Aadhar, Bank & Branch, IFSC, MICR, Phone */}
      <div style={{ marginBottom: "6px", fontSize: "12.2px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "5px" }}>
          <span style={numStyle}>6.</span>
          <span style={labelStyle}>Mother&apos;s Name:-</span>
          <span style={{ ...lineStyle, flex: 1.3 }}>{student?.motherName || ""}</span>
          <span style={{ ...labelStyle, marginLeft: "6px" }}>Occupation:-</span>
          <span style={{ ...lineStyle, flex: 0.9 }}>{extra.motherOccupation || ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingLeft: "24px", marginBottom: "5px" }}>
          <span style={labelStyle}>Bank A/c No:-</span>
          <span style={{ ...lineStyle, flex: 1.3 }}>{extra.motherBankAccount || ""}</span>
          <span style={{ ...labelStyle, marginLeft: "6px" }}>Aadhar No.:</span>
          <span style={{ ...lineStyle, flex: 0.9 }}>{extra.motherAadhar || ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingLeft: "24px", marginBottom: "5px" }}>
          <span style={labelStyle}>Name of the Bank &amp; Branch:</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.motherBankNameBranch || ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingLeft: "24px" }}>
          <span style={labelStyle}>IFSC Code:-</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.motherBankIfsc || ""}</span>
          <span style={{ ...labelStyle, marginLeft: "4px" }}>MICR Code:-</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.motherBankMicr || ""}</span>
          <span style={{ ...labelStyle, marginLeft: "4px" }}>Phone No:-</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.motherPhone || student?.mobileNo || ""}</span>
        </div>
      </div>

      {/* 7. Family Ration Card No & Residing with Parents / Guardian */}
      <div style={rowStyle}>
        <span style={numStyle}>7.</span>
        <span style={labelStyle}>Family Ration Card No:-</span>
        <span style={{ ...lineStyle, flex: 1 }}>{extra.rationCardNo || ""}</span>
        <span style={{ ...labelStyle, marginLeft: "6px" }}>Residing with Parents / Guardian:</span>
        <span style={{ ...lineStyle, width: "110px" }}>{residingWith}</span>
      </div>

      {/* 8. Guardian's Name & Occupation */}
      <div style={rowStyle}>
        <span style={numStyle}>8.</span>
        <span style={labelStyle}>Guardian&apos;s Name:-</span>
        <span style={{ ...lineStyle, flex: 1.3 }}>{extra.guardianName || ""}</span>
        <span style={{ ...labelStyle, marginLeft: "6px" }}>Occupation:-</span>
        <span style={{ ...lineStyle, flex: 0.9 }}>{extra.guardianOccupation || ""}</span>
      </div>

      {/* 9. Nationality, State, Religion */}
      <div style={rowStyle}>
        <span style={numStyle}>9.</span>
        <span style={labelStyle}>Nationality:-</span>
        <span style={{ ...lineStyle, flex: 1 }}>{nationality}</span>
        <span style={{ ...labelStyle, marginLeft: "6px" }}>State:-</span>
        <span style={{ ...lineStyle, flex: 1.2 }}>{state}</span>
        <span style={{ ...labelStyle, marginLeft: "6px" }}>Religion:-</span>
        <span style={{ ...lineStyle, flex: 1 }}>{religion}</span>
      </div>

      {/* 10. Caste & Sub-caste */}
      <div style={rowStyle}>
        <span style={numStyle}>10.</span>
        <span style={labelStyle}>Caste:-</span>
        <span style={{ ...lineStyle, width: "150px" }}>{student?.caste || ""}</span>
        <span style={{ ...labelStyle, marginLeft: "10px" }}>Sub-caste:-</span>
        <span style={{ ...lineStyle, flex: 1 }}>{extra.subCaste || ""}</span>
      </div>

      {/* 11. Residence */}
      <div style={rowStyle}>
        <span style={numStyle}>11.</span>
        <span style={labelStyle}>Residence:-</span>
        <span style={{ ...lineStyle, flex: 1 }}>{student?.address || "Somasanigunta"}</span>
      </div>

      {/* 12. Previous School Details */}
      <div style={{ marginBottom: "6px", fontSize: "12.2px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "5px" }}>
          <span style={numStyle}>12.</span>
          <span style={labelStyle}>Name of the School Previous Studying/Studied:</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.previousSchoolName || ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingLeft: "24px", marginBottom: "5px" }}>
          <span style={labelStyle}>School Code:</span>
          <span style={{ ...lineStyle, width: "130px" }}>{extra.previousSchoolCode || ""}</span>
          <span style={{ ...labelStyle, marginLeft: "6px" }}>Studying / Studied Class:-</span>
          <span style={{ ...lineStyle, width: "80px" }}>{extra.previousClass || ""}</span>
          <span style={{ ...labelStyle, marginLeft: "6px" }}>Medium:-</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.previousMedium || ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingLeft: "24px" }}>
          <span style={labelStyle}>
            Are You Eligible Promotion to Next Class:{" "}
            <span style={{ textDecoration: "underline" }}>{extra.eligiblePromotion || "YES / NO"}</span>
          </span>
          <span style={{ ...labelStyle, marginLeft: "8px" }}>As on Admission No. of Days Attended:</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.previousDaysAttended || ""}</span>
        </div>
      </div>

      {/* 13. Record Sheet / TC, Class Joined, Medium, Child Info No */}
      <div style={{ marginBottom: "6px", fontSize: "12.2px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "5px" }}>
          <span style={numStyle}>13.</span>
          <span style={labelStyle}>No. &amp; Date of the Record Sheet / Transfer Certificate:-</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.tcNumberDate || ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingLeft: "24px" }}>
          <span style={labelStyle}>Class Joined in this School:-</span>
          <span style={{ ...lineStyle, width: "80px", textAlign: "center" }}>
            {student?.classLevel ? `${student.classLevel}th` : ""}
          </span>
          <span style={{ ...labelStyle, marginLeft: "6px" }}>Medium:-</span>
          <span style={{ ...lineStyle, width: "110px" }}>{mediumJoined}</span>
          <span style={{ ...labelStyle, marginLeft: "6px" }}>Child Info No.:-</span>
          <span style={{ ...lineStyle, flex: 1 }}>{childInfoNo}</span>
        </div>
      </div>

      {/* 14. First & Second Language Opted */}
      <div style={rowStyle}>
        <span style={numStyle}>14.</span>
        <span style={labelStyle}>First Language Opted:-</span>
        <span style={{ ...lineStyle, width: "130px" }}>{firstLanguage}</span>
        <span style={{ ...labelStyle, marginLeft: "8px" }}>Second Language Opted:-</span>
        <span style={{ ...lineStyle, flex: 1 }}>{secondLanguage}</span>
      </div>

      {/* 15. Personal Marks for Identification */}
      <div style={{ marginBottom: "6px", fontSize: "12.2px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
          <span style={numStyle}>15.</span>
          <span style={labelStyle}>Personal Marks for Identification:- 1)</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.mole1 || ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingLeft: "225px" }}>
          <span style={labelStyle}>2)</span>
          <span style={{ ...lineStyle, flex: 1 }}>{extra.mole2 || ""}</span>
        </div>
      </div>

      {/* 16. Remarks If Any */}
      <div style={rowStyle}>
        <span style={numStyle}>16.</span>
        <span style={labelStyle}>Remarks If Any:-</span>
        <span style={{ ...lineStyle, flex: 1 }}>{remarks}</span>
      </div>

      {/* Declaration & Parent Signature */}
      <div style={{ marginTop: "4px", marginBottom: "4px" }}>
        <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: 700 }}>
          I hereby declare that the above information is correct to the best of my knowledge.
        </p>
        <div style={{ textAlign: "right", fontSize: "12px", fontWeight: 800 }}>
          Signature or Thumb of the Parent / Guardian
        </div>
      </div>

      {/* Divider Line */}
      <hr style={{ border: "none", borderTop: "2px solid #111827", margin: "4px 0 6px 0" }} />

      {/* Bottom Office Order Section */}
      <div style={{ fontSize: "12px" }}>
        <div style={{ fontWeight: 800, lineHeight: "1.5", marginBottom: "6px" }}>
          <span style={{ marginRight: "14px" }}>ORDER:-</span>
          Permitted the student to join in{" "}
          <span style={{ ...lineStyle, width: "60px", textAlign: "center" }}>
            {student?.classLevel || ""}
          </span>
          th Class, with{" "}
          <span style={{ ...lineStyle, width: "130px", textAlign: "center" }}>{mediumJoined}</span> Medium in OUR
          SCHOOL.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            alignItems: "center",
            gap: "14px",
            marginBottom: "8px",
          }}
        >
          {/* Oval School Stamp Box */}
          <div
            style={{
              width: "136px",
              height: "62px",
              border: "1.5px solid #111827",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 700,
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            School Seal
          </div>

          {/* Admission Number & Date of Admission */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "450px" }}>
              <span style={{ fontWeight: 800, fontSize: "12px" }}>Admission Number</span>
              <div
                style={{
                  border: "1.5px solid #111827",
                  minWidth: "150px",
                  height: "24px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 12px",
                  fontWeight: 800,
                  fontSize: "12.5px",
                }}
              >
                {student?.admissionNo || ""}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "450px" }}>
              <span style={{ fontWeight: 800, fontSize: "12px" }}>Date of Admission</span>
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                {admissionDateBoxes.map((char, idx) => (
                  <span
                    key={idx}
                    style={{
                      ...boxStyle,
                      marginRight: idx === 1 || idx === 3 ? "7px" : "-1.3px",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Clerk & Headmaster Signatures */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "2px 20px 0 20px",
            fontWeight: 800,
            fontSize: "12px",
          }}
        >
          <span>Signature of the Clerk</span>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "12.5px", marginBottom: "2px" }}>
              Gangalapudi Bhaskar
            </div>
            <div>Signature of the Head Master</div>
          </div>
        </div>
      </div>
    </div>
  );
}

