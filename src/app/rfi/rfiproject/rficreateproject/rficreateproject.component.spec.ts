import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RFICREATEPROJECTComponent } from './rficreateproject.component';

describe('RFICREATEPROJECTComponent', () => {
  let component: RFICREATEPROJECTComponent;
  let fixture: ComponentFixture<RFICREATEPROJECTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RFICREATEPROJECTComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RFICREATEPROJECTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
