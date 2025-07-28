import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';
import { SettingsComponent } from './settings/settings.component';
import { LoginService } from './login.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    DxTabsModule,
    CommonModule,
    DxButtonModule,
    DxPopupModule,
    SettingsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  tabs = [
    { text: 'Items', path: '/items' },
    { text: 'Recipes', path: '/recipes' },
    { text: 'Ingredients', path: '/ingredients' },
  ];
  showSettings: boolean = false;
  private router = inject(Router);
  private loginService = inject(LoginService);
  logedIn = this.loginService.logedIn;

  ngOnInit(): void {
    if (this.loginService.isLogedIn()) {
      this.loginService.logedIn.set(true);
      this.router.navigate(['/items']);
    }
  }

  onTabClick(e: any) {
    if (this.logedIn()) this.router.navigateByUrl(e.itemData.path);
  }
  onSettingsButtonClick() {
    if (this.logedIn()) this.showSettings = true;
  }

  onLoginButtonClick() {
    this.router.navigate(['/login']);
  }

  onLogoutButtonClick() {
    this.router.navigate(['/login']);
    this.loginService.logedIn.set(false);
    this.loginService.logout();
  }

  onSettingsSaved() {
    this.showSettings = false;
    const url = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(url);
    });
  }
}
