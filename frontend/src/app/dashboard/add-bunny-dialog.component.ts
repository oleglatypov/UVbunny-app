import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { BunnyColor } from '../types';

@Component({
  selector: 'app-add-bunny-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Add New Bunny 🐇</h2>
    <mat-dialog-content>
      <form [formGroup]="bunnyForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Bunny Name</mat-label>
          <input
            matInput
            formControlName="name"
            placeholder="Enter bunny name (1-40 characters)"
            maxlength="40"
            required
            aria-label="Bunny name" />
          <mat-hint>{{ bunnyForm.get('name')?.value?.length || 0 }}/40 characters</mat-hint>
          <mat-error *ngIf="bunnyForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
          <mat-error *ngIf="bunnyForm.get('name')?.hasError('minlength')">
            Name must be at least 1 character
          </mat-error>
          <mat-error *ngIf="bunnyForm.get('name')?.hasError('maxlength')">
            Name must be at most 40 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Color</mat-label>
          <mat-select formControlName="color" aria-label="Bunny color">
            <mat-option value="">Random</mat-option>
            <mat-option value="cream">Cream</mat-option>
            <mat-option value="gray">Gray</mat-option>
            <mat-option value="brown">Brown</mat-option>
            <mat-option value="white">White</mat-option>
            <mat-option value="black">Black</mat-option>
            <mat-option value="pink">Pink</mat-option>
          </mat-select>
          <mat-hint>Choose a color or leave as random</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" aria-label="Cancel">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="!bunnyForm.valid"
        aria-label="Create bunny">
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
      padding: 1rem 0;
    }
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    mat-dialog-actions {
      padding: 1rem 0;
    }
    mat-form-field {
      margin-bottom: 0.5rem;
    }
  `],
})
export class AddBunnyDialogComponent {
  bunnyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddBunnyDialogComponent>,
  ) {
    this.bunnyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(40)]],
      color: [''],
    });
  }

  onSubmit(): void {
    if (this.bunnyForm.valid) {
      const formValue = this.bunnyForm.value;
      const color = formValue.color || undefined;
      this.dialogRef.close({
        name: formValue.name.trim(),
        color: color as BunnyColor | undefined,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

