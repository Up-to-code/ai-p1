export const THEORY_CATEGORIES = [
  "strategy",
  "insight",
  "hypothesis",
  "lesson_learned",
  "research",
  "other",
] as const;

export type TheoryCategory = (typeof THEORY_CATEGORIES)[number];

export const THEORY_SOURCE_LABELS: Record<string, string> = {
  ai_generated: "AI",
  user_created: "Manual",
};

export const defaultTheoryFormValues = {
  title: "",
  content: "",
  isPrivate: true,
  source: "user_created" as const,
  category: "",
  tags: "",
};
