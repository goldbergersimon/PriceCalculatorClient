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

  getItemById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  saveItem(item: any): Observable<any> {
    if (item.itemId) {
      return this.http.put<any>(`${this.apiUrl}/${item.itemId}`, item);
    } else {
      return this.http.post<any>(this.apiUrl, item);
    }
  }
  deleteItem(itemId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${itemId}`);
  }
  calculateIngredientCost(ingredient: any): Observable<number> {
    return this.http.post<number>(
      `${this.apiUrl}/calculate-ingredient`,
      ingredient
    );
  }

  calculateProductCost(product: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/calculate-product`, product);
  }

  CalculateProfitMargin(data: {
    margin: number;
    cost: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculate-profit`, data);
  }

  CalculateMarginProfit(data: {
    selling: number;
    cost: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculate-margin-profit`, data);
  }
}
