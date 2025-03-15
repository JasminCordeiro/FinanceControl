import { CommonModule, NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../../core/services/category/category.service';

@Component({
  selector: 'app-category',
  imports: [NgStyle,CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
  @Input() categoryId!: string;
  categories: Category[] = [];
  selectedCategory: Category | null = null;

  constructor(private categoryService: CategoryService) {} 

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    const categoriesObservable = this.categoryService.getCategories();

    if (!categoriesObservable) {
      console.error("Erro ao carregar categorias.");
      return;
    }

    categoriesObservable.subscribe(
      (categories: Category[]) => {
        this.categories = categories;
        this.selectedCategory = this.categories.find(cat => cat.id === String(this.categoryId)) || this.selectedCategory;
      },
      (error) => console.error("Erro ao buscar categorias:", error)
    );
  }
}