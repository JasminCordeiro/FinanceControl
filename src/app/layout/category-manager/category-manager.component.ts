import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category/category.service';
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
  editingCategory: any = null; 
  isLoading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      color: ['', Validators.required],
      limit: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]
    });
    this.getAllCategories();
  }

  getAllCategories() {
    this.isLoading = true;

    const categoriesObservable = this.categoryService.getCategories();
  
    if (!categoriesObservable) {
      console.error('Não foi possível obter categorias.');
      this.isLoading = false;
      return;
    }

    categoriesObservable.subscribe(
      (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      (error) => {
        console.error('Erro ao obter categorias:', error);
        this.isLoading = false;
      }
    );
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
  
    if (this.editingCategory?.id) { 
      this.categoryService.updateCategory(this.editingCategory.id, this.categoryForm.value)
        .then(() => { // 
          this.categoryForm.reset();
          this.editingCategory = null;
          this.getAllCategories(); 
        })
        .catch((error: any) => console.error("Erro ao atualizar categoria:", error));
    } else {
      // Adiciona nova categoria
      this.categoryService.addCategory(this.categoryForm.value)
        .then(() => { //
          this.categoryForm.reset();
          this.getAllCategories(); 
        })
        .catch((error: any) => console.error("Erro ao adicionar categoria:", error));
    }
  }

  editCategory(category: any) {
    if (!category?.id) {
      console.error("Erro: A categoria não tem um ID válido.");
      return;
    }
    
    this.editingCategory = { ...category }; 
    this.categoryForm.patchValue({
      name: category.name,
      color: category.color,
      limit: category.limit
    });
  }
  

  deleteCategory(category: any) {
    if (!category || !category.id) {
      console.error("Erro: A categoria não tem um ID válido.");
      return;
    }
  
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id)
        .then(() => {
          console.log("Categoria excluída!");
          this.getAllCategories(); // Atualiza lista
        })
        .catch((error: any) => console.error("Erro ao excluir categoria:", error));
    }
  }
  
}
