import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyCreateMetaComponent } from './strategy-create-meta.component';

describe('StrategyCreateMetaComponent', () => {
  let component: StrategyCreateMetaComponent;
  let fixture: ComponentFixture<StrategyCreateMetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyCreateMetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyCreateMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
