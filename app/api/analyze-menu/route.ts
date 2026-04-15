import { NextResponse } from "next/server";
import {
  MENU_ANALYSIS_PROMPT,
  openai,
  parseJsonResponse,
} from "@/lib/llms";
import type { AnalyzeMenuResponse } from "@/types";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
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

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: MENU_ANALYSIS_PROMPT },
            { type: "input_image", image_url: imageUrl, detail: "auto" },
          ],
        },
      ],
    });

    if (!response.output_text) {
      return errorResponse("No menu analysis returned.", 502);
    }

    const parsed = parseJsonResponse<AnalyzeMenuResponse>(
      response.output_text
    );

    if (!Array.isArray(parsed.items)) {
      return errorResponse("Menu analysis returned an invalid format.", 502);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to analyze menu:", error);
    return errorResponse("Failed to analyze menu.", 500);
  }
}
