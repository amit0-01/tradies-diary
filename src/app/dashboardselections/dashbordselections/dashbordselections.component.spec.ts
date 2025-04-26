import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordselectionsComponent } from './dashbordselections.component';

describe('DashbordselectionsComponent', () => {
  let component: DashbordselectionsComponent;
  let fixture: ComponentFixture<DashbordselectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashbordselectionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashbordselectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
