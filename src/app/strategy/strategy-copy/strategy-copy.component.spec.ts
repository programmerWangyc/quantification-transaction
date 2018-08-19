import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyCopyComponent } from './strategy-copy.component';

describe('StrategyCopyComponent', () => {
  let component: StrategyCopyComponent;
  let fixture: ComponentFixture<StrategyCopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyCopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
