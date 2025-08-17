import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private key = 'deviceId';

  getDeviceId(): string {
    let deviceId = localStorage.getItem(this.key);
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(this.key, deviceId);
    }
    return deviceId;
  }
}
