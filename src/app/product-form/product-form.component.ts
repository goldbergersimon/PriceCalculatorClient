import { IProduct, ProductService } from './../product.service';
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
  DxSelectBoxModule,
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
    DxSelectBoxModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  productId = input<number>();
  @Output() formSaved = new EventEmitter<IProduct>();

  product: any = {};
  ingredients: any[] = [];
  labors: any[] = [];
  units: string[] = [];
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

  onFocusedCellChanged(e: any) {
    if (e.column.dataField === 'unit') {
      const ingredientId: number = e.row.data.ingredientID;
      this.getUnits(ingredientId);
    }
  }

  getUnits(id: number) {
    this.units = [];
    const ingredient = this.allIngredients.find((x) => x.ingredientID === id);
    if (ingredient) {
      if (ingredient.cups > 0) this.units.push('Cups');
      if (ingredient.tbs > 0) this.units.push('Tbs');
      if (ingredient.tsp > 0) this.units.push('Tsp');
      if (ingredient.pieces > 0) this.units.push('Pieces');
      if (ingredient.containers > 0) this.units.push('Containers');
      if (ingredient.pounds > 0) this.units.push('Pounds');
      if (ingredient.oz > 0) this.units.push('Oz');
    }
  }

  getUnitDisplay = (rowData: any) => {
    return rowData.unit ?? '';
  };

  saveProduct() {
    this.product.ingredients = this.ingredients;
    this.product.labors = this.labors;
    this.productSvc.saveProduct(this.product).subscribe({
      next: (savedProduct) => {
        notify('product saved successfully', 'succes', 3000);
        this.formSaved.emit(savedProduct);
      },
      error: (err) => {
        console.error('Error saving product', err);
        notify('Failed to save product', 'error', 4000);
      },
    });
  }
}
