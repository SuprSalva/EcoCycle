import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardBotellasComponent } from './dashboard-botellas.component';

describe('DashboardBotellasComponent', () => {
  let component: DashboardBotellasComponent;
  let fixture: ComponentFixture<DashboardBotellasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardBotellasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardBotellasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});