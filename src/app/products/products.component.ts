import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
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
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: IProduct[] = [];
  selectedProductId?: number;
  popupVisible: boolean = false;
  productSvc = inject(ProductService);

  constructor() {}

  ngOnInit(): void {
    this.productSvc.getProducts().subscribe({
      next: (data) => (this.products = data),
      error: (err) => {
        console.error('Faild to load recipes', err);
        notify('Faild to load recipes', 'error', 4000);
      },
    });
  }

  openForm(productId?: number) {
    this.selectedProductId = productId;
    this.popupVisible = true;
    console.log('opening form for product id', productId);
  }

  deletePorduct(productId: number): void {
    const result = confirm(
      'Are you sure you want to delete this recipe?',
      'Delete Confirmation'
    );
    result.then((dialugResult) => {
      if (dialugResult) {
        this.productSvc.deleteProduct(productId).subscribe({
          next: () => {
            this.products = this.products.filter(
              (p) => p.productId !== productId
            );
          },
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

  onFormSaved(savedProduct: IProduct): void {
    this.popupVisible = false;
    const index = this.products.findIndex(
      (p) => p.productId === savedProduct.productId
    );
    if (index !== -1) {
      this.products[index] = { ...savedProduct };
    } else {
      this.products.push(savedProduct);
    }
  }
}
