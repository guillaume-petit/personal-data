import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getAuthorizationHeader']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: AuthService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user data by name and birth date', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      birthDate: '1990-05-15'
    };

    service.getUserData('John Doe', '1990-05-15').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/users?name=John+Doe&birthDate=1990-05-15');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should get user by ID', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      birthDate: '1990-05-15'
    };

    service.getUserById('1').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should update user data', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe Updated',
      birthDate: '1990-05-15'
    };

    const mockResponse = {
      success: true,
      message: 'User updated successfully'
    };

    service.updateUserData(mockUser).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should validate user data', () => {
    const mockResponse = {
      success: true,
      message: 'User data validated successfully',
      lastValidatedDate: '2023-05-01T12:00:00Z'
    };

    service.validateUserData('1').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/users/1/validate');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get all users with authorization header', () => {
    const mockUsers = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' }
    ];

    const mockHeaders = new Headers();
    mockHeaders.append('Authorization', 'Basic dGVzdDp0ZXN0');
    authServiceSpy.getAuthorizationHeader.and.returnValue({ 
      'Authorization': 'Basic dGVzdDp0ZXN0' 
    } as any);

    service.getAllUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('/api/admin/users');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockUsers);
  });
});
