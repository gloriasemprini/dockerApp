import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupContainersComponent } from './group-containers.component';

describe('ContainersComponent', () => {
  let component: GroupContainersComponent;
  let fixture: ComponentFixture<GroupContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupContainersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
