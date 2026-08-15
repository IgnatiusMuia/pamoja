import { clearSession, getRefreshToken, setSession } from "./auth.js";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function tryRefresh() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setSession(data);
    return data;
  } catch {
    return null;
  }
}

const NO_TOKEN_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh"];

export async function api(path, { method = "GET", body, token } = {}, _retried = false) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // ignore parse errors
    }
    if (res.status === 401 && !_retried && !NO_TOKEN_REFRESH.includes(path)) {
      const fresh = await tryRefresh();
      if (fresh) {
        return api(path, { method, body, token: fresh.access_token }, true);
      }
      if (token) {
        clearSession();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  if (res.status === 204) return null;
  return res.json();
}

export const API_BASE_URL = API_BASE;
