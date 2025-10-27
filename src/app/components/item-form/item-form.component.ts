import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  DxButtonModule,
  DxDataGridModule,
  DxNumberBoxModule,
  DxSwitchModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import {
  FocusedCellChangedEvent,
  RowInsertedEvent,
} from 'devextreme/ui/data_grid';
import { ValueChangedEvent } from 'devextreme/ui/number_box';
import { ValueChangedEvent as SwitchChangedEvent } from 'devextreme/ui/switch';

import { forkJoin } from 'rxjs';

import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { IngredientService } from '../../services/ingredient.service';
import { IIngredient } from '../../models/ingredient.models';
import {
  IItem,
  IItemIngredient,
  IItemLabor,
  IItemList,
  IItemProduct,
} from '../../models/item.models';
import { IProductList } from '../../models/product.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxButtonModule,
    DxNumberBoxModule,
    DxSwitchModule,
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
})
export class ItemFormComponent implements OnInit {
  itemId = input<number>();
  itemSvc = inject(ItemService);
  productSvc = inject(ProductService);
  ingredientSvc = inject(IngredientService);
  @Output() formSaved = new EventEmitter<IItemList>();
  item: IItem = {} as IItem;
  products: IItemProduct[] = [];
  labors: IItemLabor[] = [];
  ingredients: IItemIngredient[] = [];
  productUnits: string[] = [];
  ingredientUnits: string[] = [];
  allProducts: IProductList[] = [];
  allIngredients: IIngredient[] = [];

  durationEditorOptions = {
    mask: '00:00:00',
    maskRules: { '0': /[0-9]/ },
    useMaskedValue: true,
  };

  ngOnInit(): void {
    const id = this.itemId();
    if (id != undefined) {
      this.itemSvc.getItemById(id).subscribe({
        next: (data: IItem) => {
          this.item = data;
          this.products = data.products ?? [];
          this.labors = data.labors ?? [];
          this.ingredients = data.ingredients ?? [];

          console.log('Loaded item:', this.item);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to load item', err);
          notify('Failed to load item details', 'error', 4000);
        },
      });
    } else {
      this.item = {} as IItem;
      this.item.includeOfficeExpenses = true;
      this.itemSvc.getOfficeExpences().subscribe({
        next: (value: number) => {
          this.item.officeExpenses = value;
        },
        error: (err: HttpErrorResponse) => {
          console.error('error', err);
        },
      });
    }

    this.productSvc.getProducts().subscribe({
      next: (data: IProductList[]) => {
        this.allProducts = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load products', err);
      },
    });
    this.ingredientSvc.getIngredients().subscribe({
      next: (data: IIngredient[]) => {
        this.allIngredients = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load ingredients', err);
      },
    });
  }

  onFocusedCellChangedP(e: FocusedCellChangedEvent): void {
    if (e.column?.dataField === 'unit') {
      const productId: number = e.row?.data.productId;
      this.getProductUnits(productId);
    }
  }
  onFocusedCellChangedI(e: FocusedCellChangedEvent): void {
    if (e.column?.dataField === 'unit') {
      const ingredientId: number = e.row?.data.ingredientId;
      this.getIngredientUnits(ingredientId);
    }
  }

  getIngredientUnits(id: number): void {
    this.ingredientUnits = [];
    const ingredient = this.allIngredients.find((x) => x.ingredientId === id);
    if (ingredient) {
      if (ingredient.cups > 0) this.ingredientUnits.push('Cups');
      if (ingredient.tbs > 0) this.ingredientUnits.push('Tbs');
      if (ingredient.tsp > 0) this.ingredientUnits.push('Tsp');
      if (ingredient.pieces > 0) this.ingredientUnits.push('Pieces');
      if (ingredient.pounds > 0) this.ingredientUnits.push('Pounds');
      if (ingredient.oz > 0) this.ingredientUnits.push('Oz');
    }
  }

  formatLaborTime = (rowData: IItemLabor): string => {
    const rew: string = rowData.totalLaborPerItem;
    if (!rew) return '00:00:00';

    return rew.split('.')[0];
  };

  getProductUnits(id: number): void {
    this.productUnits = [];
    const product = this.allProducts.find((x) => x.productId === id);
    if (product) {
      if ((product.container ?? 0) > 0) this.productUnits.push('Containers');
      if ((product.pieces ?? 0) > 0) this.productUnits.push('Pieces');
      if ((product.oz ?? 0) > 0) this.productUnits.push('Oz');
    }
  }
  onProductIserted(e: RowInsertedEvent): void {
    const product: IItemProduct = e.data;
    console.log('Inserting product:', product);
    this.itemSvc.calculateProductCost(product).subscribe({
      next: (cost: number) => {
        product.total = cost;
        e.component.refresh();
        this.calculateTotalMaterialCost();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to calculate product cost', err);
      },
    });
  }
  onIngredientIserted(e: RowInsertedEvent) {
    const ingredient: IItemIngredient = e.data;

    this.itemSvc.calculateIngredientCost(ingredient).subscribe({
      next: (cost: number) => {
        ingredient.totalCostPerItem = cost;
        e.component.refresh();

        this.calculateTotalMaterialCost();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to calculate ingredient cost', err);
      },
    });
  }
  onLaborInserted(e: RowInsertedEvent): void {
    const labor = e.data;
    this.productSvc.calculateLabor(labor).subscribe({
      next: (result: string) => {
        labor.totalLaborPerItem = result;
        e.component.refresh();

        this.calculateTotalLaborCost();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to calculate labor cost', err);
      },
    });
  }

