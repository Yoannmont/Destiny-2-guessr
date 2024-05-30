import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectiblesCacheService } from '../../_services/collectibles-cache.service';
import { LangService } from '../../_services/lang.service';
import { Subject, Observable, takeUntil } from 'rxjs';
import { Weapon, Tier, Category, DamageType, Type} from '../../_classes/weapon';
import { GamemodeService } from '../../_services/gamemode.service';
import { LoaderService } from '../../_services/loader.service';
import { TimerService } from '../../_services/timer.service';
import { CanComponentDeactivate } from '../../_classes/candeactivate';

@Component({
  selector: 'app-mystery-weapon',
  standalone: true,
  imports: [],
  templateUrl: './mystery-weapon.component.html',
  styleUrl: './mystery-weapon.component.scss'
})
export class MysteryWeaponComponent implements OnInit, CanComponentDeactivate{
  inputs: Array<string> = [];
  inputGroup!: FormGroup;

  weapons!: Weapon[];
  filteredWeapons! : Weapon[];
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
    private gamemodeService : GamemodeService
  ) {
    this.utilsService.sidebarLayout.next(true);
    this.destroy = new Subject<boolean>();
    
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
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return confirm($localize`La mission n'est pas terminée Gardien. Êtes-vous sûr de vouloir quitter ?`);
}

}
