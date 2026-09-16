from pathlib import Path

path = Path('server.ts')
source = path.read_text(encoding='utf-8')

old_auth = '''const ADMIN_EMAIL = (process.env.LUMINA_ADMIN_EMAIL || "").trim().toLowerCase();
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
}'''

new_auth = '''const ADMIN_EMAIL = (process.env.LUMINA_ADMIN_EMAIL || "").trim().toLowerCase();
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
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({ email, role: "SUPER_ADMIN", iat: now, exp: now + SESSION_TTL_MS })).toString("base64url");
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
    if (!Number.isFinite(session.iat) || !Number.isFinite(session.exp) || session.exp <= session.iat || Date.now() >= session.exp) return null;
    const revokedUntil = revokedSessions.get(token);
    if (revokedUntil and revokedUntil > Date.now()) return null;
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
}'''.replace('if (revokedUntil and revokedUntil > Date.now())', 'if (revokedUntil && revokedUntil > Date.now())')

if 'function verifySession(token: string)' not in source:
    if old_auth not in source:
        raise SystemExit('Expected authentication block not found; refusing to modify server.ts')
    source = source.replace(old_auth, new_auth, 1)

login_marker = '// Server-side administrator authentication. No credentials are shipped to the browser.'
login_start = source.find(login_marker)
route_start = source.find('app.post("/api/auth/admin-login"', login_start)
route_end = source.find('\n\n', route_start)
if login_start < 0 or route_start < 0 or route_end < 0:
    raise SystemExit('Admin login route not found')

login_block = source[login_start:route_end]
if 'Set-Cookie' not in login_block:
    needle = 'return res.json({ success: true, sessionToken: issueSession(cleanEmail), user:'
    replacement = 'const sessionToken = issueSession(cleanEmail);\n  res.setHeader("Set-Cookie", `lumina_session=${encodeURIComponent(sessionToken)}; HttpOnly; Path=/; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);\n  return res.json({ success: true, sessionToken, user:'
    if needle not in login_block:
        raise SystemExit('Inline session issuance not found in admin login route')
    source = source[:login_start] + login_block.replace(needle, replacement, 1) + source[route_end:]

if 'app.get("/api/auth/session"' not in source:
    anchor = '// Billing Router'
    insertion = '''// Server-side session lifecycle endpoints.
app.get("/api/auth/session", (req: Request, res: Response) => {
  const session = verifySession(getSessionToken(req));
  if (!session) return res.status(401).json({ success: false, authenticated: false });
  return res.json({ success: true, authenticated: true, user: { email: session.email, name: "Super Admin", role: session.role } });
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  const token = getSessionToken(req);
  const session = verifySession(token);
  if (token && session) revokedSessions.set(token, session.exp);
  res.setHeader("Set-Cookie", "lumina_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax" + (process.env.NODE_ENV === "production" ? "; Secure" : ""));
  return res.json({ success: true });
});

'''
    if anchor not in source:
        raise SystemExit('Billing Router anchor not found')
    source = source.replace(anchor, insertion + anchor, 1)

path.write_text(source, encoding='utf-8')
marker = Path('AUTH_SESSION_HARDENING_REQUEST')
if marker.exists():
    marker.unlink()
print('Auth session migration complete.')
