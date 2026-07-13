// FaithfulC domain models — mirror the backend Prisma schema / surface contract.
// Dates are ISO-8601 strings from the API.

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  createdAt?: string;
}

/** Full recipe detail (GET /api/recipes/:id). */
export interface Recipe {
  id: string;
  userId?: string;
  title: string;
  ingredients: string;
  steps: string;
  isFavorite: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** List card projection (GET /api/recipes). */
export interface RecipeCard {
  id: string;
  title: string;
  isFavorite: boolean;
}

/** Payload for create / update. */
export interface RecipeInput {
  title: string;
  ingredients: string;
  steps: string;
}

/** A backing service row from GET /api/admin/settings (masked value, configured flag). */
export interface AdminSetting {
  key: string;
  service: string;
  label: string;
  value: string;
  configured: boolean;
}

export interface AuthResponse {
  access_token?: string;
  token?: string;
  user: User;
}
