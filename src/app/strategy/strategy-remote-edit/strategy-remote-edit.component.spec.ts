import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyRemoteEditComponent } from './strategy-remote-edit.component';

describe('StrategyRemoteEditComponent', () => {
  let component: StrategyRemoteEditComponent;
  let fixture: ComponentFixture<StrategyRemoteEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyRemoteEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyRemoteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
