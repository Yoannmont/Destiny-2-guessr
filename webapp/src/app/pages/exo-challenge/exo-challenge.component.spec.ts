import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExoChallengeComponent } from './exo-challenge.component';

describe('ExoChallengeComponent', () => {
  let component: ExoChallengeComponent;
  let fixture: ComponentFixture<ExoChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExoChallengeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExoChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
