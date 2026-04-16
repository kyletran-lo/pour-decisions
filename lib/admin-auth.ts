import { timingSafeEqual } from "crypto";

export const ADMIN_HISTORY_COOKIE = "pour-decisions-admin";

type CookieStore = {
  get(name: string): { value: string } | undefined;
};

function getAdminToken() {
  return process.env.ADMIN_HISTORY_TOKEN?.trim() ?? "";
}

export function isAdminHistoryConfigured() {
  return getAdminToken().length > 0;
}

export function isValidAdminToken(token: string | null | undefined) {
  const expectedToken = getAdminToken();

  if (!expectedToken || !token) {
    return false;
  }

  const expected = Buffer.from(expectedToken);
  const received = Buffer.from(token);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function getAdminTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return (
    request.headers.get("x-admin-token") ??
    getCookieValue(request.headers.get("cookie"), ADMIN_HISTORY_COOKIE)
  );
}

export function hasAdminCookie(cookieStore: CookieStore) {
  return isValidAdminToken(cookieStore.get(ADMIN_HISTORY_COOKIE)?.value);
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}
