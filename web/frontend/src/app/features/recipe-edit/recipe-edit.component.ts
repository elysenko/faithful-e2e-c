import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeFormComponent } from '../../shared/recipe-form/recipe-form.component';
import { Recipe, RecipeInput } from '../../core/models';

/**
 * Edit an existing recipe. Loads the current values (→ GET /api/recipes/:id),
 * pre-fills the shared form, and on save (→ PATCH /api/recipes/:id) returns to
 * the detail view. The form blocks save while any required field is empty.
 */
@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, RecipeFormComponent],
  templateUrl: './recipe-edit.component.html',
  styleUrl: './recipe-edit.component.css',
})
export class RecipeEditComponent implements OnInit {
  // Data contract: mock recipes live in an array signal so the pipeline can
  // clear this and wire GET /api/recipes/:id in ngOnInit().
  readonly recipes = signal<Recipe[]>([
    {
      id: 'r1',
      title: 'Weeknight Tomato Basil Pasta',
      isFavorite: true,
      ingredients: '400g spaghetti\n2 cups cherry tomatoes, halved\n3 cloves garlic, sliced\n1/4 cup olive oil\nHandful fresh basil\nSalt & black pepper\nParmesan, to serve',
      steps: '1. Boil the spaghetti in well-salted water until al dente.\n2. Warm the olive oil and gently cook the garlic until fragrant.\n3. Add the tomatoes and cook until they burst and soften.\n4. Toss the drained pasta with the sauce and a splash of pasta water.\n5. Tear in the basil, finish with Parmesan and serve.',
    },
    {
      id: 'r2',
      title: 'Grandma’s Cinnamon Rolls',
      isFavorite: true,
      ingredients: '3 1/2 cups flour\n1 cup warm milk\n1/4 cup sugar\n2 tsp active dry yeast\n1/3 cup butter, softened\n1 egg\nFilling: butter, brown sugar, cinnamon\nGlaze: powdered sugar, milk',
      steps: '1. Bloom the yeast in warm milk with a pinch of sugar.\n2. Mix in sugar, butter, egg and flour; knead into a soft dough.\n3. Let rise until doubled, about 1 hour.\n4. Roll out, spread filling, roll up and slice.\n5. Prove 30 min, then bake at 180°C for 22 minutes. Glaze warm.',
    },
    {
      id: 'r3',
      title: 'Smoky Black Bean Tacos',
      isFavorite: false,
      ingredients: '2 cans black beans, drained\n1 tsp smoked paprika\n1 tsp cumin\n1 onion, diced\n8 corn tortillas\nAvocado, lime, cilantro\nHot sauce to taste',
      steps: '1. Sauté the onion until soft.\n2. Add beans, paprika and cumin with a splash of water; simmer 10 min.\n3. Lightly char the tortillas.\n4. Fill with beans, top with avocado, cilantro and a squeeze of lime.',
    },
    {
      id: 'r4',
      title: 'Lemon Herb Roast Chicken',
      isFavorite: true,
      ingredients: '1 whole chicken (1.5kg)\n1 lemon, halved\n4 sprigs thyme\n3 tbsp butter, softened\n4 cloves garlic\nSalt & pepper',
      steps: '1. Heat oven to 200°C.\n2. Rub the chicken with butter, salt and pepper; stuff with lemon, garlic and thyme.\n3. Roast 70–80 minutes, basting once, until juices run clear.\n4. Rest 15 minutes before carving.',
    },
    {
      id: 'r5',
      title: 'Creamy Mushroom Risotto',
      isFavorite: false,
      ingredients: '1 1/2 cups arborio rice\n400g mushrooms, sliced\n1 onion, finely chopped\n1L warm stock\n1/2 cup white wine\nParmesan, butter, parsley',
      steps: '1. Sauté mushrooms until golden; set aside.\n2. Soften the onion, add rice and toast 1 minute.\n3. Deglaze with wine, then add stock a ladle at a time, stirring.\n4. When creamy and al dente, stir in mushrooms, butter and Parmesan.',
    },
    {
      id: 'r6',
      title: 'Overnight Oats with Berries',
      isFavorite: false,
      ingredients: '1 cup rolled oats\n1 cup milk of choice\n1/2 cup yogurt\n1 tbsp chia seeds\n1 tbsp maple syrup\nMixed berries',
      steps: '1. Stir together oats, milk, yogurt, chia and maple syrup.\n2. Cover and refrigerate overnight.\n3. In the morning, top with berries and enjoy cold.',
    },
    {
      id: 'r7',
      title: 'Thai Green Curry',
      isFavorite: false,
      ingredients: '3 tbsp green curry paste\n1 can coconut milk\n400g chicken or tofu\n1 zucchini, sliced\n1 red pepper\nFish sauce, lime, basil',
      steps: '1. Fry the curry paste until fragrant.\n2. Add coconut milk and bring to a gentle simmer.\n3. Add protein and vegetables; cook until tender.\n4. Season with fish sauce and lime, finish with Thai basil.',
    },
    {
      id: 'r8',
      title: 'Chewy Chocolate Chip Cookies',
      isFavorite: true,
      ingredients: '2 1/4 cups flour\n1 cup butter, softened\n3/4 cup brown sugar\n1/2 cup white sugar\n2 eggs\n1 tsp vanilla\n1 tsp baking soda\n2 cups chocolate chips',
      steps: '1. Cream butter and sugars until fluffy.\n2. Beat in eggs and vanilla.\n3. Fold in flour and baking soda, then the chocolate chips.\n4. Scoop onto trays and bake at 180°C for 11 minutes until edges set.',
    },
  ]);

  readonly id = signal<string>('');
  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly recipe = computed<Recipe | undefined>(() =>
    this.recipes().find((r) => r.id === this.id()),
  );
  readonly formValue = computed<RecipeInput | null>(() => {
    const r = this.recipe();
    return r ? { title: r.title, ingredients: r.ingredients, steps: r.steps } : null;
  });

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.id.set(this.route.snapshot.paramMap.get('id') ?? '');
  }

  onSave(_input: RecipeInput): void {
    // Mockup: simulate PATCH /api/recipes/:id then return to the detail view.
    this.submitting.set(true);
    this.serverError.set(null);
    this.router.navigate(['/recipes', this.id()]);
  }

  onCancel(): void {
    this.router.navigate(['/recipes', this.id()]);
  }
}
