import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  email = '';
  password = '';
  errorMessage = '';

  login() {
    this.authService.login({ email: this.email, password: this.password });
  }
}
