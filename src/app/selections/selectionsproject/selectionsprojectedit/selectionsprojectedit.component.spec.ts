import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionsprojecteditComponent } from './selectionsprojectedit.component';

describe('SelectionsprojecteditComponent', () => {
  let component: SelectionsprojecteditComponent;
  let fixture: ComponentFixture<SelectionsprojecteditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionsprojecteditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionsprojecteditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
