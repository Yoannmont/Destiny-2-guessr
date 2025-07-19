import { Injectable } from '@angular/core';
import { Item } from '../_classes/item';

@Injectable({
  providedIn: 'root',
})
export class GamemodeService {
  selectedItems: Item[] = [];

  mysteryWeaponParams = {};
  exoChallengeParams = {};
  constructor() {}
}
