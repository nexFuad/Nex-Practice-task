export type SignedInUser = {
  id: string;
  employeeId: string;
  fullName: string;
  company: string;
  email: string | null;
  role: string;
  profileImageUrl: string | null;
  passwordChangedAt: string;
};

const storageKey = "guardly-signed-in-user";
const explicitLogoutKey = "guardly-explicit-logout";
const eventName = "guardly-auth-change";

export function getSignedInUser() {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(storageKey);
  if (!value) return null;
  try {
    return JSON.parse(value) as SignedInUser;
  } catch {
    return null;
  }
}
export function setSignedInUser(user: SignedInUser) {
  window.sessionStorage.removeItem(explicitLogoutKey);
  window.localStorage.setItem(storageKey, JSON.stringify(user));
  window.dispatchEvent(new Event(eventName));
}
export function clearSignedInUser() {
  window.localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(eventName));
}
export function markExplicitLogout() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(explicitLogoutKey, "true");
  clearSignedInUser();
}
export function hasExplicitLogout() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(explicitLogoutKey) === "true";
}
export const authChangeEvent = eventName;
