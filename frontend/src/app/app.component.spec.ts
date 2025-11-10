import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['handleRedirectResult']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockThemeService = jasmine.createSpyObj('ThemeService', ['setTheme']);

    mockAuthService.handleRedirectResult.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle redirect result on init', () => {
    fixture.detectChanges();
    expect(mockAuthService.handleRedirectResult).toHaveBeenCalled();
  });

  it('should navigate to dashboard when user is signed in', () => {
    const mockUser = { uid: '123', email: 'test@example.com' } as any;
    mockAuthService.handleRedirectResult.and.returnValue(of(mockUser));
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle redirect result error', () => {
    mockAuthService.handleRedirectResult.and.returnValue(throwError(() => new Error('Auth error')));
    spyOn(console, 'error');
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith('Error handling redirect result:', jasmine.any(Error));
  });
});

