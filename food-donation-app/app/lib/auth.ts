export type UserRole = "admin" | "user";
export type AuthUserType = "individual" | "organization" | "business/restaurant";

export type AuthUser = {
  donorId: string;
  name?: string;
  role: UserRole;
  userType?: AuthUserType;
  token?: string;
};

const DONOR_ID_KEY = "donorId";
const DONOR_NAME_KEY = "donorName";
const DONOR_ROLE_KEY = "donorRole";
const DONOR_USER_TYPE_KEY = "donorUserType";
const DONOR_TOKEN_KEY = "donorToken";
const AUTH_CHANGE_EVENT = "auth-change";

const isBrowser = () => typeof window !== "undefined";

const normalizeUserRole = (role: string | null): UserRole =>
  role === "admin" ? "admin" : "user";

const normalizeUserType = (userType: string | null): AuthUserType =>
  userType === "organization" || userType === "business/restaurant"
    ? userType
    : "individual";

export const getStoredAuthUser = (): AuthUser | null => {
  if (!isBrowser()) {
    return null;
  }

  const donorId = localStorage.getItem(DONOR_ID_KEY);
  const token = localStorage.getItem(DONOR_TOKEN_KEY) || undefined;

  if (!donorId || !token) {
    if (
      donorId ||
      localStorage.getItem(DONOR_ROLE_KEY) ||
      localStorage.getItem(DONOR_NAME_KEY) ||
      localStorage.getItem(DONOR_USER_TYPE_KEY)
    ) {
      localStorage.removeItem(DONOR_ID_KEY);
      localStorage.removeItem(DONOR_NAME_KEY);
      localStorage.removeItem(DONOR_ROLE_KEY);
      localStorage.removeItem(DONOR_USER_TYPE_KEY);
      localStorage.removeItem(DONOR_TOKEN_KEY);
    }

    return null;
  }

  const name = localStorage.getItem(DONOR_NAME_KEY) || undefined;
  const role = normalizeUserRole(localStorage.getItem(DONOR_ROLE_KEY));
  const userType = normalizeUserType(localStorage.getItem(DONOR_USER_TYPE_KEY));

  return { donorId, name, role, userType, token };
};

export const persistAuthUser = (user: AuthUser) => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(DONOR_ID_KEY, user.donorId);
  localStorage.setItem(DONOR_ROLE_KEY, user.role);
  localStorage.setItem(DONOR_USER_TYPE_KEY, normalizeUserType(user.userType || null));

  if (user.name) {
    localStorage.setItem(DONOR_NAME_KEY, user.name);
  } else {
    localStorage.removeItem(DONOR_NAME_KEY);
  }

  if (user.token) {
    localStorage.setItem(DONOR_TOKEN_KEY, user.token);
  } else {
    localStorage.removeItem(DONOR_TOKEN_KEY);
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
  localStorage.removeItem(DONOR_USER_TYPE_KEY);
  localStorage.removeItem(DONOR_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const isAdminUser = (user: AuthUser | null) => user?.role === "admin";
export const getStoredAuthToken = () => getStoredAuthUser()?.token || null;
export const isAuthenticatedUser = (user: AuthUser | null) =>
  !!user?.donorId && !!user?.token;

export const AUTH_STORAGE_EVENT = AUTH_CHANGE_EVENT;
