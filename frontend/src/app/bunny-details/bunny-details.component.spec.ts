import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { BunnyDetailsComponent } from './bunny-details.component';
import { BunnyDetailsService } from '../services/bunny-details.service';
import { BunniesService } from '../services/bunnies.service';
import { ConfigService } from '../services/config.service';
import { BunnyWithHappiness, CarrotEvent, UserConfig } from '../types';

describe('BunnyDetailsComponent', () => {
  let component: BunnyDetailsComponent;
  let fixture: ComponentFixture<BunnyDetailsComponent>;
  let mockBunnyDetailsService: jasmine.SpyObj<BunnyDetailsService>;
  let mockBunniesService: jasmine.SpyObj<BunniesService>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockActivatedRoute: any;

  const mockBunny: BunnyWithHappiness = {
    id: '1',
    name: 'Test Bunny',
    colorClass: 'pink',
    eventCount: 5,
    createdAt: new Date(),
    happiness: 15,
    mood: 'average',
    progressBarPercent: 50,
  };

  const mockEvents: CarrotEvent[] = [
    {
      id: '1',
      type: 'CARROT_GIVEN',
      carrots: 3,
      createdAt: new Date(),
      source: 'ui',
    },
    {
      id: '2',
      type: 'CARROT_GIVEN',
      carrots: 2,
      createdAt: new Date(),
      source: 'ui',
    },
  ];

  const mockConfig: UserConfig = {
    pointsPerCarrot: 3,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockBunnyDetailsService = jasmine.createSpyObj('BunnyDetailsService', ['giveCarrots', 'loadEventsPage']);
    mockBunniesService = jasmine.createSpyObj('BunniesService', [], {
      bunnies$: of([mockBunny]),
    });
    mockConfigService = jasmine.createSpyObj('ConfigService', [], {
      config$: of(mockConfig),
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1'),
        },
      },
    };

    mockBunnyDetailsService.giveCarrots.and.returnValue(of(undefined));
    mockBunnyDetailsService.loadEventsPage.and.returnValue(of({ events: mockEvents, lastDoc: null }));

    await TestBed.configureTestingModule({
      imports: [BunnyDetailsComponent, NoopAnimationsModule],
      providers: [
        { provide: BunnyDetailsService, useValue: mockBunnyDetailsService },
        { provide: BunniesService, useValue: mockBunniesService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BunnyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bunny details on init', () => {
    expect(component.bunny).toEqual(mockBunny);
  });

  it('should navigate to dashboard if bunny ID is missing', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    const newFixture = TestBed.createComponent(BunnyDetailsComponent);
    newFixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to dashboard if bunny not found', () => {
    const emptyBunniesService = jasmine.createSpyObj('BunniesService', [], {
      bunnies$: of([]),
    });
    TestBed.overrideProvider(BunniesService, { useValue: emptyBunniesService });
    const newFixture = TestBed.createComponent(BunnyDetailsComponent);
    newFixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should load events on init', () => {
    expect(mockBunnyDetailsService.loadEventsPage).toHaveBeenCalledWith('1');
    expect(component.events).toEqual(mockEvents);
  });

  it('should give carrots when giveCarrots is called', () => {
    component.carrotsToGive = 5;
    component.giveCarrots();

    expect(mockBunnyDetailsService.giveCarrots).toHaveBeenCalledWith('1', 5);
    expect(component.carrotsToGive).toBe(1);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Carrots given!', 'Close', { duration: 3000 });
  });

  it('should not give carrots if amount is invalid', () => {
    component.carrotsToGive = 0;
    component.giveCarrots();
    expect(mockBunnyDetailsService.giveCarrots).not.toHaveBeenCalled();

    component.carrotsToGive = 51;
    component.giveCarrots();
    expect(mockBunnyDetailsService.giveCarrots).not.toHaveBeenCalled();
  });

  it('should handle error when giving carrots', () => {
    mockBunnyDetailsService.giveCarrots.and.returnValue(throwError(() => new Error('Test error')));
    component.carrotsToGive = 5;
    component.giveCarrots();

    expect(mockSnackBar.open).toHaveBeenCalledWith('Error giving carrots: Test error', 'Close', {
      duration: 5000,
    });
  });

  it('should return correct bunny icon path', () => {
    const icon = component.getBunnyIcon(mockBunny);
    expect(icon).toBe('assets/icons/bunny_average_pink.svg');
  });

  it('should return correct progress color based on mood', () => {
    expect(component.getProgressColor('sad')).toBe('warn');
    expect(component.getProgressColor('happy')).toBe('primary');
    expect(component.getProgressColor('average')).toBe('accent');
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});

