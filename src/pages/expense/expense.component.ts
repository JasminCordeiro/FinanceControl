import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import { IExpense } from '../../app/core/models/common.model';
import { CategoryComponent } from '../../app/layout/category/category.component';
import { DateFilterComponent } from '../../app/layout/date-filter/date-filter.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-expense',
  standalone: true, // Ensure the component is standalone
  imports: [CommonModule, RouterModule, CategoryComponent, DateFilterComponent],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss',
})
export class ExpenseComponent {
  expenses: IExpense[] = [];
  filteredExpenses: IExpense[] = [];
  despesasTotal = 0;
  receitaTotal = 5000;
  saldoAtual = 0;
  isLoading: boolean = false;

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAllExpenses();
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

          this.despesasTotal += parseInt(expense.price);
          this.saldoAtual = this.receitaTotal - this.despesasTotal;

          this.expenses.push({
            key: item.key || '',
            title: expense.title,
            category: expense.category,
            price: expense.price,
            date: expense.date,
          });
        });

        this.filteredExpenses = [...this.expenses]; // Initialize filteredExpenses
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
    if (window.confirm('Are you sure?')) {
      this.expenseService.deleteExpense(key);
    }
  }
}