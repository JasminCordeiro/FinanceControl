import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ExpenseService } from "../../core/services/expense.service";
import { IExpense } from "../../app/core/models/common.model";
import { ActivatedRoute, Router } from "@angular/router";
import { Category } from "../../app/core/models/category.model";

@Component({
  selector: "app-expense-form",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./expense-form.component.html",
  styleUrl: "./expense-form.component.scss",
})
export class ExpenseFormComponent {
  expenseForm!: FormGroup;
  expenseId = "";
  selectedCategory: any = null;

  categories: Category[] = [
    { id: 1, name: "Saúde", color: "#71D06D", limit: "500.00" },
    { id: 2, name: "Alimentação", color: "#FFC48C", limit: "1000.00" },
    { id: 3, name: "Educação", color: "#D6A8FF", limit: "800.00" },
    { id: 4, name: "Lazer", color: "#6D6727", limit: "600.00" },
    { id: 5, name: "Pet", color: "#D2B48C", limit: "300.00" },
  ];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.expenseForm = this.fb.group({
      price: new FormControl("", [
        Validators.required,
        Validators.pattern("^[0-9]+(\\.[0-9]{1,2})?$"),
      ]),
      title: new FormControl("", Validators.required),
      category: new FormControl(null, Validators.required),
      date: new FormControl(
        new Date(today).toISOString().split("T")[0],
        Validators.required
      ), 
    });
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
    this.expenseForm.patchValue({ category: category.id });
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.expenseId = params["id"];
        this.getExpensive(this.expenseId);
      },
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      let formData = { ...this.expenseForm.value };

      if (formData.date) {
        formData.date = new Date(formData.date).toISOString();
      }

      if (this.expenseId) {
        this.expenseService.updateExpense(this.expenseId, formData);
      } else {
        this.expenseService.addExpense(formData);
      }
      this.router.navigate(["/dashboard"]);
    } else {
      this.expenseForm.markAllAsTouched();
    }
  }

  getExpensive(key: string) {
    this.expenseService
      .getExpense(key)
      .snapshotChanges()
      .subscribe({
        next: (data) => {
          let expense = data.payload.toJSON() as IExpense;

          if (expense.date) {
            expense.date = new Date(expense.date).toISOString().split("T")[0];
          }

          this.expenseForm.patchValue(expense);
        },
      });
  }
}
