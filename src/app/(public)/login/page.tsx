"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const performLogin = async (username: string, password: string) => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setSuccess(true);

      // Short delay for visual transition
      setTimeout(() => {
        router.push(data.redirectUrl || "/admin/dashboard");
      }, 600);
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUsername = params.get("username");
    const urlPassword = params.get("password");
    const urlError = params.get("error");

    if (urlError === "invalid") {
      setError("Invalid username or password");
    } else if (urlError === "missing") {
      setError("Please fill in all fields.");
    }

    if (urlUsername && urlPassword) {
      setFormData({ username: urlUsername, password: urlPassword });
      window.history.replaceState({}, "", "/login");
      performLogin(urlUsername, urlPassword);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const domForm = new FormData(e.currentTarget);
    const username = (formData.username || String(domForm.get("username") || "")).trim();
    const password = formData.password || String(domForm.get("password") || "");
    await performLogin(username, password);
  };

  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", paddingTop: "5rem" }}>
      <div className="card" style={{ maxWidth: "420px", width: "100%", padding: "2.5rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#eff6ff",
            color: "#1e3a8a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem auto",
            border: "2px solid #3b82f6"
          }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: "1.5rem", color: "#1e3a8a" }}>Admin Portal Login</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Authorized administration credentials required
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: "0.75rem 1rem", 
            backgroundColor: "#fee2e2", 
            border: "1px solid #fca5a5", 
            borderRadius: "8px", 
            color: "#991b1b", 
            fontSize: "0.85rem", 
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ 
            padding: "0.75rem 1rem", 
            backgroundColor: "#dcfce7", 
            border: "1px solid #bbf7d0", 
            borderRadius: "8px", 
            color: "#15803d", 
            fontSize: "0.85rem", 
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <CheckCircle size={16} />
            <span>Login successful! Redirecting...</span>
          </div>
        )}

        <form action="/api/auth/login" method="POST" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="username">Username</label>
            <div style={{ position: "relative" }}>
              <input
                id="username"
                name="username"
                type="text"
                className="form-control"
                style={{ paddingLeft: "2.5rem" }}
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                disabled={loading || success}
              />
              <User size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                style={{ paddingLeft: "2.5rem" }}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                disabled={loading || success}
              />
              <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
            disabled={loading || success}
          >
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#64748b", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
          <span>For default testing credentials, please refer to the project's implementation plan details.</span>
        </div>

      </div>
    </div>
  );
}
