import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArgListComponent } from './arg-list.component';

describe('ArgListComponent', () => {
  let component: ArgListComponent;
  let fixture: ComponentFixture<ArgListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArgListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArgListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
