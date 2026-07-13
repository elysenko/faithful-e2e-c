import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recipe, RecipeCard, RecipeInput } from '../models';
import { AuthService } from './auth.service';

/**
 * FaithfulC recipe data client. Talks to the live NestJS REST API at
 * `${apiUrl}/recipes/*` for every read and mutation:
 *
 *   GET    /api/recipes?q=&favorite=1   list cards (owned)
 *   GET    /api/recipes/:id             full detail
 *   POST   /api/recipes                 create
 *   PATCH  /api/recipes/:id             update
 *   PATCH  /api/recipes/:id/favorite    toggle favorite
 *   DELETE /api/recipes/:id             delete
 *
 * The JWT is attached by the global auth interceptor. When the reviewer enters
 * offline "Demo Mode" (see AuthService.demoLogin), the same methods serve an
 * in-memory sample box so the authenticated UI stays browsable without a
 * backend — real logins always hit the live service.
 */
@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly base = `${environment.apiUrl}/recipes`;

  /** In-memory sample box used only in offline Demo Mode. */
  private demoStore: Recipe[] = SAMPLE_RECIPES.map((r) => ({ ...r }));

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** List the signed-in cook's recipes as cards, optionally filtered. */
  list(q?: string, favorite?: boolean): Observable<RecipeCard[]> {
    if (this.auth.isDemo()) {
      const term = (q ?? '').trim().toLowerCase();
      const cards = this.demoStore
        .filter((r) => (favorite ? r.isFavorite : true))
        .filter((r) => (term ? r.title.toLowerCase().includes(term) : true))
        .map(({ id, title, isFavorite }) => ({ id, title, isFavorite }));
      return of(cards);
    }

    let params = new HttpParams();
    if (q && q.trim()) params = params.set('q', q.trim());
    if (favorite) params = params.set('favorite', '1');
    return this.http.get<RecipeCard[]>(this.base, { params });
  }

  /** Full detail for one owned recipe (404 → error). */
  get(id: string): Observable<Recipe> {
    if (this.auth.isDemo()) {
      const found = this.demoStore.find((r) => r.id === id);
      return found
        ? of({ ...found })
        : throwNotFound();
    }
    return this.http.get<Recipe>(`${this.base}/${id}`);
  }

  create(input: RecipeInput): Observable<Recipe> {
    if (this.auth.isDemo()) {
      const created: Recipe = {
        id: `demo-${this.demoStore.length + 1}-${input.title.length}`,
        title: input.title,
        ingredients: input.ingredients,
        steps: input.steps,
        isFavorite: false,
      };
      this.demoStore = [created, ...this.demoStore];
      return of({ ...created });
    }
    return this.http.post<Recipe>(this.base, input);
  }

  update(id: string, input: RecipeInput): Observable<Recipe> {
    if (this.auth.isDemo()) {
      this.demoStore = this.demoStore.map((r) => (r.id === id ? { ...r, ...input } : r));
      const updated = this.demoStore.find((r) => r.id === id);
      return updated ? of({ ...updated }) : throwNotFound();
    }
    return this.http.patch<Recipe>(`${this.base}/${id}`, input);
  }

  /** Toggle the favorite flag; resolves to the new `{ id, isFavorite }` state. */
  toggleFavorite(id: string): Observable<{ id: string; isFavorite: boolean }> {
    if (this.auth.isDemo()) {
      let next = false;
      this.demoStore = this.demoStore.map((r) => {
        if (r.id !== id) return r;
        next = !r.isFavorite;
        return { ...r, isFavorite: next };
      });
      return of({ id, isFavorite: next });
    }
    return this.http.patch<{ id: string; isFavorite: boolean }>(
      `${this.base}/${id}/favorite`,
      {},
    );
  }

  remove(id: string): Observable<void> {
    if (this.auth.isDemo()) {
      this.demoStore = this.demoStore.filter((r) => r.id !== id);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

function throwNotFound(): Observable<never> {
  return new Observable((subscriber) =>
    subscriber.error({ status: 404, error: { message: 'Recipe not found' } }),
  );
}

/** Sample recipe box surfaced only in offline Demo Mode. */
const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Weeknight Tomato Basil Pasta',
    isFavorite: true,
    ingredients:
      '400g spaghetti\n2 cups cherry tomatoes, halved\n3 cloves garlic, sliced\n1/4 cup olive oil\nHandful fresh basil\nSalt & black pepper\nParmesan, to serve',
    steps:
      '1. Boil the spaghetti in well-salted water until al dente.\n2. Meanwhile, warm the olive oil and gently cook the garlic until fragrant.\n3. Add the tomatoes and a pinch of salt; cook until they burst and soften.\n4. Toss the drained pasta with the sauce and a splash of pasta water.\n5. Tear in the basil, finish with Parmesan and serve.',
  },
  {
    id: 'r2',
    title: 'Grandma’s Cinnamon Rolls',
    isFavorite: true,
    ingredients:
      '3 1/2 cups flour\n1 cup warm milk\n1/4 cup sugar\n2 tsp active dry yeast\n1/3 cup butter, softened\n1 egg\nFilling: butter, brown sugar, cinnamon\nGlaze: powdered sugar, milk',
    steps:
      '1. Bloom the yeast in warm milk with a pinch of sugar.\n2. Mix in sugar, butter, egg and flour; knead into a soft dough.\n3. Let rise until doubled, about 1 hour.\n4. Roll out, spread filling, roll up and slice.\n5. Prove 30 min, then bake at 180°C for 22 minutes. Glaze warm.',
  },
  {
    id: 'r3',
    title: 'Smoky Black Bean Tacos',
    isFavorite: false,
    ingredients:
      '2 cans black beans, drained\n1 tsp smoked paprika\n1 tsp cumin\n1 onion, diced\n8 corn tortillas\nAvocado, lime, cilantro\nHot sauce to taste',
    steps:
      '1. Sauté the onion until soft.\n2. Add beans, paprika and cumin with a splash of water; simmer 10 min.\n3. Lightly char the tortillas.\n4. Fill with beans, top with avocado, cilantro and a squeeze of lime.',
  },
  {
    id: 'r4',
    title: 'Lemon Herb Roast Chicken',
    isFavorite: true,
    ingredients:
      '1 whole chicken (1.5kg)\n1 lemon, halved\n4 sprigs thyme\n3 tbsp butter, softened\n4 cloves garlic\nSalt & pepper',
    steps:
      '1. Heat oven to 200°C.\n2. Rub the chicken with butter, salt and pepper; stuff with lemon, garlic and thyme.\n3. Roast 70–80 minutes, basting once, until juices run clear.\n4. Rest 15 minutes before carving.',
  },
  {
    id: 'r5',
    title: 'Creamy Mushroom Risotto',
    isFavorite: false,
    ingredients:
      '1 1/2 cups arborio rice\n400g mushrooms, sliced\n1 onion, finely chopped\n1L warm stock\n1/2 cup white wine\nParmesan, butter, parsley',
    steps:
      '1. Sauté mushrooms until golden; set aside.\n2. Soften the onion, add rice and toast 1 minute.\n3. Deglaze with wine, then add stock a ladle at a time, stirring.\n4. When creamy and al dente, stir in mushrooms, butter and Parmesan.',
  },
  {
    id: 'r6',
    title: 'Overnight Oats with Berries',
    isFavorite: false,
    ingredients:
      '1 cup rolled oats\n1 cup milk of choice\n1/2 cup yogurt\n1 tbsp chia seeds\n1 tbsp maple syrup\nMixed berries',
    steps:
      '1. Stir together oats, milk, yogurt, chia and maple syrup.\n2. Cover and refrigerate overnight.\n3. In the morning, top with berries and enjoy cold.',
  },
  {
    id: 'r7',
    title: 'Thai Green Curry',
    isFavorite: false,
    ingredients:
      '3 tbsp green curry paste\n1 can coconut milk\n400g chicken or tofu\n1 zucchini, sliced\n1 red pepper\nFish sauce, lime, basil',
    steps:
      '1. Fry the curry paste until fragrant.\n2. Add coconut milk and bring to a gentle simmer.\n3. Add protein and vegetables; cook until tender.\n4. Season with fish sauce and lime, finish with Thai basil.',
  },
  {
    id: 'r8',
    title: 'Chewy Chocolate Chip Cookies',
    isFavorite: true,
    ingredients:
      '2 1/4 cups flour\n1 cup butter, softened\n3/4 cup brown sugar\n1/2 cup white sugar\n2 eggs\n1 tsp vanilla\n1 tsp baking soda\n2 cups chocolate chips',
    steps:
      '1. Cream butter and sugars until fluffy.\n2. Beat in eggs and vanilla.\n3. Fold in flour and baking soda, then the chocolate chips.\n4. Scoop onto trays and bake at 180°C for 11 minutes until edges set.',
  },
];
