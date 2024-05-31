import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CollectiblesCacheService } from '../../_services/collectibles-cache.service';
import { LangService } from '../../_services/lang.service';
import { Subject, Observable, takeUntil, map, tap, timeInterval } from 'rxjs';
import {
  Weapon,
  Tier,
  Category,
  DamageType,
  Type,
} from '../../_classes/weapon';
import { GamemodeService } from '../../_services/gamemode.service';
import { TimerService } from '../../_services/timer.service';
import { CanComponentDeactivate } from '../../_classes/candeactivate';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FilterPipe } from '../../_pipes/filter.pipe';
import { CountdownService } from '../../_services/countdown.service';
import { LoaderService } from '../../_services/loader.service';

@Component({
  selector: 'app-mystery-weapon',
  standalone: true,
  templateUrl: './mystery-weapon.component.html',
  styleUrl: './mystery-weapon.component.scss',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FilterPipe],
})
export class MysteryWeaponComponent implements OnInit, CanComponentDeactivate {
  inputs: Array<string> = [];
  inputGroup!: FormGroup;

  isLoading: Observable<boolean>;

  weapons!: Weapon[];
  filteredWeapons!: Weapon[];
  tiers!: Tier[];
  categories!: Category[];
  types!: Type[];
  damageTypes!: DamageType[];

  destroy: Subject<boolean>;
  points: number = 0;
  revealed: Array<number> = [];
  countdown!: Observable<number>;

  hasVictory!: Subject<boolean>;

  currentWeapon!: Weapon;

  thresholds : Array<Observable<boolean>> = [];

  gameStarted: boolean = false;

  constructor(
    public utilsService: UtilsService,
    private formBuilder: FormBuilder,
    private collectiblesCacheService: CollectiblesCacheService,
    private langService: LangService,
    private countdownService: CountdownService,
    private loaderService: LoaderService,
    private router: Router
  ) {
    this.utilsService.sidebarLayout.next(true);
    this.destroy = new Subject<boolean>();
    this.isLoading = this.loaderService.loading$;
  }

  ngOnInit(): void {
    this.getWeapons();
    this.getCategories();
    this.getTiers();
    this.getDamageTypes();
    this.getTypes();

    this.inputGroup = this.formBuilder.group({
      userInput: ['', Validators.required],
    });

    this.openStartModal();

    this.thresholds[0] = this.revealHTMLElement('flavorText');
  }

  openStartModal(): void {
    const startModal = document.querySelector(
      '[data-bs-target="#startModal"]'
    ) as HTMLElement;
    startModal.click();
  }

  startCountdown(): void {
    this.countdownService.startCountdown(30);
    this.countdown = this.countdownService.getCountdown();
    this.gameStarted = true;
  }

  reloadPage(): void {
    this.utilsService.reloadPage();
  }

  navigateToGamemodeSelection(): void {
    this.router.navigate(['/gamemode']);
  }

  localizeProperty(property: string): string {
    return this.langService.localizeProperty(property);
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

    const collectibleIdOrUndefined = this.getCollectibleIdByName(userInput);
    if (collectibleIdOrUndefined) {
      if (!this.alreadyRevealed(collectibleIdOrUndefined)) {
        this.points++;
        this.revealed.push(collectibleIdOrUndefined);
      }
    }
  }

  alreadyRevealed(collectibleId: number): boolean {
    return this.revealed.includes(collectibleId);
  }

  getWeapons(): void {
    this.collectiblesCacheService
      .getAllWeapons(this.langService.currentLocaleID)
      .pipe(takeUntil(this.destroy))
      .subscribe((weapons: Weapon[]) => {
        this.weapons = weapons;
        this.filteredWeapons = weapons;
        this.getRandomWeapon();
      });
  }

  getTypes(): void {
    this.collectiblesCacheService
      .getAllTypes()
      .pipe(takeUntil(this.destroy))
      .subscribe((types: Type[]) => {
        this.types = types;
      });
  }

  getRandomWeapon(): void {
    this.currentWeapon =
      this.filteredWeapons[
        Math.floor(Math.random() * this.filteredWeapons.length)
      ];
  }

  getDamageTypes(): void {
    this.collectiblesCacheService
      .getAllDamageTypes()
      .pipe(takeUntil(this.destroy))
      .subscribe((damageTypes: DamageType[]) => {
        this.damageTypes = damageTypes;
      });
  }

  getTiers(): void {
    this.collectiblesCacheService
      .getAllTiers()
      .pipe(takeUntil(this.destroy))
      .subscribe((tiers: Tier[]) => {
        this.tiers = tiers;
      });
  }

  getCategories(): void {
    this.collectiblesCacheService
      .getAllCategories()
      .pipe(takeUntil(this.destroy))
      .subscribe((categories: Category[]) => {
        this.categories = categories;
      });
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
  }

  _validateName(name: string): string {
    return name
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
  getCollectibleIdByName(name: string): number | undefined {
    const validName = this._validateName(name);
    const collectible = this.filteredWeapons.find(
      (weapon) =>
        this._validateName(weapon.name[0][this.localizeProperty('name')]) ===
        validName
    );

    return collectible?.id;
  }

  getCollectibleObjectById(id: number): Weapon | undefined {
    return this.filteredWeapons.find((weapon) => weapon.id === id);
  }

  getCollectibleObjectByName(name: string): Weapon | undefined {
    const validName = this._validateName(name);
    const collectible = this.filteredWeapons.find(
      (weapon) =>
        this._validateName(weapon.name[0][this.localizeProperty('name')]) ===
        validName
    );

    return collectible;
  }

  revealHTMLElement(id: string): Observable<boolean> {
    let timeThreshold = 100000;
    if (id === 'flavorText'){
      timeThreshold = 20000;
    };
    return this.countdown.pipe(map(remainingTime => remainingTime < timeThreshold));
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return confirm(
      $localize`La mission n'est pas terminée Gardien. Êtes-vous sûr de vouloir quitter ?`
    );
  }
}
