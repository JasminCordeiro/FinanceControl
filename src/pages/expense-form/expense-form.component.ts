import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
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
import { CategoryService } from "../../core/services/category/category.service";
import { Category } from "../../app/core/models/category.model";

@Component({
  selector: "app-expense-form",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./expense-form.component.html",
  styleUrl: "./expense-form.component.scss",
})
export class ExpenseFormComponent implements OnInit {
  expenseForm!: FormGroup;
  expenseId = "";
  selectedCategory: any = null;
  categories: Category[] = []; 

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService, 
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

  ngOnInit(): void {
    this.loadCategories();  
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.expenseId = params["id"];
        this.getExpense(this.expenseId);
      },
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

  selectCategory(category: Category) {
    this.selectedCategory = category;
    this.expenseForm.patchValue({ category: category.id });
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

  getExpense(key: string) {
    const expenseObservable = this.expenseService.getExpense(key);
  
    if (!expenseObservable) {
      console.error("Expense data is unavailable.");
      return;
    }
  
    expenseObservable.valueChanges().subscribe((data: any) => {
      if (data) {
        this.expenseForm.patchValue({
          title: data.title,
          price: data.price,
          category: data.category,
          date: data.date.split("T")[0], // apenas a parte YYYY-MM-DD
        });
  
        this.selectedCategory = this.categories.find(
          (cat) => cat.id === data.category
        );
      }
    });
  }
}
