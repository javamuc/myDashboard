import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherComponent } from './weather.component';
import { HttpClient } from '@angular/common/http';

describe('WeatherComponent', () => {
  let component: WeatherComponent;
  let fixture: ComponentFixture<WeatherComponent>;
  let mockHttpClient: HttpClient;
  beforeEach(async () => {
    mockHttpClient = TestBed.inject(HttpClient);
    await TestBed.configureTestingModule({
      imports: [WeatherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
