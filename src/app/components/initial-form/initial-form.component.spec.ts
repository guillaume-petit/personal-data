import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InitialFormComponent } from './initial-form.component';

describe('InitialFormComponent', () => {
  let component: InitialFormComponent;
  let fixture: ComponentFixture<InitialFormComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create router spy
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, InitialFormComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InitialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form values', () => {
    expect(component.userData.name).toBe('');
    expect(component.userData.birthDate).toBe('');
  });

  it('should have form controls', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('input[name="name"]');
    const birthDateInput = compiled.querySelector('input[name="birthDate"]');
    const submitButton = compiled.querySelector('button[type="submit"]');

    expect(nameInput).toBeTruthy();
    expect(birthDateInput).toBeTruthy();
    expect(submitButton).toBeTruthy();
  });

  it('should disable submit button when form is invalid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Form should be invalid initially (empty required fields)
    expect(submitButton.disabled).toBeTrue();
  });

  it('should enable submit button when form is valid', () => {
    // Fill in the form
    component.userData.name = 'John Doe';
    component.userData.birthDate = '1990-05-15';
    
    // Trigger change detection
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    // Form should be valid now
    expect(submitButton.disabled).toBeFalse();
  });

  it('should navigate to personal-data page with query params on submit', () => {
    // Fill in the form
    component.userData.name = 'John Doe';
    component.userData.birthDate = '1990-05-15';
    
    // Submit the form
    component.onSubmit();
    
    // Verify navigation
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/personal-data'], 
      { queryParams: { name: 'John Doe', birthDate: '1990-05-15' } }
    );
  });
});
