import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArgComponent } from './add-arg.component';

describe('AddArgComponent', () => {
  let component: AddArgComponent;
  let fixture: ComponentFixture<AddArgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddArgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddArgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
