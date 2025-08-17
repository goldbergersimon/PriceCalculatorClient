import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IItemList } from './models/item.models';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  apiUrl = 'https://localhost:7292/api/item';
  http = inject(HttpClient);

  constructor() {}

  getAllItems(): Observable<IItemList[]> {
    return this.http.get<IItemList[]>(this.apiUrl);
  }

  getItemById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getOfficeExpences(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-office-expences`);
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
