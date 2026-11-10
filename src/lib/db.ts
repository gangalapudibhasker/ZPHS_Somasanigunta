import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import snapshotData from "./staticSnapshot.json";

const snapshot: any = snapshotData;

function getDatabaseUrl(): string | undefined {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = "/tmp/dev.db";
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const candidates = [
          path.join(process.cwd(), "prisma", "dev.db"),
          path.join(__dirname, "../../prisma/dev.db"),
          path.join(__dirname, "../../../prisma/dev.db"),
        ];
        for (const src of candidates) {
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, tmpDbPath);
            break;
          }
        }
      }
      if (fs.existsSync(tmpDbPath)) {
        return `file:${tmpDbPath}`;
      }
    } catch (e) {
      console.warn("Could not copy dev.db to /tmp/dev.db:", e);
    }
  }
  return process.env.DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  rawPrisma: PrismaClient | undefined;
};

function createRawPrisma(): PrismaClient {
  const dbUrl = getDatabaseUrl();
  if (dbUrl) {
    return new PrismaClient({
      datasources: { db: { url: dbUrl } },
    });
  }
  return new PrismaClient();
}

const rawPrisma = globalForPrisma.rawPrisma ?? createRawPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.rawPrisma = rawPrisma;

const MODEL_TO_SNAPSHOT_KEY: Record<string, (s: any) => any[]> = {
  student: (s) => s.students || [],
  notice: (s) => s.notices || [],
  galleryImage: (s) => s.gallery || [],
  smcMember: (s) => s.smc?.members || [],
  smcProposal: (s) => s.smc?.proposals || [],
  smcMeeting: (s) => s.smc?.meetings || [],
  smcActionItem: (s) => s.smc?.actionItems || [],
  sasaActivity: (s) => s.sasaActivities || [],
  facilityNote: (s) => s.facilityNotes || [],
  classroomActivity: (s) => s.classroomActivities || [],
  officeFile: (s) => s.officeFiles || [],
  nominalRoll: (s) => s.nominalRolls || [],
  mdmLog: (s) => s.mdmLogs || [],
  activeCampaign: (s) => s.activeCampaigns || [],
  notification: (s) => s.notifications || [],
  gradeReport: (s) => s.gradeReports || [],
  attendanceRecord: (s) => s.attendanceRecords || [],
  ptConference: (s) => s.ptConferences || [],
  user: (s) => s.users || [],
};

function matchesWhere(item: any, where: any): boolean {
  if (!where || typeof where !== "object") return true;
  for (const [k, v] of Object.entries(where)) {
    if (v === undefined) continue;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      if ("in" in v && Array.isArray((v as any).in)) {
        if (!(v as any).in.includes(item[k])) return false;
      }
      continue;
    }
    if (item[k] !== v) return false;
  }
  return true;
}

function applyArgs(list: any[], args?: any): any[] {
  let result = [...list];
  if (args?.where) {
    result = result.filter((item) => matchesWhere(item, args.where));
  }
  if (args?.take && typeof args.take === "number") {
    result = result.slice(0, args.take);
  }
  return result;
}

