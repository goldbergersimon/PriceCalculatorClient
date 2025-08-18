import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type SettingKeys =
  | 'HourlyRate'
  | 'Rent'
  | 'OfficePayroll'
  | 'Machinery'
  | 'Supplies'
  | 'Marketing'
  | 'Utilities'
  | 'SoftwareExpenses'
  | 'UnitsPerMonth';

export interface Settings {
  key: SettingKeys;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settings`; //'https://localhost:7292/api/settings';

  get(): Observable<Settings[]> {
    return this.http.get<Settings[]>(this.apiUrl);
  }

  SaveSettings(settings: Settings[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, settings);
  }
}
