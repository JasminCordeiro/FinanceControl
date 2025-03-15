import { getAuth } from 'firebase/auth';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AuthService } from '../auth/auth.service';
import { Category } from '../../../app/core/models/category.model';
import { map, Observable } from 'rxjs';

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

  getCategories(): Observable<Category[]> {
    return this.categoryRef.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => ({
          id: a.key, 
          ...a.payload.val()
        }))
      )
    );
  }
  
  addCategory(categoryData: any): Promise<void> {
    const newCategoryRef = this.categoryRef.push(categoryData); // ✅ Cria a referência primeiro
    return newCategoryRef.set({ ...categoryData, id: newCategoryRef.key }); // ✅ Adiciona o ID gerado
  }

  updateCategory(categoryId: string, category: Category): Promise<void> {
    return this.categoryRef.update(categoryId, category);
  }

  deleteCategory(categoryId: string): Promise<void> {
    return this.categoryRef.remove(categoryId);
  }
}
