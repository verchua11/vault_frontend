import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './models/user.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject<User>(null);
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post(`${environment.apiURL}/login`, formData).pipe(
      map((response: any) => {
        localStorage.setItem(
          'expiry',
          response.authentication.expires_in + 3600000
        );
        localStorage.setItem('token', response.authentication.access_token);
        localStorage.setItem('user_info', JSON.stringify(response.user_info));

        const user = response.user_info as User;
        this.userSubject.next(user);
        return user;
      })
    );
  }

  logout() {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken() {
    return this.http
      .post(`${environment.apiURL}/tokenrequest`, new FormData())
      .pipe(
        map((response: any) => {
          localStorage.setItem(
            'expiry',
            response.access_token.expires_in + 3600000
          );
          localStorage.setItem('token', response.access_token.access_token);
          const user = JSON.parse(localStorage.getItem('user_info')) as User;
          this.userSubject.next(user);
          return response;
        })
      );
  }
}
