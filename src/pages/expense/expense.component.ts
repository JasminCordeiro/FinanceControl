import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import { IExpense } from '../../app/core/models/common.model';

@Component({
  selector: 'app-expense',
  imports: [CommonModule,RouterModule,],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss'
})
export class ExpenseComponent {
  expenses: IExpense[] = [];
  despesasTotal = 0;
  receitaTotal = 5000;
  saldoAtual = 0;
  isLoading: boolean = false;

  constructor(private expenseServise: ExpenseService, private router: Router){}

  ngOnInit(): void{
    this.getAllExpenses();
  }

  getAllExpenses(){
    this.isLoading = true;
    this.expenseServise
    .getAllExpenses()
    .snapshotChanges()
    .subscribe({
      next: (data) =>{
        this.expenses = [];
        data.forEach((item)=>{
          let expense = item.payload.toJSON() as IExpense;
          this.despesasTotal += parseInt(expense.price);
          this.saldoAtual = this.receitaTotal - this.despesasTotal
          console.log(this.despesasTotal);
          this.expenses.push({
            key: item.key || '',
            title: expense.title,
            description: expense.description,
            price: expense.price
          });
        });
        this.isLoading = false;}
    });
  }

  editExpense(key:string){
    this.router.navigate([`/expense-form/${key}`]);
  }

  removeExpense(key:string){
    if(window.confirm('Are you sure?')){
      this.expenseServise.deleteExpense(key);
    }
  }

}
