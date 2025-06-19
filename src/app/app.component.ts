import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DxTabsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  tabs = [
    { text: 'Items', path: '/items' },
    { text: 'Recipes', path: '/recipes' },
    { text: 'Ingredients', path: '/ingredients' },
    { text: 'Settings', path: '/settings' },
  ];
  constructor(private router: Router) {}

  onTabClick(e: any) {
    this.router.navigateByUrl(e.itemData.path);
  }
}
