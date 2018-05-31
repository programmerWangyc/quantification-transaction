import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenKeyPanelComponent } from './gen-key-panel.component';

describe('GenKeyPanelComponent', () => {
  let component: GenKeyPanelComponent;
  let fixture: ComponentFixture<GenKeyPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenKeyPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenKeyPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
