import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RFIEDITCOMPONENTComponent } from './rfieditcomponent.component';

describe('RFIEDITCOMPONENTComponent', () => {
  let component: RFIEDITCOMPONENTComponent;
  let fixture: ComponentFixture<RFIEDITCOMPONENTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RFIEDITCOMPONENTComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RFIEDITCOMPONENTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
