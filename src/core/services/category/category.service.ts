import { getAuth } from 'firebase/auth';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AuthService } from '../auth/auth.service';
import { Category } from '../../../app/core/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

    userId!: string;
    dbPath = "/expenses";
    categoryRef: AngularFireList<any>;
  

  constructor(private db: AngularFireDatabase, private authService: AuthService) {
    const userId = this.getUserId();
    this.categoryRef = db.list(`${this.dbPath}/${userId}/categories`);
  }

  getUserId(): string | null {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
  }

  addCategory(categoryData: any) {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error("Usuário não autenticado.");
      return;
    }
    this.categoryRef.push(categoryData);
  }
  
  getCategories() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error("Usuário não autenticado.");
      return;
    }

    return this.categoryRef.valueChanges;
  }

  updateCategory(categoryId: string, category: Category) {
    if (!this.userId) return;
    return this.categoryRef.update(categoryId, category);
  }

  deleteCategory(categoryId: string) {
    if (!this.userId) return;
    return this.categoryRef.remove(categoryId);
  }

}
