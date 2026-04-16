import OpenAI from "openai";
import type { ResponseFormatTextJSONSchemaConfig } from "openai/resources/responses/responses";
import type { AnalyzeMenuResponse } from "@/types";

let openaiClient: OpenAI | null = null;

export const MENU_ANALYSIS_MODEL =
  process.env.MENU_ANALYSIS_MODEL || "gpt-5.4-mini";
export const MENU_ANALYSIS_FALLBACK_MODEL =
  process.env.MENU_ANALYSIS_FALLBACK_MODEL || "gpt-4.1-mini";

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  openaiClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openaiClient;
}

export const MENU_ANALYSIS_PROMPT = `
Extract alcohol menu items from this restaurant or bar menu image for Pour Decisions.

Rules:
- Include only valid alcoholic drinks: beer, wine, cocktails, sake.
- Do not include food, desserts, coffee, soda, water, or zero-proof drinks.
- Infer the drink type when it is obvious from the name or section.
- Keep prices exactly as written.
- Keep descriptions very short when present.
- Omit fields that are not visible or cannot be inferred safely.
`;

export const MENU_ANALYSIS_FORMAT: ResponseFormatTextJSONSchemaConfig = {
  type: "json_schema",
  name: "menu_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "type", "price", "description"],
          properties: {
            name: {
              type: "string",
            },
            type: {
              type: ["string", "null"],
              enum: ["beer", "wine", "cocktail", "sake", null],
            },
            price: {
              type: ["string", "null"],
            },
            description: {
              type: ["string", "null"],
            },
          },
        },
      },
    },
  },
};

export const RECOMMENDATION_PROMPT = `
You are Pour Decisions, an AI drink expert that helps users quickly decide what alcohol to order at a restaurant or bar.

Your job is to recommend the best drink confidently and simply.
You are not academic or technical.
You speak like a smart, confident friend who knows what to order.

Return only valid JSON with this shape:
{
  "top_pick": {
    "name": "string",
    "type": "string",
    "price": "string",
    "reason": "string",
    "vibe_match": ["string"],
    "confidence": "high"
  },
  "backup_pick": {
    "name": "string",
    "type": "string",
    "price": "string",
    "reason": "string",
    "vibe_match": ["string"],
    "confidence": "medium"
  }
}

Rules:
- Clean the menu and use only valid drinks.
- Remove drinks above budget_max.
- Prioritize quizAnswers.drink_type unless it is "surprise".
- Match vibes this way:
  - Easy & smooth means mellow, low bitterness, easy drinking.
  - Sweet & fun means fruity, sweeter, playful.
  - Strong & bold means high alcohol, intense, bitter or rich.
  - Fresh & light means crisp, refreshing, citrusy, clean.
  - Surprise means choose the best overall drink from the filtered menu.
- Choose one best pick and one backup pick from the provided menu items only.
- Avoid risky or polarizing picks unless the user vibe is strong & bold.
- Keep each reason to one sentence.
- Be confident. Do not say "you might like".
- No wine jargon unless it is obvious.
`;

export function parseJsonResponse<T>(content: string): T {
  const trimmed = content.trim();
  const json = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(json) as T;
}

export function isAnalyzeMenuResponse(
  value: unknown
): value is AnalyzeMenuResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const items = (value as { items?: unknown }).items;

  if (!Array.isArray(items)) {
    return false;
  }

  return items.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    return typeof (item as { name?: unknown }).name === "string";
  });
}
