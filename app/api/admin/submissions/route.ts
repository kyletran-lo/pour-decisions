import { NextResponse } from "next/server";
import {
  getAdminTokenFromRequest,
  isAdminHistoryConfigured,
  isValidAdminToken,
} from "@/lib/admin-auth";
import {
  isSubmissionHistoryConfigured,
  listSubmissionHistory,
} from "@/lib/submission-history";

export const runtime = "nodejs";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  if (!isAdminHistoryConfigured() || !isSubmissionHistoryConfigured()) {
    return errorResponse("Admin history is not configured.", 503);
  }

  if (!isValidAdminToken(getAdminTokenFromRequest(request))) {
    return errorResponse("Unauthorized.", 401);
  }

  const submissions = await listSubmissionHistory();
  return NextResponse.json({ submissions });
}
