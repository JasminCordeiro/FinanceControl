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

  async getUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.uid : null;
  }
  

  // Registro de novo usuário
  async register(email: string, password: string): Promise<any> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (userCredential.user) {
        const uid = userCredential.user.uid;
        // Criando um nó de despesas vazio
        await this.db.object(`/expenses/${uid}`).update({});
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
        return { success: true, user: userCredential.user };
      } else {
        return { success: false, message: "Seu e-mail ainda não foi verificado. Verifique seu e-mail antes de fazer login." };
      }
    }catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async updatePassword(newPassword: string): Promise<boolean> {
    try {
        const user = await this.afAuth.currentUser;
        await user?.updatePassword(newPassword);
        return true; 
    } catch (error) {
        console.error('Erro ao atualizar a senha:', error);
        return false; 
    }
}

  async updateEmail(newEmail: string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user) {
      return user.updateEmail(newEmail).then(() => {
        console.log('E-mail atualizado com sucesso!');
      }).catch((error) => {
        console.error('Erro ao atualizar e-mail:', error);
        throw error;
      });
    } else {
      throw new Error('Não foi possível obter as informações do usuário.');
    }
  }

  async getEmail(): Promise<string | null> {
    try {
      const user = await this.afAuth.currentUser;
      if (user && user.email) {
        return user.email;
      } else {
        console.log('Nenhum usuário logado ou e-mail não disponível.');
        return null; 
      }
    } catch (error) {
      console.error('Erro ao obter o e-mail do usuário:', error);
      return null; 
    }
  }

  // Logout do usuário
  async logout() {
    await this.afAuth.signOut();
    setTimeout(() => {
      this.router.navigate(["/login"]);
      console.log("logout realizado");
    }, 100);
  }
  

  // Verifica se há usuário logado
  getUser() {
    return this.afAuth.authState;
  }
}
