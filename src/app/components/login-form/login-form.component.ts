import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { DxTextBoxModule, DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-login-form',
  imports: [CommonModule, FormsModule, DxTextBoxModule, DxButtonModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  username = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  private loginService = inject(LoginService);
  private router = inject(Router);

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.loginService
        .login(
          { username: this.username, password: this.password },
          this.rememberMe
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/items']);
            this.loginService.logedIn.set(true);
          },
          error: (err) => {
            if (err.status === 400) {
              alert(err.error?.message || 'Invalid username or password.');
            } else {
              alert('Login failed. Please check your credentials.');
            }
          },
        });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
