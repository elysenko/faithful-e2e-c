import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { FlowRoute } from './flow-meta';

// `data.flow` is the single source of truth for the user-flow graph AND the runtime navbar.
// The colossus flow-graph extractor projects it directly (zero heuristics). Angular `data`
// is NOT inherited by child routes — flow is repeated on each child below.
export const routes: Routes = ([
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
    data: {
      flow: {
        flowId: 'login',
        node: 'login',
        entry: true,
        edgesTo: ['recipe-list', 'signup'],
        label: 'Login',
      },
    },
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/signup/signup.component').then((m) => m.SignupComponent),
    data: {
      flow: {
        flowId: 'signup',
        node: 'signup',
        edgesTo: ['recipe-list', 'login'],
        label: 'Sign up',
      },
    },
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/recipe-list/recipe-list.component').then(
            (m) => m.RecipeListComponent,
          ),
        data: {
          flow: {
            flowId: 'recipe-list',
            node: 'recipe-list',
            showInNavbar: true,
            label: 'Recipes',
            scope: 'all',
            edgesTo: ['recipe-detail', 'admin-settings', 'login'],
          },
        },
      },
      {
        path: 'recipes/:id',
        loadComponent: () =>
          import('./features/recipe-detail/recipe-detail.component').then(
            (m) => m.RecipeDetailComponent,
          ),
        data: {
          flow: {
            flowId: 'recipe-detail',
            node: 'recipe-detail',
            label: 'Recipe detail',
            edgesTo: ['recipe-list'],
          },
        },
      },
      {
        path: 'admin/settings',
        loadComponent: () =>
          import('./features/admin-settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
        canActivate: [adminGuard],
        data: {
          flow: {
            flowId: 'admin-settings',
            node: 'admin-settings',
            showInNavbar: true,
            label: 'Admin',
            scope: 'admin',
            edgesTo: ['recipe-list'],
          },
        },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    data: { flow: { flowId: 'not-found', node: 'not-found', terminal: true, label: 'Not found' } },
  },
] satisfies FlowRoute[]) as Routes;
