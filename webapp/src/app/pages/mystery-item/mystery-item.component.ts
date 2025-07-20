import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, Observable, takeUntil, map, catchError, take } from 'rxjs';

import { UtilsService } from '../../_services/utils.service';
import { LangService } from '../../_services/lang.service';
import { CountdownService } from '../../_services/countdown.service';
import { LoaderService } from '../../_services/loader.service';
import { ItemsCacheService } from '../../_services/items-cache.service';

import {
  Category,
  ClassType,
  DamageType,
  Item,
  LocalizedPerk,
  Tier,
} from '../../_classes/item';
import { CanComponentDeactivate } from '../../_classes/candeactivate';
import { FilterPipe } from '../../_pipes/filter.pipe';
import { GamemodeService } from '../../_services/gamemode.service';

@Component({
  selector: 'app-mystery-item',
  templateUrl: './mystery-item.component.html',
  styleUrl: './mystery-item.component.scss',
  imports: [CommonModule, ReactiveFormsModule, FilterPipe],
})
export class MysteryItemComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  inputGroup!: FormGroup;
  inputs: string[] = [];
  revealed: number[] = [];
  points = 0;

  isLoading: Observable<boolean>;
  countdown!: Observable<number>;
  currentItem!: Item | null;
  gameStarted = false;

  destroy = new Subject<boolean>();
  hasVictory = new Subject<boolean>();

  filteredItems: Item[] = [];
  tiers!: Tier[];
  categories!: Category[];
  damageTypes!: DamageType[];
  classTypes!: ClassType[];

  itemFound = false;

  thresholds = [
    { time: Number.POSITIVE_INFINITY, revealedProp: 'itemType' },
    { time: Number.POSITIVE_INFINITY, revealedProp: 'flavorText' },
    { time: Number.POSITIVE_INFINITY, revealedProp: 'tier' },
    { time: 30000, revealedProp: 'category' },
    { time: 30000, revealedProp: 'weaponSlot' },
    { time: 20000, revealedProp: 'weaponAmmoType' },
    { time: 20000, revealedProp: 'damageType' },
    { time: 20000, revealedProp: 'classType' },
    { time: 12500, revealedProp: 'intrinsicPerk' },
  ];

  constructor(
    public utilsService: UtilsService,
    private formBuilder: FormBuilder,
    private itemsCacheService: ItemsCacheService,
    private langService: LangService,
    private countdownService: CountdownService,
    private loaderService: LoaderService,
    private router: Router,
    private gamemodeService: GamemodeService
  ) {
    this.utilsService.sidebarLayout.next(true);
    this.isLoading = this.loaderService.loading$;
  }

  ngOnInit(): void {
    this.destroy = new Subject<boolean>();

    this.inputGroup = this.formBuilder.group({
      userInput: ['', Validators.required],
    });

    this.resetSubscriptions();
    this.getItems();
    this.getCategories();
    this.getTiers();
    this.getDamageTypes();
    this.getClassTypes();

    this.openStartModal();
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }

  startCountdown(): void {
    this.resetSubscriptions();
    this.resetHints();
    this.countdown = this.countdownService.startCountdown(40);
    this.gameStarted = true;
    this.setupHintReveals();

    this.countdown
      .pipe(
        map((time) => time === 0),
        takeUntil(this.destroy)
      )
      .subscribe((isOver) => {
        if (isOver) {
          this.gameOver();
        }
      });
  }

  resetSubscriptions(): void {
    this.destroy.next(true);
    this.destroy.complete();
    this.destroy = new Subject<boolean>();
  }

  setupHintReveals(): void {
    this.thresholds.forEach((threshold) => {
      this.countdown
        .pipe(
          map((time) => time <= threshold.time),
          takeUntil(this.destroy)
        )
        .subscribe((shouldReveal) => {
          if (shouldReveal) {
            this.revealHint(threshold.revealedProp);
          }
        });
    });
  }

  revealHint(prop: string): void {
    const el = document.getElementById(prop);
    if (el) el.classList.remove('d-none');
  }

  resetHints(): void {
    this.thresholds.forEach(({ revealedProp }) => {
      const el = document.getElementById(revealedProp);
      if (el) el.classList.add('d-none');
    });
  }

  getItemIdByName(name: string) {
    const validName = this.validateName(name);
    const item = this.filteredItems.find(
      (_item) => this.validateName(<string>_item.localized_name) === validName
    );

    return {
      id: item?.id,
      armorOrWeapon: item?.item_type,
    };
  }

  getItemObjectById(item_type: number, id: number): Item | undefined {
    return this.filteredItems.find(
      (item) => item.id === id && item.item_type === item_type
    );
  }
  revealImage(): void {
    let spanElement = document.getElementById('itemToFind');

    let itemImage = spanElement?.childNodes.item(0) as HTMLImageElement;
    itemImage.src = this.utilsService.createIconLink(
      this.currentItem?.icon_url
    );
    itemImage.alt = <string>this.currentItem?.localized_name;

    spanElement?.classList.add('shine');
    spanElement?.classList.add('vertical-fadeIn-animation-reverse');
  }

  getItemInfo(id: number): void {
    this.itemsCacheService
      .getSingleItem(id, this.langService.currentLocaleID)
      .pipe(
        take(1),
        catchError((error) => {
          this.gameOver();
          return [];
        })
      )
      .subscribe((item: Item) => {
        this.currentItem = item;
      });
  }

  getItemObjectByName(name: string): Item | undefined {
    const validName = this.validateName(name);
    const item = this.filteredItems.find(
      (_item) => this.validateName(<string>_item.localized_name) === validName
    );

    return item;
  }

  submitInput(): void {
    const userInput = this.inputGroup.controls['userInput'].value;
    this.pushInput();
    this.inputGroup.reset();

    const itemIdOrUndefined = this.getCollectibleIdByName(userInput);
    if (
      itemIdOrUndefined === this.currentItem?.id &&
      itemIdOrUndefined !== undefined
    ) {
      this.itemFound = true;
      this.revealImage();
      this.points++;
      this.revealed.push(itemIdOrUndefined);
      this.countdownService.pauseCountdown();

      setTimeout(() => {
        this.currentItem = null;
        const unrevealedItems = this.filteredItems.filter(
          (item) =>
            item.id !== itemIdOrUndefined && !this.revealed.includes(item.id)
        );
        this.getRandomItem(unrevealedItems);
        this.startCountdown();
        this.itemFound = false;
      }, 4000);
    }
  }

  gameOver(): void {
    this.gameStarted = false;
    this.openLossModal();
  }

  pushInput(): void {
    if (this.inputs.length >= 5) this.inputs.shift();
    this.inputs.push(this.inputGroup.controls['userInput'].value);
  }

  openStartModal(): void {
    const modal = document.querySelector(
      '[data-bs-target="#startModal"]'
    ) as HTMLElement;
    modal?.click();
  }

  openLossModal(): void {
    const modal = document.querySelector(
      '[data-bs-target="#lossModal"]'
    ) as HTMLElement;
    modal?.click();
  }

  navigateToGamemodeSelection(): void {
    this.router.navigate(['/gamemode']);
  }

  reloadPage(): void {
    this.gameStarted = false;
    this.points = 0;
    this.revealed = [];
    this.inputs = [];

    this.ngOnInit();
  }

  getRandomItem(listFilteredItems: Item[]): void {
    if (listFilteredItems.length === 0) {
      console.warn('No more items to load.');
      this.gameOver();
      return;
    }

    const listRandomItem =
      listFilteredItems[Math.floor(Math.random() * listFilteredItems.length)];
    this.getItemInfo(listRandomItem.id);
  }

  alreadyRevealed(itemId: number): boolean {
    return this.revealed.includes(itemId);
  }

  getItems(): void {
    if (this.gamemodeService.selectedItems.length === 0) {
      this.itemsCacheService
        .getAllItems(this.langService.currentLocaleID, {
          tier_type: [{ property: 'tier_type', value: '2', label: 'Exotic' }],
        })
        .pipe(takeUntil(this.destroy))
        .subscribe((items: Item[]) => {
          this.filteredItems = items;
          this.getRandomItem(this.filteredItems);
        });
    } else {
      this.filteredItems = this.gamemodeService.selectedItems;
      this.getRandomItem(this.filteredItems);
    }
  }

  getTiers(): void {
    this.itemsCacheService
      .getAllTiers(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((tiers) => (this.tiers = tiers));
  }

  getCategories(): void {
    this.itemsCacheService
      .getAllCategories(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((categories) => (this.categories = categories));
  }

  getDamageTypes(): void {
    this.itemsCacheService
      .getAllDamageTypes(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((types) => (this.damageTypes = types));
  }

  getClassTypes(): void {
    this.itemsCacheService
      .getAllClassTypes(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((classTypes: ClassType[]) => {
        this.classTypes = classTypes;
      });
  }

  validateName(name: string): string {
    return this.utilsService.validateName(name);
  }

  getCollectibleIdByName(name: string): number | undefined {
    const validName = this.validateName(name);
    return this.filteredItems.find(
      (item) => this.validateName(item.localized_name || '') === validName
    )?.id;
  }

  getCollectibleObjectById(id: number): Item | undefined {
    return this.filteredItems.find((item) => item.id === id);
  }

  getCollectibleObjectByName(name: string): Item | undefined {
    const validName = this.validateName(name);
    return this.filteredItems.find(
      (item) => this.validateName(item.localized_name || '') === validName
    );
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return confirm(
      $localize`La mission n'est pas terminée Gardien. Êtes-vous sûr de vouloir quitter ?`
    );
  }

  getCategoryImgPath(currentItem: Item): string | null {
    const basePath = 'assets/img/';
    const subPath = this.utilsService.isWeapon(currentItem)
      ? 'weapon_categories/'
      : 'armor_categories/';

    const categoryObj = this.categories.find(
      (c) => c.id === currentItem.category
    );
    let fileName: string;
    // Grenade launchers case
    if (categoryObj?.name === 'Grenade Launchers') {
      const isHeavy = currentItem.weapon_ammo_type === 3 ? '_heavy' : '';
      fileName = categoryObj?.id_bungie + isHeavy + '.svg';
    } else {
      fileName = categoryObj?.id_bungie + '.svg';
    }

    const fullPath = basePath + subPath + fileName;

    return fullPath;
  }

  getClassTypeImgPath(currentItem: Item): string | null {
    const basePath = 'assets/img/class_types/';

    const classTypeObj = this.classTypes.find(
      (c) => c.id === currentItem.class_type
    );
    const fileName = classTypeObj?.id_bungie + '.svg';

    const fullPath = basePath + fileName;

    return fullPath;
  }

  getAmmoTypeImgPath(currentItem: Item): string | null {
    const basePath = 'assets/img/ammo_types/';

    const fileName = currentItem.weapon_ammo_type + '.svg';

    const fullPath = basePath + fileName;

    return fullPath;
  }

  getIntrinsicPerk(currentItem: Item): LocalizedPerk | undefined {
    return currentItem.localized_perks.find((perk) => perk.is_intrinsic);
  }
}
