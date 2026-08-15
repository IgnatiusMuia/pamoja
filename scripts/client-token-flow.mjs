// Verifies the real frontend token/refresh logic (frontend/lib/api.js + auth.js)
// against a running backend, by mocking window/localStorage in Node.
//
// Usage (backend must be up):
//   node scripts/client-token-flow.mjs
// Exits non-zero on any failed check.

const apiUrl = new URL("../frontend/lib/api.js", import.meta.url);
const { api } = await import(apiUrl.href);
const { getToken, setSession, clearSession } = await import(
  new URL("../frontend/lib/auth.js", import.meta.url)
);

const store = new Map();
const localStorageMock = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.localStorage = localStorageMock;
globalThis.window = {
  localStorage: localStorageMock,
  location: { pathname: "/dashboard/profile", href: "" },
};

const API = process.env.PAMOJA_API || "http://127.0.0.1:8000";
const EMAIL = process.env.SMOKE_EMAIL || "demo@pamoja.ke";
const PASSWORD = process.env.SMOKE_PASSWORD || "password123";

let failed = 0;
function check(name, ok, extra = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
  if (!ok) failed += 1;
}

try {
  const login = await api("/auth/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  setSession(login);
  check("login + session stored", !!login.access_token && !!login.refresh_token);

  const me = await api("/auth/me", { token: getToken() });
  check("authenticated call", me.email === EMAIL, me.email);

  const goodToken = getToken();
  store.set("pamoja_token", "expired.token.value");
  const recovered = await api("/auth/me", { token: getToken() });
  const rotated = getToken();
  check("401 triggers refresh + retry", recovered.email === EMAIL && rotated && rotated !== "expired.token.value");

  store.set("pamoja_token", "expired.token.value");
  store.set("pamoja_refresh", "expired.refresh.value");
  let threw = false;
  try {
    await api("/auth/me", { token: getToken() });
  } catch (e) {
    threw = e.message !== "";
  }
  check("failed refresh throws 401", threw);
  check("session cleared on failed refresh", !store.has("pamoja_token") && !store.has("pamoja_refresh"));
  check("redirect to login with next", window.location.href.includes("/login?next="), window.location.href);

  const publicCall = await api("/companions?page_size=6");
  check("public call without token", Array.isArray(publicCall) && publicCall.length > 0);
} catch (e) {
  console.error("  UNEXPECTED ERROR:", e.message);
  failed += 1;
}

console.log(`\nRESULT: ${failed === 0 ? "ALL PASS" : `${failed} FAILED`}\n`);
process.exit(failed === 0 ? 0 : 1);
