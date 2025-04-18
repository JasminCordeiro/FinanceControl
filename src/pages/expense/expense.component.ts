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
import Swal from 'sweetalert2';

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
  receitaTotal = 0;
  saldoAtual = 0;
  isLoading: boolean = false;
  categorySpendingMap: { [categoryId: string]: number } = {};
  editandoReceita = false;

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.getAllExpenses();
    this.loadIncome();
  }

  loadIncome() {
    const incomeObservable = this.expenseService.getIncome();
  
    if (!incomeObservable) {
      console.warn('Usuário não autenticado para carregar receita.');
      return;
    }
  
    incomeObservable.subscribe({
      next: (value) => {
        this.receitaTotal = Number(value) || 0;
        this.saldoAtual = this.receitaTotal - this.despesasTotal;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar receita:', err);
      }
    });
  }
  onIncomeChange(event: any) {
    const newIncome = Number(event.target.value);
    if (isNaN(newIncome)) return;
  
    this.expenseService.setIncome(newIncome).then(() => {
      this.receitaTotal = newIncome;
      this.saldoAtual = this.receitaTotal - this.despesasTotal;
      this.cd.detectChanges();
    });
  }

  confirmIncomeEdit(event: any) {
    const novoValor = Number(event.target.value);
    if (!isNaN(novoValor) && novoValor >= 0) {
      this.expenseService.setIncome(novoValor)
        .then(() => {
          this.receitaTotal = novoValor;
          this.saldoAtual = this.receitaTotal - this.despesasTotal;
          this.cd.detectChanges();
        })
        .catch((error) => console.error('Erro ao salvar receita:', error));
    }

    this.editandoReceita = false;
  }

  cancelIncomeEdit() {
    this.editandoReceita = false;
  }

  abrirModalEditarReceita() {
    Swal.fire({
      title: 'Editar receita mensal',
      input: 'number',
      inputLabel: 'Novo valor (R$)',
      inputValue: this.receitaTotal,
      inputAttributes: {
        min: '0',
      },
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || Number(value) < 0) {
          return 'Informe um valor válido.';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const novoValor = Number(result.value);
        this.expenseService.setIncome(novoValor)
          .then(() => {
            this.receitaTotal = novoValor;
            this.saldoAtual = this.receitaTotal - this.despesasTotal;
            this.cd.detectChanges();
            Swal.fire({
              icon: 'success',
              title: 'Receita atualizada!',
              text: `Novo valor: R$ ${novoValor}`,
              confirmButtonColor: '#28a745'
            });
          })
          .catch((error) => {
            console.error('Erro ao salvar receita:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erro ao salvar',
              text: 'Ocorreu um erro ao salvar o novo valor.',
              confirmButtonColor: '#dc3545'
            });
          });
      }
    });
  }
  

  loadCategories() {
    const categoriesObservable = this.categoryService.getCategories();

    if (!categoriesObservable) {
      console.error('Erro ao carregar categorias.');
      this.isLoading = false;

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
        (error) => console.error('Erro ao carregar categorias:', error));
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
        this.filteredExpenses = [];
        this.despesasTotal = 0;
        this.categorySpendingMap = {}; // Reinicia o mapa

        data.forEach((item) => {
          let expense = item.payload.toJSON() as IExpense;

          if (expense.date) {
            expense.date = new Date(expense.date).toISOString().split('T')[0];
          }

          const value = parseFloat(expense.price) || 0;

          this.despesasTotal += value;
          this.saldoAtual = this.receitaTotal - this.despesasTotal;

          const categoryFound = this.categorias.find((cat) => cat.id === expense.category) || {
            id: "0",
            name: 'Sem categoria',
            color: 'gray',
            limit: '0.00',
          };

          const categoryId = categoryFound.id;
          if (!this.categorySpendingMap[categoryId]) {
            this.categorySpendingMap[categoryId] = 0;
          }
          this.categorySpendingMap[categoryId] += value;

          this.expenses.push({
            key: item.key || '',
            title: expense.title,
            category: categoryId,
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
  
    Swal.fire({
      title: 'Deseja realmente excluir?',
      text: 'Essa ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // vermelho
      cancelButtonColor: '#6c757d',  // cinza
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.expenseService.deleteExpense(key)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Excluída!',
              text: 'Despesa excluída com sucesso.',
              confirmButtonColor: '#28a745',
            });
            this.getAllExpenses();
          })
          .catch((error) => {
            console.error("Erro ao excluir despesa:", error);
            Swal.fire({
              icon: 'error',
              title: 'Erro',
              text: 'Erro ao excluir despesa. Verifique o console.',
              confirmButtonColor: '#dc3545',
            });
          });
      }
    });
  }

  parseFloat(value: string | number): number {
    return Number.parseFloat(value as string);
  }

  getCategoriaColor(restante: number): string {
  if (restante > 0) return '#28a745';    
  if (restante === 0) return '#ffc107';  
  return '#dc3545';                      
}
}
