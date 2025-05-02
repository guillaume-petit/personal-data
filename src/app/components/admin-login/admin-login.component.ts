import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ 'ADMIN_LOGIN.TITLE' | translate }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'ADMIN_LOGIN.USERNAME' | translate }}</mat-label>
              <input 
                matInput
                type="text" 
                name="username" 
                [(ngModel)]="loginData.username" 
                required 
                placeholder="{{ 'ADMIN_LOGIN.USERNAME_PLACEHOLDER' | translate }}">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.controls['username']?.invalid">{{ 'ADMIN_LOGIN.USERNAME_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'ADMIN_LOGIN.PASSWORD' | translate }}</mat-label>
              <input 
                matInput
                type="password" 
                name="password" 
                [(ngModel)]="loginData.password" 
                required 
                placeholder="{{ 'ADMIN_LOGIN.PASSWORD_PLACEHOLDER' | translate }}">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="loginForm.controls['password']?.invalid">{{ 'ADMIN_LOGIN.PASSWORD_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <div class="error-container" *ngIf="errorMessage">
              <mat-error>{{ errorMessage }}</mat-error>
            </div>

            <div class="button-container">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="!loginForm.form.valid">
                <mat-icon>login</mat-icon> {{ 'COMMON.SUBMIT' | translate }}
              </button>
            </div>
          </form>

          <div class="back-link">
            <a mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon> {{ 'ADMIN_LOGIN.BACK_TO_HOME' | translate }}
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 500px;
      margin: 0 auto;
      padding: 16px;
      width: 100%;
      box-sizing: border-box;
    }

    mat-card {
      margin-bottom: 16px;
    }

    mat-form-field {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .button-container {
      display: flex;
      justify-content: center;
      margin-top: 16px;
      margin-bottom: 16px;
    }

    .error-container {
      margin-bottom: 16px;
      text-align: center;
    }

    .back-link {
      text-align: center;
      margin-top: 16px;
    }

    @media (max-width: 600px) {
      .container {
        padding: 8px;
      }
    }
  `]
})
export class AdminLoginComponent {
  loginData = {
    username: '',
    password: ''
  };

  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  onSubmit() {
    this.errorMessage = null;

    this.authService.login(this.loginData.username, this.loginData.password).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.translate.get('ADMIN_LOGIN.INVALID_CREDENTIALS').subscribe((res: string) => {
          this.errorMessage = res;
        });
        console.error('Login error:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
