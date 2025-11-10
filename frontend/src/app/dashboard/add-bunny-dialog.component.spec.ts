import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { AddBunnyDialogComponent } from './add-bunny-dialog.component';
import { BunnyColor } from '../types';

describe('AddBunnyDialogComponent', () => {
  let component: AddBunnyDialogComponent;
  let fixture: ComponentFixture<AddBunnyDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AddBunnyDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AddBunnyDialogComponent, NoopAnimationsModule],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBunnyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.bunnyForm.get('name')?.value).toBe('');
    expect(component.bunnyForm.get('color')?.value).toBe('');
  });

  it('should have required validator on name field', () => {
    const nameControl = component.bunnyForm.get('name');
    expect(nameControl?.hasError('required')).toBe(true);
  });

  it('should validate name min length', () => {
    component.bunnyForm.patchValue({ name: '' });
    expect(component.bunnyForm.get('name')?.hasError('minlength')).toBe(true);
  });

  it('should validate name max length', () => {
    const longName = 'a'.repeat(41);
    component.bunnyForm.patchValue({ name: longName });
    expect(component.bunnyForm.get('name')?.hasError('maxlength')).toBe(true);
  });

  it('should close dialog with result when form is valid', () => {
    component.bunnyForm.patchValue({ name: 'Test Bunny', color: 'pink' });
    component.onSubmit();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      name: 'Test Bunny',
      color: 'pink' as BunnyColor,
    });
  });

  it('should trim name when submitting', () => {
    component.bunnyForm.patchValue({ name: '  Test Bunny  ', color: '' });
    component.onSubmit();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      name: 'Test Bunny',
      color: undefined,
    });
  });

  it('should not close dialog if form is invalid', () => {
    component.bunnyForm.patchValue({ name: '', color: '' });
    component.onSubmit();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog without result when cancelled', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle empty color as undefined', () => {
    component.bunnyForm.patchValue({ name: 'Test Bunny', color: '' });
    component.onSubmit();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      name: 'Test Bunny',
      color: undefined,
    });
  });
});

