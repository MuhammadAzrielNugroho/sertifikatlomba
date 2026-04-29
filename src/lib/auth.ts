// Simple demo admin auth (client-side only — for demo/learning purposes)
const KEY = "certchain_admin_session";
const DEMO_USER = "admin";
const DEMO_PASS = "admin123";

export function login(username: string, password: string): boolean {
  if (username === DEMO_USER && password === DEMO_PASS) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  sessionStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
  return sessionStorage.getItem(KEY) === "1";
}
