import { TestBed } from '@angular/core/testing';

import { GamemodeService } from './gamemode.service';

describe('GamemodeService', () => {
  let service: GamemodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamemodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
