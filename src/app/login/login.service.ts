import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SignUpFormData } from './sign-up-form-data';
import { SignInFormData } from './sign-in-form-data';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {}
  private baseUrl = environment.baseUrl;
  headerOption = new HttpHeaders({ 'Content-Type': 'application/json' })

  signUp(signUpFormData : SignUpFormData) : Observable<SignUpFormData> {
    return this.http.post<SignUpFormData>(`${this.baseUrl}/user/sign-up`,signUpFormData)
  }

  signIn(signInFormData : SignInFormData) : Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user/sign-in`,signInFormData)
  }

  getUserDetail(userId : bigint | null, email : string | null) : Observable<SignUpFormData[]>{
    
    let params = new HttpParams();
    if (userId)  params = params.append('userId', userId.toString());
    if (email)  params = params.append('email', email.toString());
    return this.http.get<SignUpFormData[]>(`${this.baseUrl}/user`, {params})
  }


}
