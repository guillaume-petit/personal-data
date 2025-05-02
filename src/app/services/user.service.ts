import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUserData(name: string, birthDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, {
      params: { name, birthDate }
    }).pipe(
      catchError(error => {
        console.error('Error fetching user data:', error);
        return throwError(() => new Error('User not found'));
      })
    );
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching user by ID:', error);
        return throwError(() => new Error('User not found'));
      })
    );
  }

  updateUserData(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userData.id}`, userData).pipe(
      catchError(error => {
        console.error('Error updating user data:', error);
        return throwError(() => new Error('Failed to update user data'));
      })
    );
  }

  validateUserData(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/validate`, {}).pipe(
      catchError(error => {
        console.error('Error validating user data:', error);
        return throwError(() => new Error('Failed to validate user data'));
      })
    );
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`, {
      headers: this.authService.getAuthorizationHeader()
    }).pipe(
      catchError(error => {
        console.error('Error fetching all users:', error);
        return throwError(() => new Error('Failed to fetch users'));
      })
    );
  }
}
