import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';
import { Filter } from '../../_classes/filter';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GamemodeService } from '../../_services/gamemode.service';
import { Category, DamageType, Tier, Type } from '../../_classes/weapon';
import { CollectiblesCacheService } from '../../_services/collectibles-cache.service';
import { Subject, takeUntil } from 'rxjs';
import { LangService } from '../../_services/lang.service';

@Component({
  selector: 'app-gamemode',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gamemode.component.html',
  styleUrl: './gamemode.component.scss',
})
export class GamemodeComponent implements OnInit{

  filters : Array<Filter> = [];

  tiers!: Tier[];
  categories!: Category[];
  types!: Type[];
  damageTypes!: DamageType[];

  destroy : Subject<boolean>;


  constructor(public utilsService: UtilsService, private gamemodeService : GamemodeService, private collectiblesCacheService : CollectiblesCacheService, private langService : LangService, private router : Router) {
    this.utilsService.sidebarLayout.next(true);
    this.destroy = new Subject<boolean>();
  }

  ngOnInit(): void {
    this.getCategories();
    this.getTiers();
    this.getDamageTypes();
    this.getTypes();
  }


  localizeProperty(property: string): string {
    return this.langService.localizeProperty(property);
  }

  addFilter(property: string, value: any, label: string | number): void {
    const filter = { property: property, value: value, label: label };
    const foundFilter = this.filters.find(
      (_filter) =>
        _filter.property === filter.property && _filter.value === filter.value
    );
    if (!foundFilter) this.filters.push(filter);
  }

  resetFilters(): void {
    this.filters = [];
  }

  deleteFilter(filter: Filter): void {
    const index = this.filters.findIndex((_filter) => _filter === filter);
    this.filters.splice(index, 1);
  }

  saveFilters() : void{
    this.gamemodeService.filters = this.filters;
  }

  saveAndLaunch(gamemode: 'exo-challenge' | 'mystery-weapon') {
   this.saveFilters();
   this.router.navigate(['/gamemode', gamemode]);
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
}
