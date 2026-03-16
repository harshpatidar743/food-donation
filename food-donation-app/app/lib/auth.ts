export type UserRole = "admin" | "individual" | "organization" | "business/restaurant";

export type AuthUser = {
  donorId: string;
  name?: string;
  role: UserRole;
};

const DONOR_ID_KEY = "donorId";
const DONOR_NAME_KEY = "donorName";
const DONOR_ROLE_KEY = "donorRole";
const AUTH_CHANGE_EVENT = "auth-change";

const isBrowser = () => typeof window !== "undefined";

const normalizeUserRole = (role: string | null): UserRole => {
  switch (role) {
    case "admin":
      return "admin";
    case "organization":
    case "ngo":
      return "organization";
    case "business/restaurant":
    case "business":
    case "restaurant":
      return "business/restaurant";
    default:
      return "individual";
  }
};

export const getStoredAuthUser = (): AuthUser | null => {
  if (!isBrowser()) {
    return null;
  }

  const donorId = localStorage.getItem(DONOR_ID_KEY);

  if (!donorId) {
    return null;
  }

  const name = localStorage.getItem(DONOR_NAME_KEY) || undefined;
  const role = normalizeUserRole(localStorage.getItem(DONOR_ROLE_KEY));

  return { donorId, name, role };
};

export const persistAuthUser = (user: AuthUser) => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(DONOR_ID_KEY, user.donorId);
  localStorage.setItem(DONOR_ROLE_KEY, user.role);

  if (user.name) {
    localStorage.setItem(DONOR_NAME_KEY, user.name);
  } else {
    localStorage.removeItem(DONOR_NAME_KEY);
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearStoredAuthUser = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(DONOR_ID_KEY);
  localStorage.removeItem(DONOR_NAME_KEY);
  localStorage.removeItem(DONOR_ROLE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const isAdminUser = (user: AuthUser | null) => user?.role === "admin";

export const AUTH_STORAGE_EVENT = AUTH_CHANGE_EVENT;
