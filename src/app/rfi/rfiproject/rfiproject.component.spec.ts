import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RFIPROJECTComponent } from './rfiproject.component';

describe('RFIPROJECTComponent', () => {
  let component: RFIPROJECTComponent;
  let fixture: ComponentFixture<RFIPROJECTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RFIPROJECTComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RFIPROJECTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
