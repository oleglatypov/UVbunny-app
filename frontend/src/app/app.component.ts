import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  title = 'UVbunny';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Handle redirect result after Google sign-in
    this.authService.handleRedirectResult().subscribe({
      next: (user) => {
        if (user) {
          // User successfully signed in, navigate to dashboard
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error handling redirect result:', error);
      },
    });
  }
}

