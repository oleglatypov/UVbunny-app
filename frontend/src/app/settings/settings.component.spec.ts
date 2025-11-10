import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { ConfigService } from '../services/config.service';
import { UserConfig } from '../types';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockConfig: UserConfig = {
    pointsPerCarrot: 3,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockConfigService = jasmine.createSpyObj('ConfigService', ['updatePointsPerCarrot'], {
      config$: of(mockConfig),
    });
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    mockConfigService.updatePointsPerCarrot.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, NoopAnimationsModule],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial config value from service', () => {
    expect(component.pointsPerCarrot).toBe(3);
    expect(component.configLoading).toBe(false);
  });

  it('should validate points per carrot correctly', () => {
    component.pointsPerCarrot = 5;
    expect(component.isValid()).toBe(true);

    component.pointsPerCarrot = 0;
    expect(component.isValid()).toBe(false);

    component.pointsPerCarrot = 11;
    expect(component.isValid()).toBe(false);

    component.pointsPerCarrot = null;
    expect(component.isValid()).toBe(false);
  });

  it('should update points per carrot on slider change', () => {
    component.onSliderChange(7);
    expect(component.pointsPerCarrot).toBe(7);
  });

  it('should normalize value on slider change', () => {
    component.onSliderChange(0);
    expect(component.pointsPerCarrot).toBe(1);

    component.onSliderChange(15);
    expect(component.pointsPerCarrot).toBe(10);
  });

  it('should calculate happiness for 10 carrots correctly', () => {
    component.pointsPerCarrot = 5;
    expect(component.getHappinessFor10Carrots()).toBe(50);
  });

  it('should calculate happiness for 100 carrots correctly', () => {
    component.pointsPerCarrot = 5;
    expect(component.getHappinessFor100Carrots()).toBe(500);
  });

  it('should save settings successfully', async () => {
    component.pointsPerCarrot = 5;
    await component.saveSettings();

    expect(mockConfigService.updatePointsPerCarrot).toHaveBeenCalledWith(5);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Configuration saved successfully! 🐇', 'Close', {
      duration: 3000,
    });
    expect(component.loading).toBe(false);
  });

  it('should not save if value is invalid', async () => {
    component.pointsPerCarrot = null;
    await component.saveSettings();

    expect(mockConfigService.updatePointsPerCarrot).not.toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Points per carrot must be between 1 and 10', 'Close', {
      duration: 3000,
    });
  });

  it('should handle error when saving settings', async () => {
    mockConfigService.updatePointsPerCarrot.and.returnValue(Promise.reject(new Error('Test error')));
    component.pointsPerCarrot = 5;
    await component.saveSettings();

    expect(mockSnackBar.open).toHaveBeenCalledWith('Test error', 'Close', { duration: 5000 });
  });

  it('should handle permission denied error', async () => {
    const error: any = { code: 'permission-denied' };
    mockConfigService.updatePointsPerCarrot.and.returnValue(Promise.reject(error));
    component.pointsPerCarrot = 5;
    await component.saveSettings();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Missing or insufficient permissions. Please check your authentication.',
      'Close',
      { duration: 5000 },
    );
  });

  it('should reset to default value', () => {
    component.pointsPerCarrot = 7;
    component.resetToDefault();
    expect(component.pointsPerCarrot).toBe(3);
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});

