import { TestBed, inject } from '@angular/core/testing';

import { WatchDogService } from './watch-dog.service';

describe('WatchDogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WatchDogService]
    });
  });

  it('should be created', inject([WatchDogService], (service: WatchDogService) => {
    expect(service).toBeTruthy();
  }));
});
