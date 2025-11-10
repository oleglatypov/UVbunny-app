import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['signInWithGoogle']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    mockAuthService.signInWithGoogle.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loading set to false initially', () => {
    expect(component.loading).toBe(false);
  });

  it('should call signInWithGoogle when signIn is called', () => {
    component.signIn();
    expect(mockAuthService.signInWithGoogle).toHaveBeenCalled();
    expect(component.loading).toBe(true);
  });

  it('should handle sign in error', () => {
    mockAuthService.signInWithGoogle.and.returnValue(throwError(() => new Error('Sign in failed')));
    component.signIn();

    expect(mockSnackBar.open).toHaveBeenCalledWith('Sign in failed: Sign in failed', 'Close', {
      duration: 5000,
    });
    expect(component.loading).toBe(false);
  });
});

