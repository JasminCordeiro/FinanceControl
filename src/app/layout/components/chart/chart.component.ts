import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { IExpense } from '../../../core/models/common.model';
import { ExpenseService } from '../../../../core/services/expense.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent implements OnInit, AfterViewInit {
  @ViewChild('expensesByCategory') expensesByCategory!: ElementRef;
  @ViewChild('expensesCountByCategory') expensesCountByCategory!: ElementRef;
  @ViewChild('expensesOverTime') expensesOverTime!: ElementRef;

  charts: Chart[] = [];
  expenses: IExpense[] = [];
 

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.getExpenses();
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  getExpenses(): void {
    const expensesObservable = this.expenseService.getAllExpenses();

    if (!expensesObservable) {
        console.error('Não foi possível obter despesas. Usuário pode estar deslogado ou ocorreu um erro.');
        return;
    }

   expensesObservable.snapshotChanges().subscribe({
      next: (data) => {
        this.expenses = data.map(item => item.payload.toJSON() as IExpense);
        this.updateCharts();
      }
    });
  }

  processExpensesByCategory(): { labels: string[], values: number[], colors: string[] } {
    const categoryTotals: { [key: string]: number } = {};

    this.expenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += Number(expense.price);
      } else {
        categoryTotals[expense.category] = Number(expense.price);
      }
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    const colors = labels.map(() => '#' + Math.floor(Math.random()*16777215).toString(16));

    return { labels, values, colors };
  }

  processExpensesCountByCategory(): { labels: string[], values: number[], colors: string[] } {
    const categoryCounts: { [key: string]: number } = {};

    this.expenses.forEach(expense => {
      categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
    });

    const labels = Object.keys(categoryCounts);
    const values = Object.values(categoryCounts);
    const colors = labels.map(() => '#' + Math.floor(Math.random()*16777215).toString(16));

    return { labels, values, colors };
  }

  processExpensesOverTime(): { labels: string[], values: number[] } {
    const expensesByDate: { [key: string]: number } = {};
  
    this.expenses.forEach(expense => {
      const dateObj = new Date(expense.date);
      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      }).format(dateObj); // Formata para "dd/MM"
  
      expensesByDate[formattedDate] = (expensesByDate[formattedDate] || 0) + Number(expense.price);
    });
  
    const labels = Object.keys(expensesByDate).sort();
    const values = labels.map(date => expensesByDate[date]);
  
    return { labels, values };
  }
  

  createCharts(): void {
    this.charts.push(new Chart(this.expensesByCategory.nativeElement, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    }));

    this.charts.push(new Chart(this.expensesCountByCategory.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    }));

    this.charts.push(new Chart(this.expensesOverTime.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{ data: [], borderColor: '#36A2EB', fill: false }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    }));

    this.updateCharts();
  }

  updateCharts(): void {
    if (!this.charts.length) return;

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
    this.charts[1].data.datasets[0].backgroundColor = expensesCountByCategoryData.colors;
    this.charts[1].update();

    // Atualizar gráfico de despesas ao longo do tempo
    this.charts[2].data.labels = expensesOverTimeData.labels;
    this.charts[2].data.datasets[0].data = expensesOverTimeData.values;
    this.charts[2].update();
  }
}
