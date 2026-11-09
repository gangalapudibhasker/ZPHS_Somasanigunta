"use client";

import { useEffect } from "react";
import snapshot from "@/lib/staticSnapshot.json";

export default function GitHubPagesShim() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isGhPages =
      window.location.hostname.includes("github.io") ||
      window.location.pathname.startsWith("/ZPHS_Somasanigunta");

    if (!isGhPages) return;

    const basePath = "/ZPHS_Somasanigunta";

    // Fix image src and internal links for GitHub Pages basePath
    const fixAssetPaths = () => {
      document.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src");
        if (src && (src.startsWith("/images/") || src.startsWith("/uploads/"))) {
          img.setAttribute("src", `${basePath}${src}`);
        }
      });
    };

    fixAssetPaths();
    const observer = new MutationObserver(() => fixAssetPaths());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });

    // Initialize localStorage from snapshot if not already set
    const getStore = (key: string, fallback: any) => {
      try {
        const raw = localStorage.getItem(`zphs_gh_${key}`);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };
    const setStore = (key: string, val: any) => {
      try {
        localStorage.setItem(`zphs_gh_${key}`, JSON.stringify(val));
      } catch {}
    };

    const origFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (!urlStr.includes("/api/")) {
        return origFetch(input, init);
      }

      const method = (init?.method || "GET").toUpperCase();
      const bodyObj = init?.body && typeof init.body === "string" ? JSON.parse(init.body) : {};
      const jsonRes = (data: any, status = 200) =>
        new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
        });

      // 1. /api/students
      if (urlStr.includes("/api/students")) {
        let list = getStore("students", snapshot.students || []);
        if (method === "GET") {
          return jsonRes(list);
        }
        if (method === "POST") {
          const newItem = {
            ...bodyObj,
            id: Date.now(),
            classLevel: Number(bodyObj.classLevel || 6),
          };
          list = [...list, newItem];
          setStore("students", list);
          return jsonRes(newItem);
        }
        if (method === "PUT") {
          list = list.map((s: any) => (s.id === bodyObj.id ? { ...s, ...bodyObj } : s));
          setStore("students", list);
          const updated = list.find((s: any) => s.id === bodyObj.id) || bodyObj;
          return jsonRes(updated);
        }
        if (method === "DELETE") {
          const u = new URL(urlStr, window.location.origin);
          const id = Number(u.searchParams.get("id"));
          list = list.filter((s: any) => s.id !== id);
          setStore("students", list);
          return jsonRes({ success: true });
        }
      }

      // 2. /api/school-hub
      if (urlStr.includes("/api/school-hub")) {
        const hub = getStore("schoolHub", snapshot.schoolHub || {});
        if (method === "GET") return jsonRes(hub);
        if (method === "POST") {
          const { section, item } = bodyObj;
          if (section === "events") {
            hub.events = [{ ...item, id: `EV-${Date.now()}` }, ...(hub.events || [])];
          } else if (section === "donors") {
            hub.donors = [{ ...item, id: `DN-${Date.now()}` }, ...(hub.donors || [])];
          }
          setStore("schoolHub", hub);
          return jsonRes({ success: true, data: hub });
        }
        if (method === "PUT") {
          const { section, id, updates } = bodyObj;
          if (section && Array.isArray(hub[section])) {
            hub[section] = hub[section].map((it: any) => (it.id === id ? { ...it, ...updates } : it));
          }
          setStore("schoolHub", hub);
          return jsonRes({ success: true, data: hub });
        }
        if (method === "DELETE") {
          const u = new URL(urlStr, window.location.origin);
          const section = u.searchParams.get("section") || "";
          const id = u.searchParams.get("id") || "";
          if (section && Array.isArray(hub[section])) {
            hub[section] = hub[section].filter((it: any) => it.id !== id);
          }
          setStore("schoolHub", hub);
          return jsonRes({ success: true, data: hub });
        }
      }

      // 3. /api/notices
      if (urlStr.includes("/api/notices")) {
        let notices = getStore("notices", snapshot.notices || []);
        if (method === "GET") {
          const u = new URL(urlStr, window.location.origin);
          const cat = u.searchParams.get("category");
          if (cat && cat !== "ALL") {
            notices = notices.filter((n: any) => n.category === cat);
          }
          return jsonRes(notices);
        }
        if (method === "POST") {
          const n = { ...bodyObj, id: Date.now(), date: bodyObj.date || new Date().toISOString().split("T")[0] };
          notices = [n, ...notices];
          setStore("notices", notices);
          return jsonRes(n);
        }
      }

      // 4. /api/gallery
      if (urlStr.includes("/api/gallery")) {
        const gallery = getStore("gallery", snapshot.gallery || []);
        return jsonRes(gallery);
      }

      // 5. /api/smc
      if (urlStr.includes("/api/smc")) {
        const smc = getStore("smc", snapshot.smc || { members: [], proposals: [], actionItems: [] });
        return jsonRes(smc);
      }

      // 6. /api/student-activities
      if (urlStr.includes("/api/student-activities")) {
        const acts = getStore("studentActivities", snapshot.studentActivities || []);
        return jsonRes(acts);
      }

      // 7. /api/examinations
      if (urlStr.includes("/api/examinations")) {
        const exams = getStore("examinations", snapshot.examinations || []);
        return jsonRes(exams);
      }

      // 8. /api/auth/login, /api/auth/user, /api/auth/logout
      if (urlStr.includes("/api/auth/login")) {
        const user = { id: 1, username: "admin", name: "Sri Gangalapudi Bhaskar Reddy", role: "ADMIN" };
        setStore("authUser", user);
        return jsonRes({ success: true, user });
      }
      if (urlStr.includes("/api/auth/logout")) {
        localStorage.removeItem("zphs_gh_authUser");
        return jsonRes({ success: true });
      }
      if (urlStr.includes("/api/auth/user")) {
        const user = getStore("authUser", null);
        return jsonRes({ user });
      }

      // 9. /api/sync-gsheets
      if (urlStr.includes("/api/sync-gsheets")) {
        return jsonRes({
          success: true,
          spreadsheetId: "1BujOFaqIAwkv-FJowUR7VVQxxFeXOaH7p9Ftu-9dggE",
          url: "https://docs.google.com/spreadsheets/d/1BujOFaqIAwkv-FJowUR7VVQxxFeXOaH7p9Ftu-9dggE/edit",
        });
      }

      return jsonRes({ success: true });
    };

    return () => observer.disconnect();
  }, []);

  return null;
}

