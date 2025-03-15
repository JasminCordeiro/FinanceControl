import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import { IExpense } from '../../app/core/models/common.model';
import { CategoryComponent } from '../../app/layout/category/category.component';
import { DateFilterComponent } from '../../app/layout/date-filter/date-filter.component';
import { ChangeDetectorRef } from '@angular/core';
import { CategoryService } from '../../core/services/category/category.service';
import { Category } from '../../app/core/models/category.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expense',
  standalone: true, // Ensure the component is standalone
  imports: [CommonModule, RouterModule, CategoryComponent, DateFilterComponent],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss',
})
export class ExpenseComponent implements OnInit {
  expenses: IExpense[] = [];
  filteredExpenses: IExpense[] = [];
  categorias: Category[] = [];
  despesasTotal = 0;
  receitaTotal = 5000;
  saldoAtual = 0;
  isLoading: boolean = false;

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.getAllExpenses();
  }

  loadCategories() {
    const categoriesObservable = this.categoryService.getCategories();

    if (!categoriesObservable) {
      console.error('Erro ao carregar categorias.');
      return;
    }

    categoriesObservable
      .pipe(
        map((categories: any[]) =>
          categories.map((category) => ({
            id: category.id,
            name: category.name,
            color: category.color,
            limit: category.limit,
          }))
        )
      )
      .subscribe(
        (categories: Category[]) => {
          this.categorias = categories;
          this.getAllExpenses(); 
        },
        (error) => console.error('Erro ao carregar categorias:', error)
      );
  }

  getAllExpenses() {
    this.isLoading = true;
    const expensesObservable = this.expenseService.getAllExpenses();

    if (!expensesObservable) {
      console.error('Não foi possível obter despesas. Usuário pode estar deslogado ou ocorreu um erro.');
      this.isLoading = false;
      return;
    }

    expensesObservable.snapshotChanges().subscribe({
      next: (data) => {
        this.expenses = [];
        this.despesasTotal = 0;

        data.forEach((item) => {
          let expense = item.payload.toJSON() as IExpense;

          if (expense.date) {
            expense.date = new Date(expense.date).toISOString().split('T')[0];
          }

          this.despesasTotal += parseFloat(expense.price);
          this.saldoAtual = this.receitaTotal - this.despesasTotal;

          const categoryFound = this.categorias.find((cat) => cat.id === expense.category) || {
            id: "0",
            name: 'Sem categoriaaa',
            color: 'gray',
            limit: '0.00',
          };
          
          this.expenses.push({
            key: item.key || '',
            title: expense.title,
            category: categoryFound.id, 
            price: expense.price,
            date: expense.date,
          });
        });

        this.filteredExpenses = [...this.expenses];
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar despesas:', error);
        this.isLoading = false;
      },
    });
  }

  trackByKey(index: number, expense: IExpense): string {
    return expense.key ?? index.toString();
  }

  filterExpenses(dateRange: { startDate: string; endDate: string }) {
    const { startDate, endDate } = dateRange;

    this.filteredExpenses = this.expenses.filter((expense) => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    console.log('Despesas filtradas:', this.filteredExpenses);
    this.cd.detectChanges();
  }

  editExpense(key: string) {
    this.router.navigate([`/expense-form/${key}`]);
  }

  removeExpense(key: string) {
    if (!key) {
      console.error("Erro: ID da despesa inválido.");
      return;
    }
  
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      this.expenseService.deleteExpense(key)
        .then(() => {
          console.log("Despesa excluída com sucesso!");
          this.getAllExpenses(); 
        })
        .catch((error) => console.error("Erro ao excluir despesa:", error)); 
    }
  }
  
}
