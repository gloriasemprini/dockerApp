import { TestBed } from '@angular/core/testing';

import { GroupContainerService } from './group-container.service';

describe('GroupContainerService', () => {
  let service: GroupContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
