// client/src/auth.js

/** Save auth after login */
export function setAuth(token, user) {
  if (token) localStorage.setItem("token", token);
  if (user)  localStorage.setItem("user", JSON.stringify(user));
}

/** Read raw JWT token */
export function getToken() {
  return localStorage.getItem("token");
}

/** Decode JWT payload (no verify) */
export function parseJwt(token) {
  try {
    const base = token.split(".")[1];
    const norm = base.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(norm)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Get role from token (UPPERCASE) — use this instead of localStorage.getItem('role') */
export function getRole() {
  const t = getToken();
  if (!t) return null;
  const payload = parseJwt(t);          // mund të kthejë null
  const raw = (payload?.role ?? "");    // shmang undefined
  return raw.replace(/^ROLE_/i, "").toUpperCase() || null;
}



/** Is token expired? */
export function isExpired() {
  const t = getToken();
  if (!t) return true;
  const payload = parseJwt(t);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp;
}

/** Get user (from storage; fallback to token payload) */
export function getUser() {
  try {
    const s = localStorage.getItem("user");
    if (s) return JSON.parse(s);
  } catch {}
  const t = getToken();
  const p = t ? parseJwt(t) : null;
  return p ? { id: p.id, email: p.email, role: (p.role || "").toUpperCase() } : null;
}

/** Has valid auth right now? */
export function hasAuth() {
  const t = getToken();
  return Boolean(t && !isExpired());
}

/** Clear auth and go to /login */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
