import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleCollectibleComponent } from './single-collectible.component';

describe('SingleCollectibleComponent', () => {
  let component: SingleCollectibleComponent;
  let fixture: ComponentFixture<SingleCollectibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleCollectibleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SingleCollectibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
