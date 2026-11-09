import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "zphs_somasanigunta_secret_key_2026";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === testHash;
  } catch {
    return false;
  }
}

export function createToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [header, data, signature] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(`${header}.${data}`)
      .digest("base64url");
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    return payload;
  } catch {
    return null;
  }
}
