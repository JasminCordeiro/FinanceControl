import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExpenseService } from '../../core/services/expense.service';
import { IExpense } from '../../app/core/models/common.model';
import { Category } from "../../app/core/models/category.model";

import { DateFilterComponent } from '../../app/layout/date-filter/date-filter.component';
import { CategoryComponent } from '../../app/layout/category/category.component';
import { ChartComponent } from '../../app/layout/components/chart/chart.component';
import { CategoryService } from '../../core/services/category/category.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, DateFilterComponent, CategoryComponent, FormsModule,ChartComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {
  expenses: IExpense[] = [];
  filteredExpenses: IExpense[] = [];
  isLoading: boolean = false;
  categories: Category[] = []; 

  despesasTotal = 0;
  receitaTotal = 5000;
  saldoAtual = 0;

  selectedCategory: string = '';
  selectedSort: string = '';

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.getAllExpenses();
    this.loadCategories();  
  }

  getAllExpenses(): void {
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

          this.despesasTotal += Number(expense.price);
          this.saldoAtual = this.receitaTotal - this.despesasTotal;

          this.expenses.push({
            key: item.key || '',
            title: expense.title,
            category: expense.category,
            price: expense.price,
            date: expense.date
          });
        });

        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    const categoriesObservable = this.categoryService.getCategories();
    
    if (!categoriesObservable) {
      console.error("Não foi possível carregar categorias.");
      return;
    }

    categoriesObservable.subscribe(
      (categories: Category[]) => {
        this.categories = categories;
      },
      (error) => console.error("Erro ao carregar categorias:", error)
    );
  }

  applyFilters(): void {
    let filtered = [...this.expenses];
  
    if (this.selectedCategory) {
      const categoryObj = this.categories.find(cat => cat.id === this.selectedCategory);
      if (categoryObj) {
        filtered = filtered.filter(expense => expense.category === categoryObj.id);
      }
    }
  
    this.sortExpenses(filtered);
    this.filteredExpenses = filtered;
    this.cd.detectChanges();
  }
  
  filterByDate(dateRange: { startDate: string, endDate: string }): void {
    const { startDate, endDate } = dateRange;

    let filtered = this.expenses.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    this.sortExpenses(filtered);
    this.filteredExpenses = filtered;
    this.cd.detectChanges();
  }

  sortExpenses(expenses: IExpense[]): void {
    if (this.selectedSort === 'nome') {
      expenses.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
    } else if (this.selectedSort === 'preco') {
      expenses.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (this.selectedSort === 'data') {
      expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }
  

  selectCategory(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.selectedCategory = target.value;
      this.applyFilters();
    }
  }

  editExpense(key: string): void {
    this.router.navigate([`/expense-form/${key}`]);
  }

  removeExpense(key: string): void {
    if (!key) return;
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      this.expenseService.deleteExpense(key);
    }
  }

  trackByKey(index: number, expense: IExpense): string {
    return expense.key ?? index.toString();
  }
}
