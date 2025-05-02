import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditPersonalDataComponent } from './edit-personal-data.component';
import { UserService } from '../../services/user.service';

describe('EditPersonalDataComponent', () => {
  let component: EditPersonalDataComponent;
  let fixture: ComponentFixture<EditPersonalDataComponent>;
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
    emergencyContact: 'Jane Doe (Sister) - 555-765-4321'
  };

  beforeEach(async () => {
    // Create spies
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserById', 'updateUserData']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    // Mock ActivatedRoute with query params
    activatedRouteMock = {
      queryParams: of({
        id: '1'
      })
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, EditPersonalDataComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    // Setup default spy behavior
    userServiceSpy.getUserById.and.returnValue(of(mockUserData));
    userServiceSpy.updateUserData.and.returnValue(of({
      success: true,
      message: 'User updated successfully'
    }));

    fixture = TestBed.createComponent(EditPersonalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(userServiceSpy.getUserById).toHaveBeenCalledWith('1');
    expect(component.userData).toEqual(mockUserData);
    expect(component.error).toBeNull();
  });

  it('should display user data in the form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    const nameInput = compiled.querySelector('input[name="name"]') as HTMLInputElement;
    const mobilePhoneInput = compiled.querySelector('input[name="mobilePhone"]') as HTMLInputElement;
    const addressTextarea = compiled.querySelector('textarea[name="address"]') as HTMLTextAreaElement;
    
    expect(nameInput.value).toBe('John Doe');
    expect(mobilePhoneInput.value).toBe('555-123-4567');
    expect(addressTextarea.value).toBe('123 Main St, Anytown, USA');
  });

  it('should handle error when user data is not found', () => {
    // Setup error case
    userServiceSpy.getUserById.and.returnValue(throwError(() => new Error('User not found')));
    
    // Re-create component to trigger ngOnInit with error
    fixture = TestBed.createComponent(EditPersonalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component.userData).toBeNull();
    expect(component.error).toBe('Could not find personal data. Please try again.');
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Could not find personal data. Please try again.');
  });

  it('should update user data when form is submitted', () => {
    // Arrange
    const updatedUserData = { ...mockUserData, name: 'John Doe Updated' };
    component.userData = updatedUserData;
    userServiceSpy.updateUserData.and.returnValue(of({
      success: true,
      message: 'User updated successfully'
    }));
    
    // Act
    component.onSubmit();
    
    // Assert
    expect(userServiceSpy.updateUserData).toHaveBeenCalledWith(updatedUserData);
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/personal-data'], 
      { queryParams: { name: 'John Doe Updated', birthDate: '1990-05-15' } }
    );
  });

  it('should handle error when updating user data', () => {
    // Arrange
    userServiceSpy.updateUserData.and.returnValue(throwError(() => new Error('Update failed')));
    
    // Act
    component.onSubmit();
    
    // Assert
    expect(component.error).toBe('Failed to update personal data. Please try again.');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate back to personal data page when cancel is clicked', () => {
    // Act
    component.onCancel();
    
    // Assert
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/personal-data'], 
      { queryParams: { name: 'John Doe', birthDate: '1990-05-15' } }
    );
  });

  it('should navigate back to home when go back is clicked', () => {
    // Act
    component.goBack();
    
    // Assert
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
