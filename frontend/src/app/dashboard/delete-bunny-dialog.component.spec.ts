import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DeleteBunnyDialogComponent, DeleteBunnyDialogData } from './delete-bunny-dialog.component';

describe('DeleteBunnyDialogComponent', () => {
  let component: DeleteBunnyDialogComponent;
  let fixture: ComponentFixture<DeleteBunnyDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<DeleteBunnyDialogComponent>>;
  const mockData: DeleteBunnyDialogData = {
    bunnyName: 'Test Bunny',
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [DeleteBunnyDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteBunnyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have bunny name from dialog data', () => {
    expect(component.data.bunnyName).toBe('Test Bunny');
  });

  it('should close dialog with true when confirmed', () => {
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when cancelled', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});