function createModelProxy(modelName: string, rawDelegate: any) {
  const getFallbackList = () => {
    const getter = MODEL_TO_SNAPSHOT_KEY[modelName];
    return getter ? getter(snapshot) : [];
  };

  return new Proxy(rawDelegate || {}, {
    get(target, prop: string) {
      const origMethod = target?.[prop];
      if (prop === "findMany") {
        return async (args?: any) => {
          try {
            if (typeof origMethod === "function") {
              return await origMethod.call(target, args);
            }
          } catch {}
          return applyArgs(getFallbackList(), args);
        };
      }
      if (prop === "findFirst" || prop === "findUnique") {
        return async (args?: any) => {
          try {
            if (typeof origMethod === "function") {
              return await origMethod.call(target, args);
            }
          } catch {}
          const filtered = applyArgs(getFallbackList(), args);
          return filtered[0] ?? null;
        };
      }
      if (prop === "count") {
        return async (args?: any) => {
          try {
            if (typeof origMethod === "function") {
              return await origMethod.call(target, args);
            }
          } catch {}
          return applyArgs(getFallbackList(), args).length;
        };
      }
      if (prop === "groupBy") {
        return async (args?: any) => {
          try {
            if (typeof origMethod === "function") {
              return await origMethod.call(target, args);
            }
          } catch {}
          return [];
        };
      }
      if (prop === "create") {
        return async (args?: any) => {
          try {
            if (typeof origMethod === "function") {
              return await origMethod.call(target, args);
            }
          } catch {}
          const list = getFallbackList();
          const newItem = { id: Date.now(), ...(args?.data || {}) };
          list.unshift(newItem);
          return newItem;
        };
      }
      if (prop === "update") {
        return async (args?: any) => {
          try {
            if (typeof origMethod === "function") {
              return await origMethod.call(target, args);
            }
          } catch {}
          const list = getFallbackList();
          const idx = list.findIndex((item) => matchesWhere(item, args?.where));
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...(args?.data || {}) };
            return list[idx];
          }
          return { ...(args?.where || {}), ...(args?.data || {}) };
        };
      }
      if (prop === "upsert") {
        return async (args?: any) => {
          try {
            if (typeof origMethod === "function") {
              return await origMethod.call(target, args);
            }
          } catch {}
          const list = getFallbackList();
          const idx = list.findIndex((item) => matchesWhere(item, args?.where));
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...(args?.update || {}) };
            return list[idx];
          }
          const newItem = { id: Date.now(), ...(args?.create || {}) };
          list.unshift(newItem);
          return newItem;
        };
      }
      if (prop === "delete" || prop === "deleteMany") {
        return async (args?: any) => {
          try {
            if (typeof origMethod === "function") {
              return await origMethod.call(target, args);
            }
          } catch {}
          const list = getFallbackList();
          const idx = list.findIndex((item) => matchesWhere(item, args?.where));
          if (idx >= 0) list.splice(idx, 1);
          return { count: 1 };
        };
      }
      if (typeof origMethod === "function") {
        return origMethod.bind(target);
      }
      return origMethod;
    },
  });
}

export const prisma: PrismaClient = new Proxy(rawPrisma, {
  get(target: any, prop: string) {
    if (prop === "$queryRawUnsafe") {
      return async (query: string, ...values: any[]) => {
        try {
          return await target.$queryRawUnsafe(query, ...values);
        } catch {
          const q = String(query || "");
          if (q.includes('"Student"')) {
            return (snapshot.students || []).map((s: any) => ({
              ...s,
              admissionFormData:
                typeof s.admissionFormData === "string"
                  ? s.admissionFormData
                  : JSON.stringify(s.admissionFormData || {}),
            }));
          }
          if (q.includes('"SchoolHubStore"')) {
            return snapshot.schoolHubRows || [];
          }
          if (q.includes('COUNT(*)') && q.includes('"StudentActivityPost"')) {
            return [{ count: (snapshot.studentActivityRows || []).length }];
          }
          if (q.includes('"StudentActivityPost"')) {
            return snapshot.studentActivityRows || [];
          }
          return [];
        }
      };
    }
    if (prop === "$executeRawUnsafe") {
      return async (query: string, ...values: any[]) => {
        try {
          return await target.$executeRawUnsafe(query, ...values);
        } catch {
          const q = String(query || "");
          if (q.includes('UPDATE "Student"') && values.length >= 8) {
            const id = Number(values[values.length - 1]);
            const idx = (snapshot.students || []).findIndex((s: any) => Number(s.id) === id);
            if (idx >= 0) {
              let parsedForm = {};
              try {
                parsedForm = typeof values[6] === "string" ? JSON.parse(values[6]) : values[6] || {};
              } catch {}
              snapshot.students[idx] = {
                ...snapshot.students[idx],
                apaarId: values[0] ?? snapshot.students[idx].apaarId,
                penId: values[1] ?? snapshot.students[idx].penId,
                fatherName: values[2] ?? snapshot.students[idx].fatherName,
                motherName: values[3] ?? snapshot.students[idx].motherName,
                caste: values[4] ?? snapshot.students[idx].caste,
                admissionYear: values[5] ?? snapshot.students[idx].admissionYear,
                admissionFormData: parsedForm,
              };
            }
          }
          return 0;
        }
      };
    }
    if (prop in MODEL_TO_SNAPSHOT_KEY) {
      return createModelProxy(prop, target[prop]);
    }
    const val = target[prop];
    return typeof val === "function" ? val.bind(target) : val;
  },
});
