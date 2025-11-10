import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { BunniesService } from '../services/bunnies.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { BunnyWithHappiness, BunnyColor } from '../types';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockBunniesService: jasmine.SpyObj<BunniesService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let themeSubject: BehaviorSubject<'light' | 'dark'>;

  const mockBunnies: BunnyWithHappiness[] = [
    {
      id: '1',
      name: 'Test Bunny',
      colorClass: 'pink',
      eventCount: 5,
      createdAt: new Date(),
      happiness: 15,
      mood: 'average',
      progressBarPercent: 50,
    },
    {
      id: '2',
      name: 'Happy Bunny',
      colorClass: 'black',
      eventCount: 10,
      createdAt: new Date(Date.now() - 30000), // 30 seconds ago
      happiness: 30,
      mood: 'happy',
      progressBarPercent: 100,
    },
  ];

  beforeEach(async () => {
    themeSubject = new BehaviorSubject<'light' | 'dark'>('light');

    mockBunniesService = jasmine.createSpyObj('BunniesService', ['createBunny', 'deleteBunny'], {
      bunnies$: of(mockBunnies),
      averageHappiness$: of(22),
    });

    mockAuthService = jasmine.createSpyObj('AuthService', ['signOut']);
    mockAuthService.signOut.and.returnValue(of(undefined));

    mockThemeService = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      theme$: themeSubject.asObservable(),
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: BunniesService, useValue: mockBunniesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize bunnies$ observable', () => {
    expect(component.bunnies$).toBeDefined();
    component.bunnies$?.subscribe((bunnies) => {
      expect(bunnies).toEqual(mockBunnies);
    });
  });

  it('should navigate to bunny details when viewBunny is called', () => {
    component.viewBunny('1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/bunnies', '1']);
  });

  it('should open add bunny dialog', () => {
    const mockDialogRef = {
      afterClosed: () => of({ name: 'New Bunny', color: 'pink' }),
    };
    mockDialog.open.and.returnValue(mockDialogRef as any);
    mockBunniesService.createBunny.and.returnValue(Promise.resolve('new-id'));

    component.openAddBunnyDialog();

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should create bunny when dialog returns result', async () => {
    const mockDialogRef = {
      afterClosed: () => of({ name: 'New Bunny', color: 'pink' as BunnyColor }),
    };
    mockDialog.open.and.returnValue(mockDialogRef as any);
    mockBunniesService.createBunny.and.returnValue(Promise.resolve('new-id'));

    await component.openAddBunnyDialog();

    expect(mockBunniesService.createBunny).toHaveBeenCalledWith('New Bunny', 'pink');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Bunny created! 🐇', 'Close', { duration: 3000 });
  });

  it('should delete bunny when confirmed', async () => {
    const bunny = mockBunnies[0];
    const mockDialogRef = {
      afterClosed: () => of(true),
    };
    mockDialog.open.and.returnValue(mockDialogRef as any);
    mockBunniesService.deleteBunny.and.returnValue(Promise.resolve());

    await component.deleteBunny(new Event('click'), bunny);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockBunniesService.deleteBunny).toHaveBeenCalledWith('1');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Test Bunny has been deleted 🐇', 'Close', {
      duration: 3000,
    });
  });

  it('should not delete bunny when cancelled', async () => {
    const bunny = mockBunnies[0];
    const mockDialogRef = {
      afterClosed: () => of(false),
    };
    mockDialog.open.and.returnValue(mockDialogRef as any);

    await component.deleteBunny(new Event('click'), bunny);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockBunniesService.deleteBunny).not.toHaveBeenCalled();
  });

  it('should check if bunny is newly created (within 60 seconds)', () => {
    const newBunny: BunnyWithHappiness = {
      ...mockBunnies[0],
      createdAt: new Date(), // Just created
    };
    expect(component.isNewlyCreated(newBunny)).toBe(true);

    const oldBunny: BunnyWithHappiness = {
      ...mockBunnies[0],
      createdAt: new Date(Date.now() - 61000), // 61 seconds ago
    };
    expect(component.isNewlyCreated(oldBunny)).toBe(false);
  });

  it('should return countdown string for newly created bunny', () => {
    const newBunny: BunnyWithHappiness = {
      ...mockBunnies[0],
      createdAt: new Date(Date.now() - 5000), // 5 seconds ago
    };
    const countdown = component.getCountdown(newBunny);
    expect(countdown).toBeTruthy();
    expect(parseInt(countdown)).toBeGreaterThan(0);
    expect(parseInt(countdown)).toBeLessThanOrEqual(60);
  });

  it('should return empty string for bunny older than 60 seconds', () => {
    const oldBunny: BunnyWithHappiness = {
      ...mockBunnies[0],
      createdAt: new Date(Date.now() - 61000), // 61 seconds ago
    };
    expect(component.getCountdown(oldBunny)).toBe('');
  });

  it('should return correct bunny icon path', () => {
    const icon = component.getBunnyIcon(mockBunnies[0]);
    expect(icon).toBe('assets/icons/bunny_average_pink.svg');
  });

  it('should return correct progress color based on mood', () => {
    expect(component.getProgressColor('sad')).toBe('warn');
    expect(component.getProgressColor('happy')).toBe('primary');
    expect(component.getProgressColor('average')).toBe('accent');
  });

  it('should return correct border color for bunny color', () => {
    expect(component.getBunnyBorderColor('pink')).toBe('#F6B7C2');
    expect(component.getBunnyBorderColor('black')).toBe('#222222');
    expect(component.getBunnyBorderColor('white')).toBe('#E0E0E0');
  });

  it('should cleanup interval on destroy', () => {
    spyOn(window, 'clearInterval');
    component.ngOnDestroy();
    expect(window.clearInterval).toHaveBeenCalled();
  });
});

