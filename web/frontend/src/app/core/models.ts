export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface Recipe {
  id: string;
  title: string;
  /** Newline-delimited list of ingredients. */
  ingredients: string;
  /** Newline-delimited list of preparation steps. */
  steps: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeInput {
  title: string;
  ingredients: string;
  steps: string;
}

export interface SystemSetting {
  key: string;
  /** Masked display value (mockup) — real values are never returned to the client. */
  value: string;
  configured: boolean;
  updatedAt: string;
}
