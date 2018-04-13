import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduceUsersComponent } from './produce-users.component';

describe('ProduceUsersComponent', () => {
  let component: ProduceUsersComponent;
  let fixture: ComponentFixture<ProduceUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProduceUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProduceUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
