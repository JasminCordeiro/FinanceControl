import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { Router } from "@angular/router";
import { User } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: "root",
})
export class AuthService {

  userData: User | null = null; 

  constructor(private afAuth: AngularFireAuth, private router: Router, private db: AngularFireDatabase) {
    // this.afAuth.authState.subscribe(user => {
    //   this.userData = user; // Atualiza o usuário quando logado/deslogado
    // });
  }

  getUserId(): string | null {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
  }

  // Registro de novo usuário
  async register(email: string, password: string): Promise<any> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (userCredential.user) {
        const uid = userCredential.user.uid;
        // Criando um nó de despesas vazio
        await this.db.object(`/expenses/${uid}`).set({});
        await userCredential.user.sendEmailVerification();
        return { success: true, message: "Cadastro realizado! Verifique seu e-mail para ativar a conta." };
      }
    } catch (error) {
      console.error('Registration Error:', error);
      return { success: false, message: error };
    }
    return { success: false, message: "Ocorreu um erro inesperado durante o registro." };
  }
  
  // Login do usuário
  async login(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (userCredential.user?.emailVerified) {
        return userCredential;
      } else {
        throw new Error("Seu e-mail ainda não foi verificado. Por favor, verifique seu e-mail antes de fazer login.");
      }
    } catch (error) {
      throw error;
    }
  }

  // Logout do usuário
  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(["/login"]);
    console.log("logout realizado")
  }

  // Verifica se há usuário logado
  getUser() {
    return this.afAuth.authState;
  }
}
