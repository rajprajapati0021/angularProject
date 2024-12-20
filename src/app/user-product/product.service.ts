import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Like } from '../models/like';
import { Product } from '../models/product';
import { Comment } from '../models/comment';
import { RequestOptions } from 'https';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http : HttpClient) { }
  baseUrl = environment.baseUrl
   reqOptions : any = {
    showLoadingIndicator: false
   }
  addProduct(product : any) : Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/product/add-product`, product)
  }

  getProducts(productId: bigint | null): Observable<Product[]> {
    const params = new HttpParams();
    if(productId != null) params.append("productId",productId.toString())
    return this.http.get<Product[]>(`${this.baseUrl}/product/get-product`, { params , headers : {"isLoadingRequired": 'true'} });
  }

  getAllProducts(): Observable<Product[]> {
    const params = new HttpParams();
    return this.http.get<Product[]>(`${this.baseUrl}/product/get-all-product`, {headers : {"isLoadingRequired": 'true'}});
  }

  deleteProduct(productId : bigint): Observable<any>{

    const params = new HttpParams();
    params.append('productId',productId.toString())
    return this.http.post<any>(`${this.baseUrl}/product/delete-product`,productId)

  }

  likeUnlikeProduct(like : Like) : Observable<boolean>{
    return this.http.post<boolean>(`${this.baseUrl}/product/like-unlike-product`,like)
  }

  addComment(comment : Comment) : Observable<Comment>{
    return this.http.post<Comment>(`${this.baseUrl}/product/add-comment`,comment)
  }

  GetAllComments(productId : bigint) : Observable<Comment[]>{
    return  this.http.get<Comment[]>(`${this.baseUrl}/product/get-comments`, {
      params: { "productId" : productId.toString() }
    });
  }

  deleteComment(commentId : number): Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/product/delete-comment`,null,{params:{'commentId':commentId}})
  }
  
}
