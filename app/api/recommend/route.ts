import { NextResponse } from "next/server";
import {
  openai,
  parseJsonResponse,
  RECOMMENDATION_PROMPT,
} from "@/lib/llms";
import { isRecommendRequest } from "@/lib/session";
import type { RecommendResponse } from "@/types";

export const runtime = "nodejs";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (!isRecommendRequest(body)) {
      return errorResponse(
        "Request body must include quizAnswers and menuItems."
      );
    }

    if (body.menuItems.length === 0) {
      return errorResponse("menuItems must include at least one item.");
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: RECOMMENDATION_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify({
            quizAnswers: body.quizAnswers,
            menuItems: body.menuItems,
          }),
        },
      ],
    });

    if (!response.output_text) {
      return errorResponse("No recommendations returned.", 502);
    }

    const parsed = parseJsonResponse<RecommendResponse>(response.output_text);

    if (!Array.isArray(parsed.recommendations) || !parsed.summary) {
      return errorResponse("Recommendations returned an invalid format.", 502);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to recommend menu items:", error);
    return errorResponse("Failed to recommend menu items.", 500);
  }
}
