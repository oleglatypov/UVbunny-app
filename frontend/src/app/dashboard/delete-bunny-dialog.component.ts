import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteBunnyDialogData {
  bunnyName: string;
}

@Component({
  selector: 'app-delete-bunny-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn" style="vertical-align: middle; margin-right: 8px;">warning</mat-icon>
      Delete Bunny?
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete <strong>{{ data.bunnyName }}</strong>?</p>
      <p style="color: rgba(0, 0, 0, 0.6); margin-top: 8px;">This action cannot be undone. All associated events will also be deleted.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" aria-label="Cancel">Cancel</button>
      <button
        mat-raised-button
        color="warn"
        (click)="onConfirm()"
        aria-label="Delete bunny">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 24px 24px 16px 24px;
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: 500;
    }

    mat-dialog-content {
      min-width: 350px;
      padding: 0 24px 8px 24px;
      margin: 0;
    }

    mat-dialog-actions {
      margin: 0;
      padding: 8px 16px 16px 16px;
      min-height: 52px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    p {
      margin: 0;
      line-height: 1.5;
      font-size: 14px;
    }

    p:first-of-type {
      margin-bottom: 8px;
    }

    strong {
      color: rgba(0, 0, 0, 0.87);
      font-weight: 500;
    }
  `],
})
export class DeleteBunnyDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteBunnyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteBunnyDialogData,
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

