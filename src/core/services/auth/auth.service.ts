import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}
  // Registro de novo usuário
  async register(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      return userCredential;
    } catch (error) {
      console.error("Erro no registro:", error);
      throw error;
    }
  }

  // Login do usuário
  async login(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      return userCredential;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }

  // Logout do usuário
  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(["/login"]);
  }

  // Verifica se há usuário logado
  getUser() {
    return this.afAuth.authState;
  }
}
