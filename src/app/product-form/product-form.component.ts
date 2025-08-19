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
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { IngredientService } from '../ingredient.service';
import { Ingredient } from '../models/ingredient.models';
import { IProductList } from '../models/product.models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    DxTextBoxModule,
    DxButtonModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxNumberBoxModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  productId = input<number>();
  @Output() formSaved = new EventEmitter<IProductList>();

  product: any = {};
  ingredients: any[] = [];
  labors: any[] = [];
  units: string[] = [];
  allIngredients: Ingredient[] = [];
  productSvc = inject(ProductService);
  ingredientSvc = inject(IngredientService);

  constructor() {}

  durationEditorOptions = {
    mask: '00:00:00',
    maskRules: { '0': /[0-9]/ },
    useMaskedValue: true,
  };

  formatLaborTime = (rowData: any): string => {
    const rew: string = rowData.totalLaborPerItem;
    if (!rew) return '00:00:00';

    return rew.split('.')[0];
  };

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
      const ingredientId: number = e.row.data.ingredientId;
      this.getUnits(ingredientId);
    }
  }

  getUnits(id: number) {
    this.units = [];
    const ingredient = this.allIngredients.find((x) => x.ingredientId === id);
    if (ingredient) {
      if (ingredient.cups > 0) this.units.push('Cups');
      if (ingredient.tbs > 0) this.units.push('Tbs');
      if (ingredient.tsp > 0) this.units.push('Tsp');
      if (ingredient.pieces > 0) this.units.push('Pieces');
      if (ingredient.pounds > 0) this.units.push('Pounds');
      if (ingredient.oz > 0) this.units.push('Oz');
    }
  }

  getUnitDisplay = (rowData: any) => {
    return rowData.unit ?? '';
  };

  onIngredientIserted(e: any): void {
    const ingredient: any = e.data;

    this.productSvc.calculateIngredientCost(ingredient).subscribe({
      next: (cost: number) => {
        ingredient.totalCostPerItem = cost;
        e.component.refresh();

        this.calculateTotalIngredientCost();
      },
      error: (err: any) => {
        console.error('Failed to calculate ingredient cost', err);
      },
    });
  }

  onIngredientRemoved(): void {
    this.calculateTotalIngredientCost();
  }

  onLaborInserted(e: any): void {
    const labor = e.data;
    this.productSvc.calculateLabor(labor).subscribe({
      next: (result: any) => {
        labor.totalLaborPerItem = result;
        e.component.refresh();

        this.calculateTotalLaborCost();
      },
      error: (err: any) => {
        console.error('Failed to calculate labor cost', err);
      },
    });
  }

  onLaborRemoved(): void {
    this.calculateTotalLaborCost();
  }

  saveProduct() {
    this.product.ingredients = this.ingredients;
    this.product.labors = this.labors;
    this.productSvc.saveProduct(this.product).subscribe({
      next: (savedProduct) => {
        console.log('product saved succesfuly');
        this.formSaved.emit(savedProduct);
      },
      error: (err) => {
        console.error('Error saving product', err);
        notify('Failed to save product', 'error', 4000);
      },
    });
  }

  calculateTotalIngredientCost(): void {
    const totals: number[] = this.ingredients
      .map((i) => i.totalCostPerItem)
      .filter((cost) => typeof cost === 'number');

    this.productSvc.calculateTotalIngredientCost(totals).subscribe({
      next: (total: number) => {
        this.product.ingredientCost = total;

        this.calculateTotal();
      },
      error: (err: any) => {
        console.error('Failed to calculate total ingredient cost', err);
      },
    });
  }

  calculateTotalLaborCost(): void {
    const labors = this.labors.map((row) => ({
      workers: row.workers,
      totalLaborPerItem: row.totalLaborPerItem,
    }));
    this.productSvc.calculateTotalLaborCost(labors).subscribe({
      next: (total: number) => {
        this.product.laborCost = total;

        this.calculateTotal();
      },
      error: (err: any) => {
        console.error('Failed to calculate total labor cost', err);
      },
    });
  }

  calculateTotal(): void {
    this.product.costPrice =
      (this.product.ingredientCost ?? 0) + (this.product.laborCost ?? 0);
    console.log('Total cost calculated:', this.product.costPrice);
  }
}
