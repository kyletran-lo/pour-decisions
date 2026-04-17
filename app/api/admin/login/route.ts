import { NextResponse } from "next/server";
import {
  ADMIN_HISTORY_COOKIE,
  isAdminHistoryConfigured,
  isValidAdminToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = formData.get("token");
  const redirectUrl = new URL("/admin/history", request.url);

  if (
    !isAdminHistoryConfigured() ||
    typeof token !== "string" ||
    !isValidAdminToken(token)
  ) {
    redirectUrl.searchParams.set("error", "1");
    return NextResponse.redirect(redirectUrl, 303);
  }

  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set(ADMIN_HISTORY_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
