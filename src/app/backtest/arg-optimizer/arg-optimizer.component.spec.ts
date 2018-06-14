import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArgOptimizerComponent } from './arg-optimizer.component';

describe('ArgOptimizerComponent', () => {
  let component: ArgOptimizerComponent;
  let fixture: ComponentFixture<ArgOptimizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArgOptimizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArgOptimizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
