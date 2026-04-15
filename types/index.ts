export type MenuItem = {
  name: string;
  type?: DrinkType;
  description?: string;
  price?: string;
  category?: string;
  tags?: string[];
};

export type AnalyzeMenuResponse = {
  items: MenuItem[];
};

export type DrinkType = "beer" | "wine" | "cocktail" | "sake" | "surprise";

export type Vibe =
  | "easy & smooth"
  | "sweet & fun"
  | "strong & bold"
  | "fresh & light";

export type QuizAnswers = {
  drink_type: DrinkType;
  vibe: Vibe;
  budget_max: number;
};

export type RecommendRequest = {
  quizAnswers: QuizAnswers;
  menuItems: MenuItem[];
};

export type RecommendationPick = {
  name: string;
  type: Exclude<DrinkType, "surprise"> | string;
  price: string;
  reason: string;
  vibe_match: string[];
  confidence: "high" | "medium" | "low";
};

export type RecommendResponse = {
  top_pick: RecommendationPick;
  backup_pick: RecommendationPick;
};
