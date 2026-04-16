import { NextResponse } from "next/server";
import {
  getOpenAIClient,
  isAnalyzeMenuResponse,
  MENU_ANALYSIS_FORMAT,
  MENU_ANALYSIS_FALLBACK_MODEL,
  MENU_ANALYSIS_MODEL,
  MENU_ANALYSIS_PROMPT,
  parseJsonResponse,
} from "@/lib/llms";
import type { AnalyzeMenuResponse } from "@/types";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MENU_ANALYSIS_MAX_OUTPUT_TOKENS = 2400;

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getErrorStatus(error: unknown) {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === "number" ? status : undefined;
}

function getReadableAnalyzeError(error: unknown) {
  const status = getErrorStatus(error);
  const message =
    typeof (error as { message?: unknown } | null)?.message === "string"
      ? (error as { message: string }).message
      : "";

  if (status === 401) {
    return {
      message: "OpenAI API key was rejected. Check OPENAI_API_KEY.",
      status,
    };
  }

  if (status === 403) {
    return {
      message: `OpenAI denied access to the menu scan model ${MENU_ANALYSIS_MODEL}.`,
      status,
    };
  }

  if (status === 429) {
    return {
      message: "OpenAI rate limited the menu scan. Try again in a moment.",
      status,
    };
  }

  if (status && status >= 400 && message) {
    return {
      message,
      status,
    };
  }

  if (message) {
    return {
      message,
      status: 500,
    };
  }

  return {
    message: "Failed to analyze menu.",
    status: 500,
  };
}

async function analyzeWithFastPath(imageUrl: string) {
  const response = await getOpenAIClient().responses.parse<AnalyzeMenuResponse>({
    model: MENU_ANALYSIS_MODEL,
    max_output_tokens: MENU_ANALYSIS_MAX_OUTPUT_TOKENS,
    text: {
      format: MENU_ANALYSIS_FORMAT,
    },
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: MENU_ANALYSIS_PROMPT },
          { type: "input_image", image_url: imageUrl, detail: "low" },
        ],
      },
    ],
  });

  if (!response.output_parsed) {
    throw new Error("No parsed menu analysis returned from fast path.");
  }

  return response.output_parsed;
}

async function analyzeWithFallback(imageUrl: string) {
  const response = await getOpenAIClient().responses.create({
    model: MENU_ANALYSIS_FALLBACK_MODEL,
    max_output_tokens: MENU_ANALYSIS_MAX_OUTPUT_TOKENS,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: MENU_ANALYSIS_PROMPT },
          { type: "input_image", image_url: imageUrl, detail: "low" },
        ],
      },
    ],
  });

  if (!response.output_text) {
    throw new Error("No menu analysis returned from fallback path.");
  }

  return parseJsonResponse<AnalyzeMenuResponse>(response.output_text);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return errorResponse("Missing image file in form field 'image'.");
    }

    if (!image.type.startsWith("image/")) {
      return errorResponse("Uploaded file must be an image.");
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return errorResponse("Image must be 10MB or smaller.");
    }

    const imageBase64 = Buffer.from(await image.arrayBuffer()).toString(
      "base64"
    );
    const imageUrl = `data:${image.type};base64,${imageBase64}`;

    let parsed: AnalyzeMenuResponse;

    try {
      parsed = await analyzeWithFastPath(imageUrl);
    } catch (fastPathError) {
      console.warn(
        "Fast menu analysis failed, using fallback model:",
        fastPathError
      );
      parsed = await analyzeWithFallback(imageUrl);
    }

    if (!isAnalyzeMenuResponse(parsed)) {
      return errorResponse("Menu analysis returned an invalid format.", 502);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to analyze menu:", error);
    const readableError = getReadableAnalyzeError(error);
    return errorResponse(readableError.message, readableError.status);
  }
}
