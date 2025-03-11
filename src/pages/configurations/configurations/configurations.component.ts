import { Component } from '@angular/core';
import { CategoryManagerComponent } from '../../../app/layout/category-manager/category-manager.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configurations',
  imports: [CategoryManagerComponent,FormsModule, CommonModule],
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.scss'
})
export class ConfigurationsComponent {

  userEmail: string | null = null;
  editEmail: boolean = false;
  editPassword: boolean = false;

  newPassword: string = '';

  constructor(private authService: AuthService){
  }

  ngOnInit() {
    this.loadUserEmail();
  }

  async loadUserEmail() {
    this.userEmail = await this.authService.getEmail();
  }

  async changePassword() {
    if (!this.newPassword || this.newPassword.length < 6) {
      console.log('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const result = await this.authService.updatePassword(this.newPassword);
      if (result) {
        window.alert('A senha foi atualizada com sucesso.'); 
        this.newPassword = '';  
        this.editPassword = false;  
      } else {
        window.alert('Falha ao atualizar a senha.'); 
      }
    } catch (error) {
      console.error('Erro ao atualizar a senha:', error);
      window.alert('Erro ao tentar atualizar a senha. Verifique o console para mais detalhes.');
    } finally {
      this.newPassword = '';  
      this.editPassword = false; 
    }
  }

  enableEditEmail() {
    this.editEmail = true;
  }

  enableEditPassword() {
    this.editPassword = true;
  }

  changeEmail() {
    const newEmail = 'newemail@example.com';
    this.authService.updateEmail(newEmail).catch(err => console.error(err));
  }
}
