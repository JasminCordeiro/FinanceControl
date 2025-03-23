import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [FormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  email: string = "";
  password: string = "";
  errorMessage: string = "";
  successMessage: string = "";

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    try {
      const response = await this.authService.register(this.email, this.password);
  
      if (response?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado com sucesso!',
          text: response.message,
          confirmButtonColor: '#28a745',
        });
        this.router.navigate(["/login"]);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Não foi possível cadastrar',
          text: response.message || 'Verifique os dados e tente novamente.',
          confirmButtonColor: '#f39c12',
        });
      }
  
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no cadastro',
        text: error.message || 'Ocorreu um erro inesperado.',
        confirmButtonColor: '#dc3545',
      });
    }
  }
}