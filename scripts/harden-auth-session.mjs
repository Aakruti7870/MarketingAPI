import fs from "node:fs";

const file = "server.ts";
const source = fs.readFileSync(file, "utf8");

const oldAuth = `const ADMIN_EMAIL = (process.env.LUMINA_ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.LUMINA_ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD_SALT = process.env.LUMINA_ADMIN_PASSWORD_SALT || "";
const AUTH_SECRET = process.env.LUMINA_AUTH_SECRET || "";
function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !ADMIN_PASSWORD_SALT || !AUTH_SECRET) return false;
  try { const derived = scryptSync(password, ADMIN_PASSWORD_SALT, 64).toString("hex"); return timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(ADMIN_PASSWORD_HASH, "hex")); } catch { return false; }
}
function issueSession(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, role: "SUPER_ADMIN", iat: Date.now() })).toString("base64url");
  const signature = createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}`;

const newAuth = `const ADMIN_EMAIL = (process.env.LUMINA_ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.LUMINA_ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD_SALT = process.env.LUMINA_ADMIN_PASSWORD_SALT || "";
const AUTH_SECRET = process.env.LUMINA_AUTH_SECRET || "";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const revokedSessions = new Map<string, number>();

function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !ADMIN_PASSWORD_SALT || !AUTH_SECRET) return false;
  try {
    const derived = scryptSync(password, ADMIN_PASSWORD_SALT, 64).toString("hex");
    const expected = Buffer.from(ADMIN_PASSWORD_HASH, "hex");
    const actual = Buffer.from(derived, "hex");
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function issueSession(email: string): string {
  if (!AUTH_SECRET) throw new Error("Authentication service is not configured");
  const payload = Buffer.from(JSON.stringify({ email, role: "SUPER_ADMIN", iat: Date.now(), exp: Date.now() + SESSION_TTL_MS })).toString("base64url");
  const signature = createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function getSessionToken(req: Request): string {
  const authorization = String(req.headers.authorization || "");
  if (authorization.startsWith("Bearer ")) return authorization.slice(7).trim();
  const cookieHeader = String(req.headers.cookie || "");
  const match = cookieHeader.match(/(?:^|;\\s*)lumina_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function verifySession(token: string): { email: string; role: string; iat: number; exp: number } | null {
  if (!AUTH_SECRET || !token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  try {
    const expected = createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
    const actual = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actual.length !== expectedBuffer.length || !timingSafeEqual(actual, expectedBuffer)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (session.role !== "SUPER_ADMIN" || session.email !== ADMIN_EMAIL) return null;
    if (!Number.isFinite(session.exp) || Date.now() >= session.exp) return null;
    const revokedUntil = revokedSessions.get(token);
    if (revokedUntil && revokedUntil > Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function requireAdminSession(req: Request, res: Response, next: () => void) {
  const session = verifySession(getSessionToken(req));
  if (!session) return res.status(401).json({ success: false, message: "Authentication required or session expired." });
  (req as any).adminSession = session;
  next();
}`;

if (source.includes("const SESSION_TTL_MS = 8 * 60 * 60 * 1000;") && source.includes("function verifySession(token: string)")) {
  console.log("Auth session hardening already applied.");
} else if (source.includes(oldAuth)) {
  fs.writeFileSync(file, source.replace(oldAuth, newAuth));
  console.log("Applied server-side expiring, signed session validation.");
} else {
  throw new Error("Expected authentication block was not found; refusing to modify server.ts");
}

let updated = fs.readFileSync(file, "utf8");
const loginMarker = `// Server-side administrator authentication. No credentials are shipped to the browser.`;
const loginStart = updated.indexOf(loginMarker);
const loginEnd = updated.indexOf("\n\n", updated.indexOf("app.post(\"/api/auth/admin-login\"", loginStart));
if (loginStart === -1 || loginEnd === -1) throw new Error("Admin login route was not found");
const loginBlock = updated.slice(loginStart, loginEnd);
if (!loginBlock.includes("Set-Cookie") && !loginBlock.includes("setHeader(\"Set-Cookie\"")) {
  const hardenedLogin = loginBlock
    .replace(
      `const sessionToken = issueSession(cleanEmail);`,
      `const sessionToken = issueSession(cleanEmail);\n  res.setHeader("Set-Cookie", \`lumina_session=\${encodeURIComponent(sessionToken)}; HttpOnly; Path=/; SameSite=Lax\${process.env.NODE_ENV === "production" ? "; Secure" : ""}\`);`
    )
    .replace(
      `app.post("/api/auth/admin-login", (req: Request, res: Response) => {`,
      `app.post("/api/auth/admin-login", (req: Request, res: Response) => {`
    );
  if (hardenedLogin === loginBlock) throw new Error("Could not locate session issuance in admin login route");
  updated = updated.slice(0, loginStart) + hardenedLogin + updated.slice(loginEnd);
  fs.writeFileSync(file, updated);
}

updated = fs.readFileSync(file, "utf8");
if (!updated.includes("app.get(\"/api/auth/session\"")) {
  const anchor = `// Billing Router`;
  const insertion = `// Server-side session lifecycle endpoints.\napp.get("/api/auth/session", (req: Request, res: Response) => {\n  const session = verifySession(getSessionToken(req));\n  if (!session) return res.status(401).json({ success: false, authenticated: false });\n  return res.json({ success: true, authenticated: true, user: { email: session.email, name: "Super Admin", role: session.role } });\n});\n\napp.post("/api/auth/logout", (req: Request, res: Response) => {\n  const token = getSessionToken(req);\n  const session = verifySession(token);\n  if (token && session) revokedSessions.set(token, session.exp);\n  res.setHeader("Set-Cookie", "lumina_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax" + (process.env.NODE_ENV === "production" ? "; Secure" : ""));\n  return res.json({ success: true });\n});\n\n`;
  if (!updated.includes(anchor)) throw new Error("Billing Router anchor not found");
  updated = updated.replace(anchor, insertion + anchor);
  fs.writeFileSync(file, updated);
}

fs.unlinkSync("AUTH_SESSION_HARDENING_REQUEST");
console.log("Auth session migration complete.");
