import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = "";
  password: string = "";
  errorMessage: string = "";

  constructor(private authService: AuthService, private router: Router){}

  async login(){
    try{
      const userCredential = await this.authService.login(this.email, this.password);
      console.log("Login realizado com sucesso", userCredential);
      this.router.navigate(["/dashboard"]);
    }catch (error: any){
      this.errorMessage = error.message;
      window.alert(error);    }
  }
}
