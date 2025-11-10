import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { HeaderComponent } from './header.component';
import { AuthService } from '../services/auth.service';
import { BunniesService } from '../services/bunnies.service';
import { ThemeService } from '../services/theme.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockBunniesService: jasmine.SpyObj<BunniesService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let themeSubject: BehaviorSubject<'light' | 'dark'>;

  beforeEach(async () => {
    themeSubject = new BehaviorSubject<'light' | 'dark'>('light');

    mockAuthService = jasmine.createSpyObj('AuthService', ['signOut']);
    mockBunniesService = jasmine.createSpyObj('BunniesService', [], {
      averageHappiness$: of(25),
    });
    mockThemeService = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      theme$: themeSubject.asObservable(),
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    mockAuthService.signOut.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: BunniesService, useValue: mockBunniesService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default inputs', () => {
    expect(component.showBackButton).toBe(false);
    expect(component.backRoute).toBe(null);
  });

  it('should accept showBackButton input', () => {
    component.showBackButton = true;
    expect(component.showBackButton).toBe(true);
  });

  it('should accept backRoute input', () => {
    component.backRoute = '/dashboard';
    expect(component.backRoute).toBe('/dashboard');
  });

  it('should navigate to backRoute when goBack is called', () => {
    component.backRoute = '/dashboard';
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to home when goBack is called without backRoute', () => {
    component.backRoute = null;
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should call signOut when signOut is called', () => {
    component.signOut();
    expect(mockAuthService.signOut).toHaveBeenCalled();
  });

  it('should handle sign out error', () => {
    mockAuthService.signOut.and.returnValue(throwError(() => new Error('Sign out failed')));
    component.signOut();

    expect(mockSnackBar.open).toHaveBeenCalledWith('Error signing out: Sign out failed', 'Close', {
      duration: 5000,
    });
  });

  it('should toggle theme when toggleTheme is called', () => {
    component.toggleTheme();
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });

  it('should update isDarkMode$ when theme changes', (done) => {
    themeSubject.next('dark');
    component.isDarkMode$.subscribe((isDark) => {
      expect(isDark).toBe(true);
      done();
    });
  });
});

