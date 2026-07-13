import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // data-testid="app-ready" is the post-deploy render gate's readiness landmark.
  template: '<div data-testid="app-ready"><router-outlet /></div>',
})
export class AppComponent {}
