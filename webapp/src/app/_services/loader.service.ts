import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private isLoadingVar = new BehaviorSubject<boolean>(false);
  loading$ = this.isLoadingVar.asObservable();

  show(){
    this.isLoadingVar.next(true);
  }

  hide(){
    this.isLoadingVar.next(false);
  }
}
