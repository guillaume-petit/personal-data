import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-personal-data',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  template: `
    <div class="container" *ngIf="userData">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ 'EDIT_PERSONAL_DATA.TITLE' | translate }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #editForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.NAME' | translate }}</mat-label>
              <input 
                matInput
                type="text" 
                name="name" 
                [(ngModel)]="userData.name" 
                required>
              <mat-error *ngIf="editForm.controls['name']?.invalid">{{ 'EDIT_PERSONAL_DATA.NAME_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.BIRTH_DATE' | translate }}</mat-label>
              <input 
                matInput
                [matDatepicker]="birthDatePicker"
                name="birthDate" 
                [(ngModel)]="userData.birthDate" 
                required>
              <mat-datepicker-toggle matIconSuffix [for]="birthDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #birthDatePicker></mat-datepicker>
              <mat-error *ngIf="editForm.controls['birthDate']?.invalid">{{ 'EDIT_PERSONAL_DATA.BIRTH_DATE_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.BAPTISM_DATE' | translate }}</mat-label>
              <input 
                matInput
                [matDatepicker]="baptismDatePicker"
                name="baptismDate" 
                [(ngModel)]="userData.baptismDate">
              <mat-datepicker-toggle matIconSuffix [for]="baptismDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #baptismDatePicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.MOBILE_PHONE' | translate }}</mat-label>
              <input 
                matInput
                type="tel" 
                name="mobilePhone" 
                [(ngModel)]="userData.mobilePhone" 
                required>
              <mat-icon matSuffix>phone_android</mat-icon>
              <mat-error *ngIf="editForm.controls['mobilePhone']?.invalid">{{ 'EDIT_PERSONAL_DATA.MOBILE_PHONE_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.HOME_PHONE' | translate }}</mat-label>
              <input 
                matInput
                type="tel" 
                name="homePhone" 
                [(ngModel)]="userData.homePhone">
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.ADDRESS' | translate }}</mat-label>
              <textarea 
                matInput
                name="address" 
                [(ngModel)]="userData.address" 
                required
                rows="3"></textarea>
              <mat-icon matSuffix>home</mat-icon>
              <mat-error *ngIf="editForm.controls['address']?.invalid">{{ 'EDIT_PERSONAL_DATA.ADDRESS_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.EMERGENCY_CONTACT' | translate }}</mat-label>
              <input 
                matInput
                type="text" 
                name="emergencyContact" 
                [(ngModel)]="userData.emergencyContact" 
                required>
              <mat-icon matSuffix>contact_phone</mat-icon>
              <mat-error *ngIf="editForm.controls['emergencyContact']?.invalid">{{ 'EDIT_PERSONAL_DATA.EMERGENCY_CONTACT_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <div class="button-container">
              <button mat-button type="button" (click)="onCancel()">
                <mat-icon>cancel</mat-icon> {{ 'COMMON.CANCEL' | translate }}
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!editForm.form.valid">
                <mat-icon>save</mat-icon> {{ 'COMMON.SAVE' | translate }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="!userData && !error">
      <mat-spinner diameter="50"></mat-spinner>
      <p>{{ 'EDIT_PERSONAL_DATA.LOADING' | translate }}</p>
    </div>

    <div class="error-container" *ngIf="error">
      <mat-card>
        <mat-card-content>
          <p class="error-message">{{ error }}</p>
          <button mat-raised-button color="warn" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon> {{ 'COMMON.GO_BACK' | translate }}
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
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
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }

    .loading-container, .error-container {
      max-width: 600px;
      margin: 32px auto;
      text-align: center;
      padding: 16px;
      width: 100%;
      box-sizing: border-box;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .loading-container p {
      margin-top: 16px;
    }

    .error-message {
      color: #f44336;
      margin-bottom: 16px;
    }

    @media (max-width: 600px) {
      .container, .loading-container, .error-container {
        padding: 8px;
      }

      .button-container {
        flex-direction: column;
      }
    }
  `]
})
export class EditPersonalDataComponent implements OnInit {
  userData: any = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private translate: TranslateService
  ) {}

  // Helper method to format date to YYYY-MM-DD
  formatDate(date: any): string {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];

      if (id) {
        this.userService.getUserById(id).subscribe({
          next: (data) => {
            this.userData = data;
          },
          error: (err) => {
            this.translate.get('EDIT_PERSONAL_DATA.NOT_FOUND').subscribe((res: string) => {
              this.error = res;
            });
            console.error('Error fetching user data:', err);
          }
        });
      } else {
        this.translate.get('EDIT_PERSONAL_DATA.MISSING_INFO').subscribe((res: string) => {
          this.error = res;
        });
      }
    });
  }

  onSubmit(): void {
    if (this.userData) {
      // Create a copy of userData to avoid modifying the original
      const formattedUserData = { ...this.userData };

      // Format dates
      if (formattedUserData.birthDate) {
        formattedUserData.birthDate = this.formatDate(formattedUserData.birthDate);
      }
      if (formattedUserData.baptismDate) {
        formattedUserData.baptismDate = this.formatDate(formattedUserData.baptismDate);
      }

      this.userService.updateUserData(formattedUserData).subscribe({
        next: () => {
          this.translate.get('EDIT_PERSONAL_DATA.UPDATED').subscribe((res: string) => {
            alert(res);
            this.router.navigate(['/personal-data'], { 
              queryParams: { 
                name: this.userData.name, 
                birthDate: this.formatDate(this.userData.birthDate) 
              } 
            });
          });
        },
        error: (err) => {
          this.translate.get('EDIT_PERSONAL_DATA.UPDATE_FAILED').subscribe((res: string) => {
            this.error = res;
          });
          console.error('Error updating user data:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/personal-data'], { 
      queryParams: { 
        name: this.userData.name, 
        birthDate: this.formatDate(this.userData.birthDate) 
      } 
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
