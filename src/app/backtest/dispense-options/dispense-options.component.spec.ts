import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispenseOptionsComponent } from './dispense-options.component';

describe('DispenseOptionsComponent', () => {
  let component: DispenseOptionsComponent;
  let fixture: ComponentFixture<DispenseOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispenseOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispenseOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
