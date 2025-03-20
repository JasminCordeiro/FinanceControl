import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from "@angular/core";
import { Chart, registerables } from "chart.js";
import { IExpense } from "../../../core/models/common.model";
import { Category } from "../../../core/models/category.model";
import { CategoryService } from "../../../../core/services/category/category.service";
import { ExpenseService } from "../../../../core/services/expense.service";

Chart.register(...registerables);

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrl: "./chart.component.css",
})
export class ChartComponent implements OnInit, AfterViewInit {
  @ViewChild("expensesByCategory") expensesByCategory!: ElementRef;
  @ViewChild("expensesCountByCategory") expensesCountByCategory!: ElementRef;
  @ViewChild("expensesOverTime") expensesOverTime!: ElementRef;

  charts: Chart[] = [];
  expenses: IExpense[] = [];
  categoriesMap: { [key: string]: { name: string; color: string } } = {}; 
  totalDespesasMesAtual: number = 0;

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createCharts();
    }, 100); 
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categoriesMap = categories.reduce((acc, category) => {
        acc[category.id] = {
          name: category.name,
          color: category.color || this.getRandomColor(), 
        };
        return acc;
      }, {} as { [key: string]: { name: string; color: string } });

      this.getExpenses();
    });
  }

  getExpenses(): void {
    const expensesObservable = this.expenseService.getAllExpenses();

    if (!expensesObservable) {
      console.error(
        "Não foi possível obter despesas. Usuário pode estar deslogado ou ocorreu um erro."
      );
      return;
    }

    expensesObservable.snapshotChanges().subscribe({
      next: (data) => {
        this.expenses = data.map((item) => item.payload.toJSON() as IExpense);
        this.updateCharts();
      },
    });
  }

  processExpensesByCategory(): {
    labels: string[];
    values: number[];
    colors: string[];
  } {
    const categoryTotals: { [key: string]: { total: number; color: string } } =
      {};

    this.expenses.forEach((expense) => {
      const category = this.categoriesMap[expense.category] || {
        name: "Desconhecido",
        color: this.getRandomColor(),
      };
      const categoryName = category.name;
      const categoryColor = category.color;

      if (categoryTotals[categoryName]) {
        categoryTotals[categoryName].total += Number(expense.price);
      } else {
        categoryTotals[categoryName] = {
          total: Number(expense.price),
          color: categoryColor,
        };
      }
    });

    const labels = Object.keys(categoryTotals);
    const values = labels.map((label) => categoryTotals[label].total);
    const colors = labels.map((label) => categoryTotals[label].color);

    return { labels, values, colors };
  }

  processExpensesCountByCategory(): {
    labels: string[];
    values: number[];
    colors: string[];
  } {
    const categoryCounts: { [key: string]: { count: number; color: string } } =
      {};

    this.expenses.forEach((expense) => {
      const category = this.categoriesMap[expense.category] || {
        name: "Desconhecido",
        color: this.getRandomColor(),
      };
      const categoryName = category.name;
      const categoryColor = category.color;

      if (categoryCounts[categoryName]) {
        categoryCounts[categoryName].count += 1;
      } else {
        categoryCounts[categoryName] = { count: 1, color: categoryColor };
      }
    });

    const labels = Object.keys(categoryCounts);
    const values = labels.map((label) => categoryCounts[label].count);
    const colors = labels.map((label) => categoryCounts[label].color);

    return { labels, values, colors };
  }

  processExpensesOverTime(): { labels: string[]; values: number[] } {
    const expensesByDate: { [key: string]: number } = {};
    this.totalDespesasMesAtual = 0; 

    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; 
    const anoAtual = hoje.getFullYear(); 

    this.expenses.forEach((expense) => {
      const dateObj = new Date(expense.date);
      const mesDespesa = dateObj.getMonth() + 1;
      const anoDespesa = dateObj.getFullYear();

      if (mesDespesa === mesAtual && anoDespesa === anoAtual) {
        const formattedDate = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }).format(dateObj); 

        expensesByDate[formattedDate] =
          (expensesByDate[formattedDate] || 0) + Number(expense.price);

        this.totalDespesasMesAtual += Number(expense.price);
      }
    });

    const labels = Object.keys(expensesByDate).sort();
    const values = labels.map((date) => expensesByDate[date]);

    return { labels, values };
  }

  createCharts(): void {
    this.charts.push(
      new Chart(this.expensesByCategory.nativeElement, {
        type: "pie",
        data: {
          labels: [],
          datasets: [{ data: [], backgroundColor: [] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      })
    );

    this.charts.push(
      new Chart(this.expensesCountByCategory.nativeElement, {
        type: "bar",
        data: {
          labels: [],
          datasets: [{ data: [], backgroundColor: [] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      })
    );

    this.charts.push(
      new Chart(this.expensesOverTime.nativeElement, {
        type: "bar", 
        data: {
          labels: [],
          datasets: [
            {
              label: "Gastos por Dia",
              data: [],
              backgroundColor: this.getRandomColor(),
              borderColor: "#ffffff",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    );

    this.updateCharts();
  }

  updateCharts(): void {
    if (
      !this.charts.length ||
      !this.expenses.length ||
      Object.keys(this.categoriesMap).length === 0
    )
      return;

    const expensesByCategoryData = this.processExpensesByCategory();
    const expensesCountByCategoryData = this.processExpensesCountByCategory();
    const expensesOverTimeData = this.processExpensesOverTime();

    // Atualizar gráfico de valor gasto por categoria
    this.charts[0].data.labels = expensesByCategoryData.labels;
    this.charts[0].data.datasets[0].data = expensesByCategoryData.values;
    this.charts[0].data.datasets[0].backgroundColor = expensesByCategoryData.colors;
    this.charts[0].update();

    // Atualizar gráfico de quantidade de despesas por categoria
    this.charts[1].data.labels = expensesCountByCategoryData.labels;
    this.charts[1].data.datasets[0].data = expensesCountByCategoryData.values;
    this.charts[1].data.datasets[0].backgroundColor =
      expensesCountByCategoryData.colors;
    this.charts[1].update();

    // Atualizar o gráfico de colunas com os gastos diários do mês atual
    this.charts[2].data.labels = expensesOverTimeData.labels;
    this.charts[2].data.datasets[0].data = expensesOverTimeData.values;
    this.charts[2].update();
  }

  getRandomColor(): string {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
}
