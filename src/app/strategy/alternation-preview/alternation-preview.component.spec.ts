import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlternationPreviewComponent } from './alternation-preview.component';

describe('AlternationPreviewComponent', () => {
  let component: AlternationPreviewComponent;
  let fixture: ComponentFixture<AlternationPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlternationPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlternationPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
