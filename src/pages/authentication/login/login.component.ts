import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = "";
  password: string = "";
  errorMessage: string = "";
  forgotPasswordMode: boolean = false; 

  constructor(private authService: AuthService, private router: Router){}

  toggleForgotPassword() {
    this.forgotPasswordMode = !this.forgotPasswordMode;
    this.password = ""; 
  }
  
  async login() {
    if (this.forgotPasswordMode) {
      if (!this.email) {
        Swal.fire({
          icon: 'warning',
          title: 'Informe o e-mail',
          text: 'Digite seu e-mail para redefinir a senha.',
          confirmButtonColor: '#f39c12',
        });
        return;
      }

      const response = await this.authService.resetPassword(this.email);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Verifique sua caixa de entrada',
          text: response.message,
          confirmButtonColor: '#28a745',
        });
        this.toggleForgotPassword(); // volta ao modo login
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: response.message,
          confirmButtonColor: '#dc3545',
        });
      }

    } else {
      const response = await this.authService.login(this.email, this.password);

      if (response.success) {
        this.router.navigate(['/dashboard']);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao fazer login',
          text: response.message || 'Ocorreu um erro ao tentar fazer login.',
          confirmButtonColor: '#dc3545',
        });
      }
    }
  }
}