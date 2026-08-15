const TOKEN_KEY = "pamoja_token";
const REFRESH_KEY = "pamoja_refresh";
const USER_KEY = "pamoja_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function setSession(data) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
  if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function requireAuth(path = "/login") {
  if (typeof window === "undefined") return false;
  if (!isLoggedIn()) {
    window.location.href = `${path}?next=${encodeURIComponent(window.location.pathname)}`;
    return false;
  }
  return true;
}

export function ksh(n) {
  return "KSH " + Number(n || 0).toLocaleString();
}