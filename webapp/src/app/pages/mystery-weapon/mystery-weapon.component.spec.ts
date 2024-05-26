import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MysteryWeaponComponent } from './mystery-weapon.component';

describe('MysteryWeaponComponent', () => {
  let component: MysteryWeaponComponent;
  let fixture: ComponentFixture<MysteryWeaponComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MysteryWeaponComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MysteryWeaponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
