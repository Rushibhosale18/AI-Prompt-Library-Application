import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <nav class="navbar">
      <div class="nav-brand" routerLink="/prompts">
        <span class="brand-icon">✦</span>
        <span class="brand-text">PromptVault</span>
      </div>
      <div class="nav-links">
        <a routerLink="/prompts" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" id="nav-list">Browse</a>
        
        <ng-container *ngIf="authState$ | async as auth; else guest">
          <ng-container *ngIf="auth.authenticated; else guest">
            <a routerLink="/add-prompt" routerLinkActive="active" id="nav-add" class="btn-nav">+ New Prompt</a>
            <span class="user-greeting">Hi, {{ auth.username }}</span>
            <button (click)="logout()" class="btn-secondary logout-btn">Logout</button>
          </ng-container>
        </ng-container>

        <ng-template #guest>
          <a routerLink="/login" routerLinkActive="active" class="btn-secondary">Login</a>
        </ng-template>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="footer">
      <p>PromptVault &mdash; AI Image Generation Prompt Library &copy; 2025</p>
    </footer>
  `,
  styles: [`
    .user-greeting { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
    .logout-btn { padding: 0.3rem 0.6rem !important; font-size: 0.75rem !important; }
  `]
})
export class AppComponent {
  title = 'ai-prompt-library';
  authState$ = this.authService.authState;

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/prompts']);
    });
  }
}
