import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyCodemirrorComponent } from './strategy-codemirror.component';

describe('StrategyCodemirrorComponent', () => {
  let component: StrategyCodemirrorComponent;
  let fixture: ComponentFixture<StrategyCodemirrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyCodemirrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyCodemirrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
