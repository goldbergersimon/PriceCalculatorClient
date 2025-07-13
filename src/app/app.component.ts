import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DxTabsModule, CommonModule, DxButtonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  tabs = [
    { text: 'Items', path: '/items' },
    { text: 'Recipes', path: '/recipes' },
    { text: 'Ingredients', path: '/ingredients' },
  ];
  constructor(private router: Router) {}

  onTabClick(e: any) {
    this.router.navigateByUrl(e.itemData.path);
  }
  onSettingsButtonClick() {
    this.router.navigateByUrl('/settings');
  }
}
