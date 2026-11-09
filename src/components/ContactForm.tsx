"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.message) {
      setError("Please fill in Name, Mobile, and Message.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({
        name: "",
        mobile: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch {
      setError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#dcfce7",
          color: "#15803d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem auto",
        }}>
          <Check size={28} />
        </div>
        <h4 style={{ color: "#15803d", fontSize: "1.2rem", marginBottom: "0.5rem" }}>Message Sent Successfully!</h4>
        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: "1.5" }}>
          Thank you for contacting ZPHS Somasanigunta. The school office will respond to your inquiry shortly.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="btn btn-primary" 
          style={{ marginTop: "1.5rem", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error && (
        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="mobile">Mobile Number *</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            className="form-control"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="10-digit number"
            required
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="subject">Subject</label>
          <select
            id="subject"
            name="subject"
            className="form-control"
            value={formData.subject}
            onChange={handleChange}
          >
            <option value="General Inquiry">General Inquiry</option>
            <option value="Admissions">Admissions 2026-2027</option>
            <option value="Certificates">Transfer/Study Certificates</option>
            <option value="Feedback">Website Feedback</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="form-control"
          value={formData.message}
          onChange={handleChange}
          placeholder="Type your message here..."
          required
        ></textarea>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={loading}
        style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
      >
        {loading ? "Sending..." : "Submit Message"}
      </button>
    </form>
  );
}
