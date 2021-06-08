import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  userRole = new BehaviorSubject(null);
  userRole$ = this.userRole.asObservable();

  constructor(private httpClient: HttpClient) {
    if (this.getUserInfo()) this.userRole.next(this.getUserInfo().role);
  }

  doLogin(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.httpClient.post(`${environment.apiURL}/login`, formData);
  }

  doLogout() {
    localStorage.clear();
  }

  refreshToken() {
    return this.httpClient.post(
      `${environment.apiURL}/tokenrequest`,
      new FormData()
    );
  }

  isLoggedIn() {
    return localStorage.getItem('user_info') !== null;
  }

  getUserInfo() {
    return JSON.parse(localStorage.getItem('user_info'));
  }

  getAccessToken() {
    return localStorage.getItem('token');
  }
}
