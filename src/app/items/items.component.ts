import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { Item, ItemService } from '../item.service';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import { ItemFormComponent } from '../item-form/item-form.component';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    ItemFormComponent,
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class ItemsComponent implements OnInit {
  items: Item[] = [];
  popupVisible: boolean = false;
  selectedItemId?: number;
  itemSvc = inject(ItemService);

  constructor() {}

  ngOnInit(): void {
    this.itemSvc.getAllItems().subscribe({
      next: (data) => (this.items = data),
      error: (err) => console.error('Faild to load items', err),
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
          error: (err: any) => {
            console.error('Failed to delete recipe', err);
          },
        });
      }
    });
  }

  onFormSaved(item: any): void {
    this.popupVisible = false;
    const index = this.items.findIndex((p) => p.itemId === item.itemId);
    if (index !== -1) {
      this.items[index] = { ...item };
    } else {
      this.items.push(item);
    }
  }
}
