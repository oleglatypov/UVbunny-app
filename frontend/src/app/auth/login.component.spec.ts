import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockAuth: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'signInWithGoogle',
      'signUpWithEmailAndPassword',
      'signInWithEmailAndPassword',
      'handleRedirectResult',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockAuth = jasmine.createSpyObj('Auth', ['onAuthStateChanged'], {
      currentUser: null,
    });

    mockAuthService.signInWithGoogle.and.returnValue(of(undefined));
    mockAuthService.handleRedirectResult.and.returnValue(of(null));
    mockAuth.onAuthStateChanged.and.returnValue(() => {});

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Auth, useValue: mockAuth },
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

  it('should have isSignUp set to false initially', () => {
    expect(component.isSignUp).toBe(false);
  });

  it('should toggle between sign up and sign in', () => {
    expect(component.isSignUp).toBe(false);
    component.toggleMode();
    expect(component.isSignUp).toBe(true);
    component.toggleMode();
    expect(component.isSignUp).toBe(false);
  });

  it('should call signInWithGoogle when signInWithGoogle is called', () => {
    component.signInWithGoogle();
    expect(mockAuthService.signInWithGoogle).toHaveBeenCalled();
    expect(component.loading).toBe(true);
  });

  it('should handle Google sign in error', () => {
    mockAuthService.signInWithGoogle.and.returnValue(throwError(() => new Error('Sign in failed')));
    component.signInWithGoogle();

    expect(mockSnackBar.open).toHaveBeenCalledWith('Sign in failed: Sign in failed', 'Close', {
      duration: 5000,
    });
    expect(component.loading).toBe(false);
  });

  it('should validate email form', () => {
    expect(component.emailForm.invalid).toBe(true);
    component.emailForm.patchValue({ email: 'test@example.com', password: 'password123' });
    expect(component.emailForm.valid).toBe(true);
  });

  it('should require email', () => {
    component.emailForm.patchValue({ email: '', password: 'password123' });
    expect(component.emailControl?.hasError('required')).toBe(true);
  });

  it('should require valid email format', () => {
    component.emailForm.patchValue({ email: 'invalid-email', password: 'password123' });
    expect(component.emailControl?.hasError('email')).toBe(true);
  });

  it('should require password', () => {
    component.emailForm.patchValue({ email: 'test@example.com', password: '' });
    expect(component.passwordControl?.hasError('required')).toBe(true);
  });

  it('should require password minimum length', () => {
    component.emailForm.patchValue({ email: 'test@example.com', password: '12345' });
    expect(component.passwordControl?.hasError('minlength')).toBe(true);
  });
});
