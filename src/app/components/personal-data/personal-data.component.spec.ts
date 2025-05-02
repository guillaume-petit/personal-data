import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PersonalDataComponent } from './personal-data.component';
import { UserService } from '../../services/user.service';

describe('PersonalDataComponent', () => {
  let component: PersonalDataComponent;
  let fixture: ComponentFixture<PersonalDataComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: any;

  const mockUserData = {
    id: '1',
    name: 'John Doe',
    birthDate: '1990-05-15',
    baptismDate: '1990-06-20',
    mobilePhone: '555-123-4567',
    homePhone: '555-987-6543',
    address: '123 Main St, Anytown, USA',
    emergencyContact: 'Jane Doe (Sister) - 555-765-4321',
    lastValidatedDate: '2023-05-01T12:00:00Z'
  };

  beforeEach(async () => {
    // Create spies
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserData', 'validateUserData']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    // Mock ActivatedRoute with query params
    activatedRouteMock = {
      queryParams: of({
        name: 'John Doe',
        birthDate: '1990-05-15'
      })
    };

    await TestBed.configureTestingModule({
      imports: [PersonalDataComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    // Setup default spy behavior
    userServiceSpy.getUserData.and.returnValue(of(mockUserData));
    userServiceSpy.validateUserData.and.returnValue(of({
      success: true,
      message: 'User data validated successfully',
      lastValidatedDate: '2023-05-01T13:00:00Z'
    }));

    fixture = TestBed.createComponent(PersonalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(userServiceSpy.getUserData).toHaveBeenCalledWith('John Doe', '1990-05-15');
    expect(component.userData).toEqual(mockUserData);
    expect(component.error).toBeNull();
  });

  it('should display user data in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('555-123-4567');
    expect(compiled.textContent).toContain('123 Main St, Anytown, USA');
    expect(compiled.textContent).toContain('Jane Doe (Sister) - 555-765-4321');
  });

  it('should handle error when user data is not found', () => {
    // Setup error case
    userServiceSpy.getUserData.and.returnValue(throwError(() => new Error('User not found')));
    
    // Re-create component to trigger ngOnInit with error
    fixture = TestBed.createComponent(PersonalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component.userData).toBeNull();
    expect(component.error).toBe('Could not find personal data. Please try again.');
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Could not find personal data. Please try again.');
  });

  it('should validate user data when validate button is clicked', () => {
    // Arrange
    const validateResponse = {
      success: true,
      message: 'User data validated successfully',
      lastValidatedDate: '2023-05-01T13:00:00Z'
    };
    userServiceSpy.validateUserData.and.returnValue(of(validateResponse));
    
    // Act
    component.onValidate();
    
    // Assert
    expect(userServiceSpy.validateUserData).toHaveBeenCalledWith('1');
    expect(component.userData.lastValidatedDate).toBe('2023-05-01T13:00:00Z');
  });

  it('should navigate to edit page when edit button is clicked', () => {
    // Act
    component.onEdit();
    
    // Assert
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/edit-personal-data'], 
      { queryParams: { id: '1' } }
    );
  });

  it('should navigate back to home when go back is clicked', () => {
    // Act
    component.goBack();
    
    // Assert
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
