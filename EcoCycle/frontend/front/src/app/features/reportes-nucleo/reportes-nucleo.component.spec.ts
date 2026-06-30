import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGlobalComponent } from './reportes-nucleo.component';

describe('DashboardGlobalComponent', () => {
  let component: DashboardGlobalComponent;
  let fixture: ComponentFixture<DashboardGlobalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGlobalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
