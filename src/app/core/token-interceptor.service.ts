import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptorService {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.indexOf('login') === -1) {
      if (request.url.indexOf('amazonaws') === -1)
        request = this.addAuthToken(request);
      else request = this.addAuthTokenWithBlob(request);
    }

    return next.handle(request);
  }

  private addAuthToken(request: HttpRequest<any>) {
    return (request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }));
  }

  private addAuthTokenWithBlob(request: HttpRequest<any>) {
    return (request = request.clone({
      setHeaders: {
        responseType: 'blob',
      },
    }));
  }
}
