import { TestBed, inject } from '@angular/core/testing';

import { BtNodeService } from './bt-node.service';

describe('BtNodeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BtNodeService]
    });
  });

  it('should be created', inject([BtNodeService], (service: BtNodeService) => {
    expect(service).toBeTruthy();
  }));
});
