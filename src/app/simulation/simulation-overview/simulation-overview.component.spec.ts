import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationOverviewComponent } from './simulation-overview.component';

describe('SimulationOverviewComponent', () => {
  let component: SimulationOverviewComponent;
  let fixture: ComponentFixture<SimulationOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimulationOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulationOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
