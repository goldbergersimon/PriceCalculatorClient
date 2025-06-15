import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { Item, ItemService } from '../item.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class ItemsComponent implements OnInit {
  items: Item[] = [];
  itemSvc = inject(ItemService);

  constructor() {}

  ngOnInit(): void {
    this.itemSvc.getAllItems().subscribe({
      next: (data) => (this.items = data),
      error: (err) => console.error('Faild to load items', err),
    });
  }
}
