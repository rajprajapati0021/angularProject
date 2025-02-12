import { Injectable} from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authStatus = new BehaviorSubject<boolean>(this.isAuthenticated());
  authStatus$ = this.authStatus.asObservable();
  private userClaim : any 

  isAuthenticated() : boolean {
    const token = localStorage.getItem("token") ?? "";

    try {
      const decodedToken: any = jwtDecode(token);
      this.userClaim = decodedToken;
      const expirationDate = decodedToken?.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      return expirationDate > currentTime;
    } 
    catch (error) {
      localStorage.removeItem("token");
      return false;
    }
  }

  userClaims(): any {
    const user = {
      id: this.userClaim?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email : this.userClaim?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role : this.userClaim?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    };
    return user; // Return the user object
  }
  
}

