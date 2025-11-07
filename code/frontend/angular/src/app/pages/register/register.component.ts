import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.register({
        username: this.registerForm.value.username!,
        password: this.registerForm.value.password!
      }).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.isSubmitting = false;
          // Redirect to login after 2 seconds
          setTimeout(() => this.goToLogin(), 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Registration failed. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  goToLogin() {
    // Navigate to login page
    window.location.href = '/';
  }
}