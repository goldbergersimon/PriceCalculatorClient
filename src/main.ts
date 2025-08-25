import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { locale } from 'devextreme/localization';

locale('en-US');

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
