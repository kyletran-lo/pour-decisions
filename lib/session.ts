import type { MenuItem, QuizAnswers, RecommendRequest } from "@/types";

export function isMenuItem(value: unknown): value is MenuItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<MenuItem>;
  return typeof item.name === "string" && item.name.trim().length > 0;
}

export function isQuizAnswers(value: unknown): value is QuizAnswers {
  return !!value && typeof value === "object" && !Array.isArray(value);
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
