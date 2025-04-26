import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionsprojectComponent } from './selectionsproject-render.component';

describe('SelectionsprojectComponent', () => {
  let component: SelectionsprojectComponent;
  let fixture: ComponentFixture<SelectionsprojectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionsprojectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionsprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
