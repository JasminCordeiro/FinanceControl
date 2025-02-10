import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-category',
  imports: [NgStyle],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {

  @Input() categoryId!: number;

  categories: Category[] = [
    { id: 1, name: 'Saúde', color: '#A8E6CF', limit: '500.00' },   // Verde pastel
{ id: 2, name: 'Alimentação', color: '#FFD3B6', limit: '1000.00' },  // Laranja pastel
{ id: 3, name: 'Educação', color: '#D4A5E2', limit: '800.00' },  // Roxo pastel
{ id: 4, name: 'Lazer', color: '#FFECB3', limit: '600.00' },  // Amarelo pastel
{ id: 5, name: 'Pet', color: '#F5E1DA', limit: '300.00' }  // Bege pastel
  ];

  get category(): Category {
    return this.categories.find(cat => cat.id === this.categoryId) || { id: 0, name: 'Desconhecido', color: 'gray', limit: '0.00' };
  }
}
