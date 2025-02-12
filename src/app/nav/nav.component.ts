import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, NgIf, MatIconModule, MatMenuModule, MatButtonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})

export class NavComponent {
  isAuthenticated: boolean
  userClaims!: any
  authService = inject(AuthService);
  router = inject(Router);
  constructor() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userClaims = this.authService.userClaims;

    this.authService.authStatus$.subscribe(status => {
      this.isAuthenticated = status;
    });
  } 

  logout(){
    localStorage.clear();
    this.router.navigate(['login'])
    this.isAuthenticated = false
  }
}
