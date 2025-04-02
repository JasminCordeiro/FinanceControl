import { Injectable } from "@angular/core";
import { getAuth } from 'firebase/auth';
import { AngularFireDatabase, AngularFireList } from "@angular/fire/compat/database";
import { IExpense } from "../../app/core/models/common.model";


@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  dbPath = "/expenses";
  expensesRef: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {
    const userId = this.getUserId();
    this.expensesRef = db.list(`${this.dbPath}/${userId}/expenses_list`);
  }

  // Obtém o UID do usuário autenticado
  getUserId(): string | null {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
  }

  getIncomeRef() {
    const userId = this.getUserId();
    if (!userId) return null;
    return this.db.object(`/expenses/${userId}/income`);
  }

  getIncome() {
    const incomeRef = this.getIncomeRef();
    if (!incomeRef) return null;
    return incomeRef.valueChanges();
  }

  setIncome(value: number): Promise<void> {
    const incomeRef = this.getIncomeRef();
    if (!incomeRef) {
      return Promise.reject('Usuário não autenticado');
    }
    return incomeRef.set(value);
  }

  // Obtém todas as despesas do usuário autenticado
  getAllExpenses() {
    const userId = this.getUserId();
    if (!userId) {
      console.log("Usuário não autenticado.");
      return null;
    }
    return this.expensesRef;
  }

  // Obtém uma despesa específica do usuário autenticado
  getExpense(key: string) {
    const userId = this.getUserId();
    if (!userId) {
      console.log("Usuário não autenticado.");
      return null;
    }
    return this.db.object(`/expenses/${userId}/expenses_list/${key}`);
  }
  

  // Adiciona uma nova despesa para o usuário autenticado
  addExpense(expense: IExpense) {
    const userId = this.getUserId();

    if (!userId) {
      console.log("Usuário não autenticado.");
      return;
    }

    this.expensesRef.push(expense);
  }

  // Atualiza uma despesa do usuário autenticado
  updateExpense(key: string, expense: IExpense) {
    const userId = this.getUserId();
    if (!userId) {
      console.error("Usuário não autenticado.");
      return;
    }
    this.expensesRef.update(key, expense);
  }

  deleteExpense(expenseId: string): Promise<void> {
    return this.expensesRef.remove(expenseId);
  }
}
