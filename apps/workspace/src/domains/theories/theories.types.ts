export type TheorySource = "ai_generated" | "user_created";

export type TheoryRecord = {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  isPrivate: boolean;
  source: TheorySource;
  category?: string;
  tags?: string[];
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type TheoryFormValues = {
  title: string;
  content: string;
  isPrivate: boolean;
  source: TheorySource;
  category: string;
  tags: string;
};
