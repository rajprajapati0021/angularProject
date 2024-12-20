import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  authService = inject(AuthService);
  loaderService = inject(LoaderService)
  router = inject(Router);
  private requests : HttpRequest<any>[] = [];
  private isLoadingRequired : Boolean = false;

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token'); // Replace with secure token retrieval logic
    
    // Redirect to login if user is not authenticated
    if(token){
      if (!this.authService.isAuthenticated() && !req.url.includes('/login')) {
        console.warn('User not authenticated. Redirecting to login.');
        this.router.navigate(['/login']);
        localStorage.clear();
        return throwError(() => new Error('User not authenticated'));
      } 
    }

    const modifiedRequest = token
      ? req.clone({
          setHeaders: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            'ngrok-skip-browser-warning': '1',
          },
        })
      : req;
      
      const route = new URL(modifiedRequest.url).pathname;

      let headerValue = modifiedRequest.headers.get("isloadingrequired");
      this.isLoadingRequired = headerValue === "true";
      if(this.isLoadingRequired) {
         console.log("set true ")
          this.requests.push(modifiedRequest);
          console.log(this.requests.length, "after push")
          this.loaderService.show();
        }
      
    // Pass the modified request
    return next.handle(modifiedRequest).pipe(

      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.handleSuccess(event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      }),
      finalize(()=>{
          this.removeRequest(modifiedRequest);
      })
    );
  }

  private handleSuccess(response: HttpResponse<any>) {
    switch (response.status) {
      case 200:
        console.log('Request successful.');
        break;
      case 201:
        console.log('Record created successfully.');
        break;
      case 204:
        console.log('Record updated successfully.');
        break;
      default:
        console.log(`Response status: ${response.status}`);
        break;
    }
  }

  private handleError(error: HttpErrorResponse) {
    switch (error.status) {
      case 400:
        console.error('Bad request.');
        break;
      case 401:
        console.error('Unauthorized request. Redirecting to login.');
        this.router.navigate(['/login']);
        break;
      case 403:
        console.error('Forbidden.');
        break;
      case 404:
        console.error('Resource not found.');
        break;
      case 500:
        console.error('Internal server error.');
        break;
      default:
        console.error(`Error occurred with status: ${error.status}`);
        break;
    }
  }

  private removeRequest(httpRequest : HttpRequest<any>){
      let index = this.requests.indexOf(httpRequest)
      this.requests.splice(index,1);
      console.log(this.requests.length,"req letgh")
      if(this.requests.length == 0 ){
        this.loaderService.hide();
      }
  }
}
