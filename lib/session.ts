import type {
  DrinkType,
  MenuItem,
  QuizAnswers,
  RecommendRequest,
  Vibe,
} from "@/types";

const drinkTypes = new Set<DrinkType>([
  "beer",
  "wine",
  "cocktail",
  "sake",
  "surprise",
]);

const vibes = new Set<Vibe>([
  "easy & smooth",
  "sweet & fun",
  "strong & bold",
  "fresh & light",
  "surprise",
]);

export function isMenuItem(value: unknown): value is MenuItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<MenuItem>;
  return typeof item.name === "string" && item.name.trim().length > 0;
}

export function isQuizAnswers(value: unknown): value is QuizAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const answers = value as Partial<QuizAnswers>;
  return (
    typeof answers.drink_type === "string" &&
    drinkTypes.has(answers.drink_type as DrinkType) &&
    (typeof answers.drink_category === "undefined" ||
      typeof answers.drink_category === "string") &&
    typeof answers.vibe === "string" &&
    vibes.has(answers.vibe as Vibe) &&
    typeof answers.budget_max === "number" &&
    Number.isFinite(answers.budget_max) &&
    answers.budget_max > 0
  );
}

export function isRecommendRequest(value: unknown): value is RecommendRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Partial<RecommendRequest>;
  return (
    isQuizAnswers(body.quizAnswers) &&
    Array.isArray(body.menuItems) &&
    body.menuItems.every(isMenuItem)
  );
}
