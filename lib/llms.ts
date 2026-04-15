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
You extract structured menu data from restaurant menu images.

Return only valid JSON with this shape:
{
  "items": [
    {
      "name": "string",
      "description": "string",
      "price": "string",
      "category": "string",
      "tags": ["string"]
    }
  ]
}

Rules:
- Include every readable food or drink item.
- Keep prices exactly as written.
- Keep descriptions concise.
- Use tags for useful traits like spicy, vegetarian, vegan, gluten-free, sweet, savory, cocktail, beer, wine, non-alcoholic, appetizer, entree, dessert.
- Omit fields that are not visible or cannot be inferred safely.
`;

export const RECOMMENDATION_PROMPT = `
You recommend restaurant menu items based on user quiz answers.

Return only valid JSON with this shape:
{
  "recommendations": [
    {
      "name": "string",
      "description": "string",
      "price": "string",
      "category": "string",
      "tags": ["string"],
      "reason": "string",
      "matchScore": 0
    }
  ],
  "summary": "string"
}

Rules:
- Recommend up to 5 items from the provided menu items only.
- Respect allergies and dietary restrictions.
- Make reasons short, specific, and useful.
- Use matchScore as a whole number from 0 to 100.
- Omit unknown item fields.
`;

export function parseJsonResponse<T>(content: string): T {
  const trimmed = content.trim();
  const json = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(json) as T;
}
