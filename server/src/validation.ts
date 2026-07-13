import { z } from 'zod';

const nonEmpty = (label: string) =>
  z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

export const recipeSchema = z.object({
  title: nonEmpty('Title').max(200, 'Title is too long'),
  ingredients: nonEmpty('Ingredients'),
  steps: nonEmpty('Steps'),
});
export type RecipeInput = z.infer<typeof recipeSchema>;

export const credentialsSchema = z.object({
  username: nonEmpty('Username').max(60, 'Username is too long'),
  password: z
    .string({ required_error: 'Password is required', invalid_type_error: 'Password is required' })
    .min(1, 'Password is required'),
});
export type Credentials = z.infer<typeof credentialsSchema>;

export const favoriteSchema = z.object({
  favorite: z.boolean().optional(),
});

export const settingsPatchSchema = z
  .record(z.string(), z.string())
  .refine((obj) => Object.keys(obj).length > 0, { message: 'No settings provided' });
