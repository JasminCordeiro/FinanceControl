import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category/category.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-manager',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
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
    this.initForm();
    this.getAllCategories();
  }

  private initForm() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      color: ['', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]], // Regex corrigida para cores hexadecimais válidas
      limit: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]
    });
  }

  private getAllCategories() {
    const categoriesObservable = this.categoryService.getCategories();

    if (!categoriesObservable) {
      console.error('Não foi possível obter categorias. Usuário pode estar deslogado ou ocorreu um erro.');
      return;
    }

    categoriesObservable.subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Categorias carregadas:', this.categories);
      },
      error: (error) => {
        console.error('Erro ao obter categorias:', error);
      }
    });
  }

  async onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    try {
      await this.categoryService.addCategory(this.categoryForm.value);
      this.categoryForm.reset();
      this.getAllCategories(); // Atualiza categorias após adicionar uma nova
    } catch (error) {
      console.error('Falha ao adicionar categoria:', error);
    }
  }
}