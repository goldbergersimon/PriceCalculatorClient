import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface IProduct {
  productId: number;
  name: string;
  costPrice: number;
  container: number;
  pieces: number;
  oz: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'https://localhost:7292/api/product';
  http = inject(HttpClient);

  constructor() {}

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  saveProduct(product: any): Observable<any> {
    if (!product.productID) {
      return this.http.post<any>(this.apiUrl, product);
    } else {
      return this.http.put<any>(`this.apiUrl/${product.productID}`, product);
    }
  }
}
