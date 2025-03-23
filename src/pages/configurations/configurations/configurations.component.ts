import { Component } from '@angular/core';
import { CategoryManagerComponent } from '../../../app/layout/category-manager/category-manager.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [CategoryManagerComponent, FormsModule, CommonModule],
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.scss'
})
export class ConfigurationsComponent {

  userEmail: string | null = null;
  editEmail: boolean = false;
  editPassword: boolean = false;

  newPassword: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserEmail();
  }

  async loadUserEmail() {
    this.userEmail = await this.authService.getEmail();
  }

  enableEditEmail() {
    this.editEmail = true;
  }

  enableEditPassword() {
    this.editPassword = true;
  }

  async changePassword() {
    if (!this.isPasswordValid(this.newPassword)) {
      this.showAlert('warning', 'Senha inválida', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const result = await this.authService.updatePassword(this.newPassword);
      if (result.message) {
        this.showAlert('success', 'Sucesso!', result.message);
        this.resetPasswordForm();
      } else {
        this.showAlert('error', 'Falha na atualização!', result.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar a senha:', error);
      this.showAlert('error', 'Erro inesperado', 'Erro ao tentar atualizar a senha.');
    }
  }

  async changeEmail() {
    if (!this.userEmail) return;

    const result = await this.authService.updateEmail(this.userEmail);

    if (result.success) {
      this.showAlert('success', 'E-mail atualizado', result.message);
      this.editEmail = false;
    } else {
      this.showAlert('error', 'Erro ao atualizar e-mail', result.message);
    }
  }

  private isPasswordValid(password: string): boolean {
    return !!password && password.length >= 6;
  }
  
  private resetPasswordForm() {
    this.newPassword = '';
    this.editPassword = false;
  }

  private showAlert(icon: 'success' | 'error' | 'warning', title: string, text: string) {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: icon === 'success' ? '#28a745' : icon === 'error' ? '#dc3545' : '#ffc107',
    });
  }
}
