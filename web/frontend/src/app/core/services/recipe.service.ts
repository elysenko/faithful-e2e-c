import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Recipe, RecipeInput } from '../models';
import { environment } from '../../../environments/environment';

/**
 * Recipe store backed by the /api/recipes endpoints. Loaded recipes live in the
 * `recipes` signal; components read via the same helpers as the mockup
 * (query/getById/favoriteCount) while the CRUD methods now return Observables
 * that update the signal on success.
 */
@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/recipes`;

  readonly recipes = signal<Recipe[]>([]);

  readonly favoriteCount = computed(() => this.recipes().filter((r) => r.favorite).length);

  /** GET /api/recipes — load the full set into the signal. */
  refresh(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.base).pipe(tap((list) => this.recipes.set(list)));
  }

  /** GET /api/recipes/:id — fetch a single recipe (used for deep links). */
  getOne(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.base}/${id}`);
  }

  /** Client-side filter mirroring GET /api/recipes?q=&favorite=true over loaded data. */
  query(q: string, favoritesOnly: boolean): Recipe[] {
    const term = q.trim().toLowerCase();
    return this.recipes()
      .filter((r) => (favoritesOnly ? r.favorite : true))
      .filter((r) => (term ? r.title.toLowerCase().includes(term) : true))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getById(id: string): Recipe | undefined {
    return this.recipes().find((r) => r.id === id);
  }

  create(input: RecipeInput): Observable<Recipe> {
    return this.http
      .post<Recipe>(this.base, input)
      .pipe(tap((created) => this.recipes.update((list) => [created, ...list])));
  }

  update(id: string, input: RecipeInput): Observable<Recipe> {
    return this.http
      .put<Recipe>(`${this.base}/${id}`, input)
      .pipe(tap((updated) => this.replace(updated)));
  }

  toggleFavorite(id: string): Observable<Recipe> {
    return this.http
      .patch<Recipe>(`${this.base}/${id}/favorite`, {})
      .pipe(tap((updated) => this.replace(updated)));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(tap(() => this.recipes.update((list) => list.filter((r) => r.id !== id))));
  }

  private replace(updated: Recipe): void {
    this.recipes.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }
}
