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

  despesasTotal = 0;
  receitaTotal = 5000;
  saldoAtual = 0;

  selectedCategory: string = '';
  selectedSort: string = '';

  categories: Category[] = [
    { id: 1, name: "Saúde", color: "#71D06D", limit: "500.00" },
    { id: 2, name: "Alimentação", color: "#FFC48C", limit: "1000.00" },
    { id: 3, name: "Educação", color: "#D6A8FF", limit: "800.00" },
    { id: 4, name: "Lazer", color: "#6D6727", limit: "600.00" },
    { id: 5, name: "Pet", color: "#D2B48C", limit: "300.00" }
  ];
  

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAllExpenses();
  }

  getAllExpenses(): void {
    this.isLoading = true;

    this.expenseService.getAllExpenses().snapshotChanges().subscribe({
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

  applyFilters(): void {
    let filtered = [...this.expenses];
  
    if (this.selectedCategory) {
      console.log("applyFilters - Categoria selecionada:", this.selectedCategory);
  
      // Buscar o ID da categoria pelo nome selecionado
      const categoryObj = this.categories.find(cat => cat.name === this.selectedCategory);
      if (categoryObj && typeof categoryObj.id === 'number') {
        const selectedCategoryId: number = Number(categoryObj.id); // Garantindo que seja número
  
        // Comparação correta entre números
        filtered = filtered.filter(expense => Number(expense.category) === selectedCategoryId);
      }
    }
  
    this.sortExpenses(filtered);
    this.filteredExpenses = filtered;
    this.cd.detectChanges();
  
    console.log("Despesas filtradas:", this.filteredExpenses);
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
      expenses.sort((a, b) => a.title.localeCompare(b.title));
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
