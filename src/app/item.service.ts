import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Item {
  itemId: number;
  itemName: string;
  costPrice: number;
  ownPrice: number;
  wholesalePeice: number;
  retailPrice: number;
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  apiUrl = 'https://localhost:7292/api/item';
  http = inject(HttpClient);

  constructor() {}

  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }
}
