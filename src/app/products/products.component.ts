import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, viewChild } from '@angular/core';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { IProduct, ProductService } from '../product.service';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { ProductFormComponent } from '../product-form/product-form.component';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    DxPopupModule,
    DxButtonModule,
    ProductFormComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  products: IProduct[] = [];
  selectedProductId?: number;
  popupVisible: boolean = false;
  productSvc = inject(ProductService);
  productGrid = viewChild<DxDataGridComponent>('productGrid');

  constructor() {}

  ngOnInit(): void {
    this.productSvc.getProducts().subscribe({
      next: (data) => (this.products = data),
      error: (err) => {
        console.error('Faild to load products', err);
        notify('Faild to load products', 'error', 4000);
      },
    });
  }

  openForm(productId?: number) {
    this.selectedProductId = productId;
    this.popupVisible = true;
    console.log('opening form for product id', productId);
  }

  deletePorduct(productId: number) {
    const result = confirm(
      'Are you sure you want to delete this recipe?',
      'Delete Confirmation'
    );
    result.then((dialugResult) => {
      if (dialugResult) {
        this.productSvc.deleteProduct(productId).subscribe({
          next: () => {},
          error: (err) => {
            if (err.status === 400 && err.error?.message) {
              notify(err.error.message, 'error', 3000);
            } else if (err.status === 404) {
              notify('recipe not found', 'error', 3000);
            } else {
              console.error('Failed to delete recipe');
            }
          },
        });
      }
    });
  }

  onFormSaved(savedProduct: IProduct) {
    this.popupVisible = false;
    const index = this.products.findIndex(
      (p) => p.productId === savedProduct.productId
    );
    if (index !== -1) {
      this.products[index] = { ...savedProduct };
    } else {
      this.products.push(savedProduct);
    }
    //this.productGrid()?.instance.refresh();
  }
}
