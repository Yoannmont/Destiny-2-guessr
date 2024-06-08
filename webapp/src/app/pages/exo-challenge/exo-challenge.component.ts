import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { UtilsService } from '../../_services/utils.service';
import {
  Category,
  DamageType,
  Tier,
  Type,
  Weapon,
} from '../../_classes/weapon';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CollectiblesCacheService } from '../../_services/collectibles-cache.service';
import { forkJoin, Observable, Subject, takeUntil } from 'rxjs';
import { LangService } from '../../_services/lang.service';
import { FilterPipe } from '../../_pipes/filter.pipe';
import { TimerService } from '../../_services/timer.service';
import { LoaderService } from '../../_services/loader.service';
import { GamemodeService } from '../../_services/gamemode.service';
import { Filter } from '../../_classes/filter';
import { CanComponentDeactivate } from '../../_classes/candeactivate';
import { Armor, Class, ObjectType } from '../../_classes/armor';
import { Collectible } from '../../_classes/collectible';

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
  ],
})
export class ExoChallengeComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  private visibleTooltip: HTMLElement | null = null;

  isLoading: Observable<boolean>;

  inputs: Array<string> = [];
  inputGroup!: FormGroup;

  weapons!: Weapon[];
  filteredCollectibles: Collectible[] = [];
  tiers!: Tier[];
  categories!: Category[];
  types!: Type[];
  damageTypes!: DamageType[];
  objects!: ObjectType[];
  classes!: Class[];
  armors!: Armor[];

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
    private loaderService: LoaderService,
    private gamemodeService: GamemodeService,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.utilsService.sidebarLayout.next(true);
    this.destroy = new Subject<boolean>();
    this.hasVictory = new Subject<boolean>();
    this.timer = this.timerService.getElapsed();
    this.isLoading = this.loaderService.loading$;
  }

  ngOnInit(): void {
    this.getCollectibles();
    this.getCategories();
    this.getTiers();
    this.getDamageTypes();
    this.getTypes();
    this.getObjects();
    this.getClasses();
    

    this.inputGroup = this.formBuilder.group({
      userInput: ['', Validators.required],
    });

    this.openStartModal();
  }
  

  applyFilters() {

    this.filteredCollectibles = this.filteredCollectibles.filter(
      (collectible: Collectible) => {
        const groupedFilters = this.groupFiltersByProperty();

        return Object.keys(groupedFilters).every((property: any) => {
          const filtersForProperty = groupedFilters[property];
          return filtersForProperty.some((filter: any) => {
            return (
              collectible.hasOwnProperty(filter.property) &&
              collectible[filter.property] === filter.value
            );
          });
        });
      }
    );
  }

  navigateToGamemodeSelection(): void {
    this.router.navigate(['/gamemode']);
  }

  groupFiltersByProperty(): Array<any> {
    const groupedFilters: any = {};
    this.gamemodeService.filters.forEach((filter: any) => {
      if (!groupedFilters[filter.property]) {
        groupedFilters[filter.property] = [];
      }
      groupedFilters[filter.property].push(filter);
    });
    return groupedFilters;
  }

  getFilters(): Filter[] {
    return this.gamemodeService.filters;
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

  localizeProperty(property: string): string {
    return this.langService.localizeProperty(property);
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
    if (this.points === this.filteredCollectibles.length) {
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
    collectibleImage.src = this.utilsService.createIconLink(
      collectible?.iconLink
    );
    collectibleImage.alt = <string>collectible?.name[0][this.localizeProperty('name')]!;

    spanElement?.classList.add('shine');
    spanElement?.classList.add('vertical-fadeIn-animation-reverse');
    spanElement?.classList.add('pointer');
  }

  getCollectibles(): void {
    forkJoin({
      weapons: this.collectiblesCacheService.getAllWeapons(this.langService.currentLocaleID).pipe(takeUntil(this.destroy)),
      armors: this.collectiblesCacheService.getAllArmors(this.langService.currentLocaleID).pipe(takeUntil(this.destroy))
    }).subscribe(({ weapons, armors }) => {
      this.weapons = weapons;
      this.armors = armors;
      console.log(armors)
      this.filteredCollectibles = [...weapons, ...armors];
      this.applyFilters();
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

  getObjects(): void {
    this.collectiblesCacheService
      .getAllObjects()
      .pipe(takeUntil(this.destroy))
      .subscribe((objects: ObjectType[]) => {
        this.objects = objects;
      });
  }

  getClasses(): void {
    this.collectiblesCacheService
      .getAllClasses()
      .pipe(takeUntil(this.destroy))
      .subscribe((classes: Class[]) => {
        this.classes = classes;
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
    const collectible = this.filteredCollectibles.find(
      (_collectible) =>
        this._validateName(<string>_collectible.name[0][this.localizeProperty('name')]) ===
        validName
    );

    return collectible?.id;
  }

  getCollectibleObjectById(id: number): Collectible | undefined {
    return this.filteredCollectibles.find((collectible) => collectible.id === id);
  }

  getCollectibleObjectByName(name: string): Collectible | undefined {
    const validName = this._validateName(name);
    const collectible = this.filteredCollectibles.find(
      (_collectible) =>
        this._validateName(<string>_collectible.name[0][this.localizeProperty('name')]) ===
        validName
    );

    return collectible;
  }

  toggleTooltip(event: Event, collectibleId: number): void {
    const toolTipObject = document.getElementById(`tooltip-${collectibleId}`);
    if (toolTipObject && this.alreadyRevealed(collectibleId)) {
      if (toolTipObject.classList.contains('d-none')) {
        if (this.visibleTooltip) {
          this.renderer.addClass(this.visibleTooltip, 'd-none');
        }

        this.renderer.removeClass(toolTipObject, 'd-none');
        this.visibleTooltip = toolTipObject;
      } else {
        this.renderer.addClass(toolTipObject, 'd-none');
        this.visibleTooltip = null;
      }
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.points !== this.filteredCollectibles.length) {
      return confirm(
        $localize`La mission n'est pas terminée Gardien. Êtes-vous sûr de vouloir quitter ?`
      );
    }
    return true;
  }
}
