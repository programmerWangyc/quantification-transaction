import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodesPanelComponent } from './nodes-panel.component';

describe('NodesPanelComponent', () => {
  let component: NodesPanelComponent;
  let fixture: ComponentFixture<NodesPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodesPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
