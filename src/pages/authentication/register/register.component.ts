import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
        window.alert(response.message); 
        this.router.navigate(["/login"]); 
      }else{
        window.alert(response.message);
      }
    } catch (error: any) {
      window.alert(error);
    }
  }
}
