import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable()
export class AuthHelpers implements HttpInterceptor {
    constructor() { }
    userDetails = JSON.parse(localStorage.getItem('currentUser'));

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ` + this.userDetails.token
            }
        });
        return next.handle(request);
    }
}