import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * FaithfulC root shell. Chrome (brand header + nav) is provided by the
 * LayoutComponent that wraps the authenticated route tree. This root only hosts
 * the router outlet.
 * SMOKE_MARKER: FaithfulC
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- SMOKE_MARKER: FaithfulC -->
    <div data-testid="app-ready">
      <router-outlet />
    </div>
  `,
})
export class AppComponent {
  readonly brand = 'FaithfulC';
}
