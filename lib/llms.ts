import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

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
You extract alcohol menu data from restaurant or bar menu images for Pour Decisions.

Return only valid JSON with this shape:
{
  "items": [
    {
      "name": "string",
      "type": "beer | wine | cocktail | sake",
      "price": "string",
      "description": "string",
      "tags": ["string"]
    }
  ]
}

Rules:
- Include only valid alcoholic drinks: beer, wine, cocktails, sake.
- Do not include food, desserts, coffee, soda, water, or zero-proof drinks.
- Infer the drink type when it is obvious from the name or section.
- Keep prices exactly as written.
- Keep descriptions concise.
- Use tags for useful traits like sweet, citrusy, crisp, smooth, bold, fruity, bitter, rich, refreshing, beer, wine, cocktail, sake.
- Omit fields that are not visible or cannot be inferred safely.
`;

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
