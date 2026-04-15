export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  tags?: string[];
};

export type AnalyzeMenuResponse = {
  items: MenuItem[];
};

export type QuizAnswers = {
  mood?: string;
  flavorPreferences?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  budget?: string;
  occasion?: string;
  additionalNotes?: string;
  [key: string]: unknown;
};

export type RecommendRequest = {
  quizAnswers: QuizAnswers;
  menuItems: MenuItem[];
};

export type RecommendedItem = MenuItem & {
  reason: string;
  matchScore?: number;
};

export type RecommendResponse = {
  recommendations: RecommendedItem[];
  summary: string;
};
