import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../auth/middleware';
import { NotFoundError } from '../middleware/errors';
import { favoriteSchema, recipeSchema } from '../validation';

interface RecipeRow {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

function toRecipe(row: RecipeRow) {
  return {
    id: row.id,
    title: row.title,
    ingredients: row.ingredients,
    steps: row.steps,
    favorite: row.favorite,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

const SELECT = 'id, title, ingredients, steps, favorite, created_at, updated_at';

export const recipesRouter = Router();
recipesRouter.use(requireAuth);

// GET /api/recipes?q=&favorite=true
recipesRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const favoritesOnly = req.query.favorite === 'true' || req.query.favorite === '1';

    const clauses = ['user_id = $1'];
    const params: unknown[] = [userId];
    if (q) {
      params.push(`%${q}%`);
      clauses.push(`lower(title) LIKE lower($${params.length})`);
    }
    if (favoritesOnly) clauses.push('favorite = true');

    const { rows } = await query<RecipeRow>(
      `SELECT ${SELECT} FROM recipes WHERE ${clauses.join(' AND ')} ORDER BY updated_at DESC`,
      params,
    );
    res.json(rows.map(toRecipe));
  } catch (err) {
    next(err);
  }
});

// POST /api/recipes
recipesRouter.post('/', async (req, res, next) => {
  try {
    const input = recipeSchema.parse(req.body);
    const { rows } = await query<RecipeRow>(
      `INSERT INTO recipes (user_id, title, ingredients, steps)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT}`,
      [req.user!.id, input.title, input.ingredients, input.steps],
    );
    res.status(201).json(toRecipe(rows[0]));
  } catch (err) {
    next(err);
  }
});

// GET /api/recipes/:id
recipesRouter.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query<RecipeRow>(
      `SELECT ${SELECT} FROM recipes WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user!.id],
    );
    if (rows.length === 0) throw new NotFoundError('Recipe not found');
    res.json(toRecipe(rows[0]));
  } catch (err) {
    next(err);
  }
});

// PUT /api/recipes/:id
recipesRouter.put('/:id', async (req, res, next) => {
  try {
    const input = recipeSchema.parse(req.body);
    const { rows } = await query<RecipeRow>(
      `UPDATE recipes
         SET title = $1, ingredients = $2, steps = $3, updated_at = now()
       WHERE id = $4 AND user_id = $5
       RETURNING ${SELECT}`,
      [input.title, input.ingredients, input.steps, req.params.id, req.user!.id],
    );
    if (rows.length === 0) throw new NotFoundError('Recipe not found');
    res.json(toRecipe(rows[0]));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/recipes/:id/favorite — set explicit value or toggle when omitted.
recipesRouter.patch('/:id/favorite', async (req, res, next) => {
  try {
    const { favorite } = favoriteSchema.parse(req.body ?? {});
    const assignment =
      typeof favorite === 'boolean' ? 'favorite = $3' : 'favorite = NOT favorite';
    const params: unknown[] = [req.params.id, req.user!.id];
    if (typeof favorite === 'boolean') params.push(favorite);
    const { rows } = await query<RecipeRow>(
      `UPDATE recipes SET ${assignment}, updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING ${SELECT}`,
      params,
    );
    if (rows.length === 0) throw new NotFoundError('Recipe not found');
    res.json(toRecipe(rows[0]));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/recipes/:id
recipesRouter.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM recipes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id],
    );
    if (!rowCount) throw new NotFoundError('Recipe not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
