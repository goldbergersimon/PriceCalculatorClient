import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { ItemService } from '../../services/item.service';
import {
  DxButtonModule,
  DxLoadIndicatorModule,
  DxPopupModule,
} from 'devextreme-angular';
import { ItemFormComponent } from '../item-form/item-form.component';
import { confirm } from 'devextreme/ui/dialog';
import { IItemList } from '../../models/item.models';
import notify from 'devextreme/ui/notify';
import { LoginService } from '../../services/login.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    ItemFormComponent,
    DxLoadIndicatorModule,
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class ItemsComponent implements OnInit {
  items: IItemList[] = [];
  popupVisible = false;
  selectedItemId?: number;
  itemSvc = inject(ItemService);
  loginService = inject(LoginService);
  loading = this.loginService.loading;

  ngOnInit(): void {
    this.loading.set(true);

    console.log('Loading items...');

    this.itemSvc.getAllItems().subscribe({
      next: (data) => {
        console.log('Items loaded:', data);
        this.items = data;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Faild to load items', err);
        this.loading.set(false);
        notify('Faild to load items', 'error', 3000);
      },
    });
  }

  openForm(itemId?: number): void {
    this.selectedItemId = itemId;
    this.popupVisible = true;
    console.log('Opening form for item id', itemId);
  }

  deleteItem(itemId: number): void {
    const result = confirm(
      'Are you sure you want to delete this recipe?',
      'Delete Confirmation'
    );
    result.then((dialugResult) => {
      if (dialugResult) {
        this.itemSvc.deleteItem(itemId).subscribe({
          next: () => {
            this.items = this.items.filter((p) => p.itemId !== itemId);
            console.log('Item deleted successfully');
          },
          error: (err: HttpErrorResponse) => {
            console.error('Failed to delete recipe', err);
          },
        });
      }
    });
  }

  onFormSaved(item: IItemList): void {
    this.popupVisible = false;
    const index = this.items.findIndex((p) => p.itemId === item.itemId);
    if (index !== -1) {
      this.items[index] = { ...item };
    } else {
      this.items.push(item);
    }
  }
}
