import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/layout.component';
import { FlowRoute } from './flow-meta';

// `data.flow` is the single source of truth for the user-flow graph AND the runtime navbar.
// Login/signup render standalone; every authenticated screen is wrapped by LayoutComponent.
// Recipe list state (search term + favorite filter) is deep-linkable via ?q= and ?favorite=1
// query params so automated verification can land on a filtered list directly.
const ADMIN = ['admin'] as const;

export const routes: Routes = ([
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
    data: { flow: { flowId: 'login', node: 'login', entry: true, edgesTo: ['recipes', 'signup'], label: 'Login' } },
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/signup/signup.component').then((m) => m.SignupComponent),
    data: { flow: { flowId: 'signup', node: 'signup', edgesTo: ['recipes', 'login'], label: 'Sign up' } },
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/recipe-list/recipe-list.component').then((m) => m.RecipeListComponent),
        data: { flow: { flowId: 'recipes', node: 'recipes', showInNavbar: true, label: 'My Recipes', scope: 'all', edgesTo: ['recipe-detail', 'recipe-new'] } },
      },
      {
        path: 'recipes/new',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/recipe-new/recipe-new.component').then((m) => m.RecipeNewComponent),
        data: { flow: { flowId: 'recipe-new', node: 'recipe-new', showInNavbar: true, label: 'Add Recipe', scope: 'all', edgesTo: ['recipes'] } },
      },
      {
        path: 'recipes/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/recipe-detail/recipe-detail.component').then((m) => m.RecipeDetailComponent),
        data: { flow: { flowId: 'recipe-detail', node: 'recipe-detail', label: 'Recipe', edgesTo: ['recipes', 'recipe-edit'] } },
      },
      {
        path: 'recipes/:id/edit',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/recipe-edit/recipe-edit.component').then((m) => m.RecipeEditComponent),
        data: { flow: { flowId: 'recipe-edit', node: 'recipe-edit', label: 'Edit Recipe', edgesTo: ['recipe-detail', 'recipes'] } },
      },
      {
        path: 'admin/settings',
        canActivate: [authGuard, roleGuard],
        loadComponent: () =>
          import('./features/admin-settings/admin-settings.component').then((m) => m.AdminSettingsComponent),
        data: { roles: ADMIN, flow: { flowId: 'admin-settings', node: 'admin-settings', showInNavbar: true, label: 'Settings', scope: 'admin', edgesTo: ['recipes'] } },
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
        data: { flow: { flowId: 'not-found', node: 'not-found', terminal: true, label: 'Not found', edgesTo: ['recipes'] } },
      },
    ],
  },
] satisfies FlowRoute[]) as Routes;
