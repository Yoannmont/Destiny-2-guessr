import { Component, OnDestroy, OnInit } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LangService } from '../../_services/lang.service';
import { FilterPipe } from '../../_pipes/filter.pipe';
import { TimerService } from '../../_services/timer.service';
import { LoaderService } from '../../_services/loader.service';
import { GamemodeService } from '../../_services/gamemode.service';
import { CanComponentDeactivate } from '../../_classes/candeactivate';
import { Category, DamageType, Item, Tier } from '../../_classes/item';
import { ItemsCacheService } from '../../_services/items-cache.service';

@Component({
  selector: 'app-exo-challenge',
  templateUrl: './exo-challenge.component.html',
  styleUrl: './exo-challenge.component.scss',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FilterPipe,
  ],
})
export class ExoChallengeComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  isLoading: Observable<boolean>;

  inputs: Array<string> = [];
  inputGroup!: FormGroup;

  items!: Item[];
  filteredItems: Item[] = [];
  tiers!: Tier[];
  categories!: Category[];
  damageTypes!: DamageType[];

  destroy: Subject<boolean>;
  points: number = 0;
  revealed: Array<any> = [];
  timer!: Observable<number>;

  hasVictory!: Subject<boolean>;

  constructor(
    public utilsService: UtilsService,
    private formBuilder: FormBuilder,
    private itemsCacheService: ItemsCacheService,
    private langService: LangService,
    private timerService: TimerService,
    private loaderService: LoaderService,
    private gamemodeService: GamemodeService,
    private router: Router
  ) {
    this.utilsService.sidebarLayout.next(true);
    this.destroy = new Subject<boolean>();
    this.hasVictory = new Subject<boolean>();
    this.timer = this.timerService.getElapsed();
    this.isLoading = this.loaderService.loading$;
  }

  ngOnInit(): void {
    this.getItems();
    this.getCategories();
    this.getTiers();
    this.getDamageTypes();

    this.inputGroup = this.formBuilder.group({
      userInput: ['', Validators.required],
    });

    this.openStartModal();
  }

  ArmorOrWeapon(item: Item | undefined): string {
    if (item) {
      return item.item_type === 1 ? 'weapon' : 'armor';
    }
    return 'undefined';
  }

  navigateToGamemodeSelection(): void {
    this.router.navigate(['/gamemode']);
  }

  openStartModal(): void {
    this.resetTimer();
    const startModal = document.querySelector(
      '[data-bs-target="#startModal"]'
    ) as HTMLElement;
    startModal.click();
  }

  openVictoryModal(): void {
    this.stopTimer();
    (
      document.querySelector('[data-bs-target="#victoryModal"]') as HTMLElement
    ).click();
  }

  resetTimer(): void {
    this.timerService.stopTimer();
    this.timerService.resetTimer();
  }

  pushInput(): void {
    if (this.inputs.length >= 5) {
      this.inputs.shift();
    }
    this.inputs.push(this.inputGroup.controls['userInput'].value);
  }

  submitInput(): void {
    const userInput = this.inputGroup.controls['userInput'].value;
    this.pushInput();
    this.inputGroup.reset();

    const { id, armorOrWeapon } = this.getItemIdByName(userInput);
    if (armorOrWeapon && id) {
      if (!this.alreadyRevealed(id)) {
        this.revealImage(armorOrWeapon, id);
        this.points++;
        this.revealed.push({ id: id, armorOrWeapon: armorOrWeapon });
        this.checkVictory();
      }
    }
  }

  alreadyRevealed(itemId: number): boolean {
    return this.revealed.filter((item) => item.id === itemId).length != 0;
  }

  checkVictory(): void {
    if (this.points === this.filteredItems.length) {
      this.openVictoryModal();
    }
  }

  startTimer(): void {
    this.timerService.startTimer();
  }
  stopTimer(): void {
    if (this.timerService.isRunning()) this.timerService.stopTimer();
  }

  revealImage(armorOrWeapon: string, id: number): void {
    const item = this.getItemObjectById(armorOrWeapon, id);
    let spanElement = document.getElementById(
      `${this.ArmorOrWeapon(item!)}-${id}`
    );

    let itemImage = spanElement?.childNodes.item(0) as HTMLImageElement;
    itemImage.src = this.utilsService.createIconLink(item?.icon_url);
    itemImage.alt = <string>item?.localized_name;

    spanElement?.classList.add('shine');
    spanElement?.classList.add('vertical-fadeIn-animation-reverse');
    spanElement?.classList.add('pointer');
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
        });
    } else {
      this.filteredItems = this.gamemodeService.selectedItems;
    }
  }

  getDamageTypes(): void {
    this.itemsCacheService
      .getAllDamageTypes(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((damageTypes: DamageType[]) => {
        this.damageTypes = damageTypes;
      });
  }

  getTiers(): void {
    this.itemsCacheService
      .getAllTiers(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((tiers: Tier[]) => {
        this.tiers = tiers;
      });
  }

  getCategories(): void {
    this.itemsCacheService
      .getAllCategories(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((categories: Category[]) => {
        this.categories = categories;
      });
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
  }

  validateName(name: string): string {
    return this.utilsService.validateName(name);
  }

  getItemIdByName(name: string, maxDistance = 2) {
    const inputName = this.validateName(name);

    let closestItem: any = null;
    let minDistance = Infinity;

    for (const item of this.filteredItems) {
      const itemName = this.validateName(item.localized_name as string);
      const distance = this.levenshteinDistance(inputName, itemName);

      if (distance < minDistance && distance <= maxDistance) {
        minDistance = distance;
        closestItem = item;
      }
    }

    return {
      id: closestItem?.id,
      armorOrWeapon: this.ArmorOrWeapon(closestItem),
    };
  }

  getItemObjectByName(name: string, maxDistance = 2): Item | undefined {
    const inputName = this.validateName(name);

    let closestItem: Item | undefined;
    let minDistance = Infinity;

    for (const item of this.filteredItems) {
      const itemName = this.validateName(item.localized_name as string);
      const distance = this.levenshteinDistance(inputName, itemName);

      if (distance < minDistance && distance <= maxDistance) {
        minDistance = distance;
        closestItem = item;
      }
    }

    return closestItem;
  }

  levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1, // suppression
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  getItemObjectById(armorOrWeapon: string, id: number): Item | undefined {
    return this.filteredItems.find(
      (item) => item.id === id && this.ArmorOrWeapon(item) === armorOrWeapon
    );
  }

  convertToDateTime(timerValue: number | null): string {
    if (timerValue == null) {
      return `0:00:00.0`;
    }
    const value = Math.floor(timerValue / 100);

    const totalDeciseconds = value;
    const totalSeconds = Math.floor(totalDeciseconds / 10);
    const dms = totalDeciseconds % 10;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${h}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}.${dms}`;
  }

  toggleTooltip(event: MouseEvent, type: string, id: number): void {
    const tooltipId = `tooltip-${type}-${id}`;
    const tooltip = document.getElementById(tooltipId);
    if (tooltip && this.alreadyRevealed(id)) {
      tooltip.classList.toggle('d-none');
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.points !== this.filteredItems.length) {
      return confirm(
        $localize`La mission n'est pas terminée Gardien. Êtes-vous sûr de vouloir quitter ?`
      );
    }
    return true;
  }
}
