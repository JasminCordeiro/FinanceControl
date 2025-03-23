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

  constructor(private afAuth: AngularFireAuth, private router: Router, private db: AngularFireDatabase) {  }

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
    } catch (error: any) {
      const code = error.code;
  
      let message = 'Não foi possível fazer login. Verifique seu e-mail e senha.';
  
      switch (code) {
        case 'auth/email-already-in-use':
          return 'Este e-mail já está em uso.';
        case 'auth/invalid-email':
          return 'E-mail inválido.';
        case 'auth/operation-not-allowed':
          return 'A operação não está habilitada no Firebase.';
        case 'auth/weak-password':
          return 'A senha deve conter pelo menos 6 caracteres.';
        default:
          return 'Ocorreu um erro inesperado.';
      }
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
        await this.afAuth.signOut();
        return {
          success: false,
          message: 'Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada.'
        };
      }
    }catch (error: any) {
      const code = error.code;
  
      let message = 'Não foi possível fazer login. Verifique seu e-mail e senha.';
  
      switch (code) {
        case 'auth/user-not-found':
          message = 'Usuário não encontrado.';
          break;
        case 'auth/wrong-password':
          message = 'Senha incorreta.';
          break;
        case 'auth/invalid-email':
          message = 'E-mail inválido.';
          break;
        case 'auth/invalid-credential':
          message = 'Credenciais inválidas. Verifique seu e-mail e senha.';
          break;
      }
      return { success: false, message };
    }
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.afAuth.currentUser;
  
    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado.',
      };
    }
  
    try {
      await user.updatePassword(newPassword);
      return {
        success: true,
        message: 'Senha atualizada com sucesso!',
      };
    } catch (error: any) {
      console.error('Erro ao atualizar a senha:', error);
  
      let message = 'Erro ao atualizar a senha.';
  
      if (error.code === 'auth/requires-recent-login') {
        message = 'Por segurança, faça login novamente antes de alterar sua senha.';
      }
  
      return {
        success: false,
        message,
      };
    }
  }
  

  async updateEmail(newEmail: string): Promise<{ success: boolean; message: string }> {
    if (!newEmail || !newEmail.includes('@')) {
      return { success: false, message: 'Por favor, insira um e-mail válido.' };
    }
  
    const user = await this.afAuth.currentUser;
  
    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' };
    }
  
    try {
      await user.updateEmail(newEmail);
      return { success: true, message: 'E-mail atualizado com sucesso!' };
  
    } catch (error: any) {
      let message = 'Erro ao atualizar o e-mail.';
  
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'O e-mail informado é inválido.';
          break;
        case 'auth/email-already-in-use':
          message = 'Este e-mail já está em uso por outra conta.';
          break;
        case 'auth/operation-not-allowed':
          message = 'A operação não está habilitada no Firebase.';
          break;
        case 'auth/requires-recent-login':
          message = 'Por segurança, faça login novamente antes de atualizar o e-mail.';
          break;
      }
  
      return { success: false, message };
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

  async resetPassword(email: string): Promise<{ success: boolean, message: string }> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      return { success: true, message: 'E-mail de redefinição de senha enviado com sucesso!' };
    } catch (error: any) {
      let message = 'Erro ao enviar e-mail de redefinição.';
  
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Usuário não encontrado.';
          break;
        case 'auth/invalid-email':
          message = 'E-mail inválido.';
          break;
      }
  
      return { success: false, message };
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
