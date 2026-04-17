import { NextResponse } from "next/server";
import { ADMIN_HISTORY_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.redirect(
    new URL("/admin/history", request.url),
    303
  );
  response.cookies.delete(ADMIN_HISTORY_COOKIE);

  return response;
}
