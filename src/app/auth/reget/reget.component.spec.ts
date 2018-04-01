import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegetComponent } from './reget.component';

describe('RegetComponent', () => {
  let component: RegetComponent;
  let fixture: ComponentFixture<RegetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
