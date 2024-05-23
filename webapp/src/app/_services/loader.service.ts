import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoadingVar = new Subject<boolean>();

  show(){
    this.isLoadingVar.next(true);
  }

  hide(){
    this.isLoadingVar.next(false);
  }

  get isLoading(){
    return this.isLoadingVar;
  }
}
