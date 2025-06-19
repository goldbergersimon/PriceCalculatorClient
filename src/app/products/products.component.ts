import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { IProduct, ProductService } from '../product.service';
import notify from 'devextreme/ui/notify';
import { ProductFormComponent } from '../product-form/product-form.component';
import { DxPopupModule } from 'devextreme-angular';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    DxPopupModule,
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

  onEditingStart(e: any) {
    e.cancel = true; // Prevent the default editing behavior
    const id = e.data.productID;
    this.openForm(id);
  }

  openForm(productId?: number) {
    this.selectedProductId = productId;
    this.popupVisible = true;
    console.log('Opening form for product ID:', productId);
  }

  onFormSaved(savedProduct: IProduct) {
    this.popupVisible = false;
    const index = this.products.findIndex(
      (p) => p.productId === savedProduct.productId
    );
    if (index !== -1) {
      this.products[index] = savedProduct;
    } else {
      this.products.push(savedProduct);
    }
  }
  onInitNewRow(e: any) {
    e.cancel = true; // Prevent the default inserting behavior
    this.openForm();
  }

  onRowRemoving(e: any) {}
}
