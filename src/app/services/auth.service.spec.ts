import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageSpy: any;

  beforeEach(() => {
    // Create spies for localStorage methods
    localStorageSpy = {
      getItem: jasmine.createSpy('getItem').and.returnValue(null),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem')
    };

    // Replace localStorage with spy
    spyOn(localStorage, 'getItem').and.callFake(localStorageSpy.getItem);
    spyOn(localStorage, 'setItem').and.callFake(localStorageSpy.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(localStorageSpy.removeItem);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check authentication state from localStorage on initialization', () => {
    // Arrange
    localStorage.getItem.and.returnValue('true');
    
    // Act
    const newService = TestBed.inject(AuthService);
    
    // Assert
    expect(localStorage.getItem).toHaveBeenCalledWith('isAuthenticated');
    expect(newService.isAuthenticated()).toBeTrue();
  });

  it('should login successfully', () => {
    // Arrange
    const mockResponse = {
      success: true,
      message: 'Authentication successful'
    };
    
    // Act
    service.login('admin', 'admin123').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    
    // Assert
    const req = httpMock.expectOne('/api/admin/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'admin123' });
    req.flush(mockResponse);
    
    expect(localStorage.setItem).toHaveBeenCalledWith('isAuthenticated', 'true');
    expect(localStorage.setItem).toHaveBeenCalledWith('username', 'admin');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should handle login failure', () => {
    // Arrange
    const mockResponse = {
      success: false,
      message: 'Invalid credentials'
    };
    
    // Act & Assert
    service.login('wrong', 'credentials').subscribe({
      next: () => {},
      error: (error) => {
        expect(error.message).toBe('Login failed');
      }
    });
    
    const req = httpMock.expectOne('/api/admin/login');
    req.flush(mockResponse, { status: 401, statusText: 'Unauthorized' });
    
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should logout and clear authentication state', () => {
    // Act
    service.logout();
    
    // Assert
    expect(localStorage.removeItem).toHaveBeenCalledWith('isAuthenticated');
    expect(localStorage.removeItem).toHaveBeenCalledWith('username');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should create authorization header with credentials', () => {
    // Arrange
    localStorage.getItem.and.returnValue('admin');
    
    // Act
    const headers = service.getAuthorizationHeader();
    
    // Assert
    expect(localStorage.getItem).toHaveBeenCalledWith('username');
    expect(headers.get('Authorization')).toContain('Basic ');
    
    // Verify the base64 encoding (admin:admin123)
    const base64Credentials = headers.get('Authorization')?.split(' ')[1];
    const decodedCredentials = atob(base64Credentials || '');
    expect(decodedCredentials).toBe('admin:admin123');
  });
});
