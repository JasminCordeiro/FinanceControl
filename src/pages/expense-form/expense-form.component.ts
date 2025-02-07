import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExpenseService } from '../../core/services/expense.service';
import { IExpense } from '../../app/core/models/common.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-expense-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss',
})
export class ExpenseFormComponent {
  expenseForm!: FormGroup;
  expenseId = '';

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.expenseForm = this.fb.group({
      price: new FormControl('', [Validators.required]),
      title: new FormControl('', Validators.required),
      category: new FormControl(''),
    });
  }

  ngOnInit(): void{
    this.activatedRoute.params.subscribe({
      next:(params)=>{
        this.expenseId = params['id'];
        this.getExpensive(this.expenseId);
      }
    })}

  onSubmit() {
    if (this.expenseForm.valid) {
      if (this.expenseId) {
        this.expenseService.updateExpense(this.expenseId, this.expenseForm.value);
      } else {
        this.expenseService.addExpense(this.expenseForm.value);
      }
      this.router.navigate(['/dashboard']);
    } else {
      this.expenseForm.markAllAsTouched();
    }
  }
  
  getExpensive(key: string) {
    this.expenseService.getExpense(key).snapshotChanges().subscribe({
      next: (data) =>{
        let expense = data.payload.toJSON() as IExpense;
        this.expenseForm.setValue(expense);
      }
    });
  }
}