  onProductRemoved(): void {
    this.calculateTotalMaterialCost();
  }
  onIngredientRemoved(): void {
    this.calculateTotalMaterialCost();
  }
  onLaborRemoved(): void {
    this.calculateTotalLaborCost();
  }

  calculateTotalMaterialCost(): void {
    const totalsI: number[] = this.ingredients
      .map((i) => i.totalCostPerItem)
      .filter((cost) => typeof cost === 'number');

    const totalsP: number[] = this.products
      .map((p) => p.total)
      .filter((cost) => typeof cost === 'number');

    const totals: number[] = [...totalsI, ...totalsP];

    this.productSvc.calculateTotalIngredientCost(totals).subscribe({
      next: (total: number) => {
        this.item.materialCost = total;
        this.calculateTotal();
      },
      error: (err: HttpErrorResponse) => {
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
        this.item.laborCost = total;
        this.calculateTotal();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to calculate total labor cost', err);
      },
    });
  }

  calculateTotal(): void {
    this.item.costPrice =
      (this.item.materialCost ?? 0) +
      (this.item.laborCost ?? 0) +
      (this.item.officeExpenses ?? 0);
    this.recalculateMarginsAndProfits();
  }

  onRetailChanged(e: ValueChangedEvent) {
    const margin: number = e.value;
    const cost: number = this.item.costPrice;

    const payload = { margin: margin, cost: cost };
    this.itemSvc.CalculateProfitMargin(payload).subscribe({
      next: (result) => {
        this.item.retailPrice = result.selling;
        this.item.retailProfit = result.profit;
        this.calculateBoxPrices();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to calculate retail price', err);
      },
    });
  }

  onWholesaleChanged(e: ValueChangedEvent) {
    const margin: number = e.value;
    const cost = this.item.costPrice;

    const payload = { margin: margin, cost: cost };
    this.itemSvc.CalculateProfitMargin(payload).subscribe({
      next: (result) => {
        this.item.wholesalePrice = result.selling;
        this.item.wholesaleProfit = result.profit;
        this.calculateBoxPrices();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to calculate retail price', err);
      },
    });
  }

  onOwnChanged(e: ValueChangedEvent) {
    const selling: number = e.value;
    const cost: number = this.item.costPrice;

    const payload = { selling: selling, cost: cost };
    this.itemSvc.CalculateMarginProfit(payload).subscribe({
      next: (result) => {
        this.item.ownProfit = result.profit;
        this.item.ownMargin = result.margin;
        this.calculateBoxPrices();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to calculate own price', err);
      },
    });
  }

  recalculateMarginsAndProfits() {
    const cost = this.item.costPrice;

    const requests = [];

    if (this.item.retailMargin > 0) {
      requests.push(
        this.itemSvc.CalculateProfitMargin({
          margin: this.item.retailMargin,
          cost,
        })
      );
    }
    if (this.item.wholesaleMargin > 0) {
      requests.push(
        this.itemSvc.CalculateProfitMargin({
          margin: this.item.wholesaleMargin,
          cost,
        })
      );
    }
    if (this.item.ownPrice > 0) {
      requests.push(
        this.itemSvc.CalculateMarginProfit({
          selling: this.item.ownPrice,
          cost,
        })
      );
    }

    if (requests.length > 0) {
      forkJoin(requests).subscribe({
        next: (results) => {
          if (this.item.retailMargin > 0) {
            const retailResult = results.shift();
            this.item.retailPrice = retailResult?.selling;
            this.item.retailProfit = retailResult?.profit;
          }
          if (this.item.wholesaleMargin > 0) {
            const wholesaleResult = results.shift();
            this.item.wholesalePrice = wholesaleResult?.selling;
            this.item.wholesaleProfit = wholesaleResult?.profit;
          }
          if (this.item.ownPrice > 0) {
            const ownResult = results.shift();
            this.item.ownProfit = ownResult?.profit;
            this.item.ownMargin = ownResult?.margin;
          }
          this.calculateBoxPrices();
        },
      });
    }
  }

  changeOfficeExpenses(e: SwitchChangedEvent): void {
    const on: boolean = e.value;
    if (on) {
      this.itemSvc.getOfficeExpences().subscribe({
        next: (value) => {
          this.item.officeExpenses = value;
          this.calculateTotal();
        },
        error: (err: HttpErrorResponse) => {
          console.error('error', err);
        },
      });
    } else {
      this.item.officeExpenses = 0;
      this.calculateTotal();
    }
  }

  onInputChanged() {
    this.calculateBoxPrices();
  }

  calculateBoxPrices() {
    const piecesPerBox: number = this.item.piecesPerBox;
    this.item.retailBox = this.item.retailPrice * piecesPerBox;
    this.item.wholesaleBox = this.item.wholesalePrice * piecesPerBox;
    this.item.ownBox = this.item.ownPrice * piecesPerBox;
  }

  saveItem() {
    this.item.products = this.products;
    this.item.labors = this.labors;
    this.item.ingredients = this.ingredients;
    this.itemSvc.saveItem(this.item).subscribe({
      next: (data) => {
        this.formSaved.emit(data);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to save item', err);
        notify('Failed to save item', 'error', 4000);
      },
    });
  }
}
