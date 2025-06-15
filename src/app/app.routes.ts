import { Routes } from '@angular/router';
import { IngredientComponent } from './ingredient/ingredient.component';
import { ProductsComponent } from './products/products.component';
import { ItemsComponent } from './items/items.component';
import { SettingsComponent } from './settings/settings.component';
import { ProductFormComponent } from './product-form/product-form.component';

export const routes: Routes = [
  { path: 'ingredients', component: IngredientComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'items', component: ItemsComponent },
  { path: 'settings', component: ProductFormComponent },
  { path: '', redirectTo: 'ingredients', pathMatch: 'full' },
];
