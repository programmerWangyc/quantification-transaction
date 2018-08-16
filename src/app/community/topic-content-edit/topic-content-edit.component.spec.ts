import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicContentEditComponent } from './topic-content-edit.component';

describe('TopicContentEditComponent', () => {
  let component: TopicContentEditComponent;
  let fixture: ComponentFixture<TopicContentEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopicContentEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicContentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
