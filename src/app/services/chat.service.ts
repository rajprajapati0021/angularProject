import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http : HttpClient) { }
  baseUrl = environment.baseUrl
   reqOptions : any = {
    showLoadingIndicator: false
   }
  addUpdateMessage(message : any) : Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/chat/add-update-message`, message)
  }

  getMessages(friendUserId: Number): Observable<Message[]> {
    let params = new HttpParams();
    params = params.append('friendUserId', friendUserId.toString());
    return this.http.get<Message[]>(`${this.baseUrl}/chat/get-all-message`, {params});
  }

}
