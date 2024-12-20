import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  loaderBehaviour = new BehaviorSubject<boolean>(false);
  loader$ = this.loaderBehaviour.asObservable();

  constructor() { }

  show(){
    this.loaderBehaviour.next(true)
  }

  hide(){
    this.loaderBehaviour.next(false)
  }
}
