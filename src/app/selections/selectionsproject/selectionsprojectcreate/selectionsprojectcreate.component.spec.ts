import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionsprojectcreateComponent } from './selectionsprojectcreate.component';

describe('SelectionsprojectcreateComponent', () => {
  let component: SelectionsprojectcreateComponent;
  let fixture: ComponentFixture<SelectionsprojectcreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionsprojectcreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionsprojectcreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
