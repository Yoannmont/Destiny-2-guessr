import { Component, OnDestroy, OnInit } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';
import {
  Category,
  DamageType,
  Tier,
  Type,
  Weapon,
} from '../../_classes/weapon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CollectiblesCacheService } from '../../_services/collectibles-cache.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LangService } from '../../_services/lang.service';
import { FilterPipe } from '../../_pipes/filter.pipe';
import { NgbActiveModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TimerService } from '../../_services/timer.service';

@Component({
  selector: 'app-exo-challenge',
  standalone: true,
  templateUrl: './exo-challenge.component.html',
  styleUrl: './exo-challenge.component.scss',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FilterPipe,
    NgbPopoverModule,
  ],
})
export class ExoChallengeComponent implements OnInit, OnDestroy {
  inputs: Array<string> = [];
  inputGroup!: FormGroup;

  weapons!: Weapon[];
  tiers!: Tier[];
  categories!: Category[];
  types!: Type[];
  damageTypes!: DamageType[];

  destroy: Subject<boolean>;
  points: number = 0;
  revealed: Array<number> = [];
  timer!: Observable<number>;

  hasVictory!: Subject<boolean>;

  constructor(
    public utilsService: UtilsService,
    private formBuilder: FormBuilder,
    private collectiblesCacheService: CollectiblesCacheService,
    private langService: LangService,
    private timerService: TimerService,
  ) {
    this.utilsService.sidebarLayout.next(true);
    this.destroy = new Subject<boolean>();
    this.hasVictory = new Subject<boolean>();

    this.timer = this.timerService.getElapsed();
    
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

    
  }

  openStartModal() : void {
    this.resetTimer();
    const startModal = document.querySelector('[data-bs-target="#startModal"]') as HTMLElement;
    startModal.click();
    
  }

  openVictoryModal() : void {
    this.stopTimer();
    (document.querySelector('[data-bs-target="#victoryModal"]') as HTMLElement).click();
  }

  localizeProperty(property: string): string {
    return this.langService.localizeProperty(property);
  }

  resetTimer() : void {
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

    const collectibleIdOrUndefined = this.getCollectibleIdByName(userInput);
    if (collectibleIdOrUndefined) {
      if (!this.alreadyRevealed(collectibleIdOrUndefined)) {
        this.revealImage(collectibleIdOrUndefined);
        this.points++;
        this.revealed.push(collectibleIdOrUndefined);
        this.checkVictory();
      }
    }
  }

  alreadyRevealed(collectibleId: number): boolean {
    return this.revealed.includes(collectibleId);
  }

  checkVictory(): void {
    if (this.points === this.weapons.length) {
      this.openVictoryModal();
    }
  }

  startTimer(): void {
    this.timerService.startTimer();
  }
  stopTimer(): void {
    if (this.timerService.isRunning()) this.timerService.stopTimer();
  }

  revealImage(id: number): void {
    let spanElement = document.getElementById(`${id}`);
    let collectibleImage = spanElement?.childNodes.item(0) as HTMLImageElement;
    const collectible = this.getCollectibleObjectById(id);
    collectibleImage.src = this.utilsService.bungieUrl + collectible?.iconLink;
    collectibleImage.alt = collectible?.name[0][this.localizeProperty('name')]!;

    spanElement?.classList.add('shine');
    spanElement?.classList.add('vertical-fadeIn-animation-reverse');
  }

  getWeapons(): void {
    this.collectiblesCacheService
      .getAllWeapons('')
      .pipe(takeUntil(this.destroy))
      .subscribe((weapons: Weapon[]) => {
        this.weapons = weapons;
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
    return name.toLowerCase();
  }
  getCollectibleIdByName(name: string): number | undefined {
    const validName = this._validateName(name);
    const collectible = this.weapons.find(
      (weapon) =>
        weapon.name[0][this.localizeProperty('name')].toLowerCase() ===
        validName
    );

    return collectible?.id;
  }

  getCollectibleObjectById(id: number): Weapon | undefined {
    return this.weapons.find((weapon) => weapon.id === id);
  }

  getCollectibleObjectByName(name: string): Weapon | undefined {
    const validName = this._validateName(name);
    const collectible = this.weapons.find(
      (weapon) =>
        weapon.name[0][this.localizeProperty('name')].toLowerCase() ===
        validName
    );

    return collectible;
  }
}
