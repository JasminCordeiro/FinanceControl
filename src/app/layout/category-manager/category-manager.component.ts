import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category/category.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-category-manager',
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './category-manager.component.html',
  styleUrl: './category-manager.component.scss'
})
export class CategoryManagerComponent implements OnInit {
  categoryForm!: FormGroup;
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      color: ['', Validators.required],
      limit: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]
    });
    this.loadCategories();
  }

  loadCategories() {
    console.log(this.categoryService.getCategories())

    this.categoryService.getCategories();
  }

  async onSubmit() {
    if (this.categoryForm.valid) {
      try {

        await this.categoryService.addCategory(this.categoryForm.value);
        this.categoryForm.reset();
        this.loadCategories();
      } catch (error) {
        console.error('Failed to add category', error);
      }
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }
  
}