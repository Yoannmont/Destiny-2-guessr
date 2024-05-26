import { Injectable } from '@angular/core';
import { Filter } from '../_classes/filter';

@Injectable({
  providedIn: 'root'
})
export class GamemodeService {
  filters : Array<Filter> = [];
  constructor() { }


  
}
