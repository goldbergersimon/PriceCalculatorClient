import { ProductService } from './../product.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  input,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxDataGridModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { Ingredient, IngredientService } from '../ingredient.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    DxTextBoxModule,
    DxButtonModule,
    DxDataGridModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  productId = input<number>();
  @Output() formSaved = new EventEmitter<void>();

  product: any = {};
  ingredients: any[] = [];
  labors: any[] = [];
  allIngredients: Ingredient[] = [];
  productSvc = inject(ProductService);
  ingredientSvc = inject(IngredientService);

  constructor() {}

  ngOnInit(): void {
    const id = this.productId();
    if (id != undefined) {
      this.productSvc.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          this.ingredients = data.ingredients ?? [];
          this.labors = data.labors ?? [];
          console.log('Product loaded:', data);
        },
        error: (err) => {
          console.error('Failed to load product', err);
          notify('Failed to load product details', 'error', 4000);
        },
      });
    }

    this.ingredientSvc.getIngredients().subscribe({
      next: (data: Ingredient[]) => (this.allIngredients = data),
      error: (err: any) => {
        console.error('Failed to load ingredients', err);
      },
    });
  }

  saveProduct() {
    this.formSaved.emit();
  }
}
