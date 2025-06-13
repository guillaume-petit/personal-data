import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

interface UserData {
  name: string;
  birthDate: string | Date;
}

@Component({
  selector: 'app-initial-form',
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
    TranslateModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ 'INITIAL_FORM.TITLE' | translate }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #initialForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.NAME' | translate }}</mat-label>
              <input 
                matInput
                type="text" 
                name="name" 
                [(ngModel)]="userData.name" 
                required 
                placeholder="{{ 'INITIAL_FORM.NAME_PLACEHOLDER' | translate }}">
              <mat-error *ngIf="initialForm.controls['name']?.invalid">{{ 'INITIAL_FORM.NAME_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'COMMON.BIRTH_DATE' | translate }}</mat-label>
              <input 
                matInput
                [matDatepicker]="picker"
                name="birthDate" 
                [(ngModel)]="userData.birthDate" 
                required>
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="initialForm.controls['birthDate']?.invalid">{{ 'INITIAL_FORM.BIRTH_DATE_REQUIRED' | translate }}</mat-error>
            </mat-form-field>

            <div class="button-container">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="!initialForm.form.valid">
                {{ 'COMMON.SUBMIT' | translate }}
              </button>
            </div>
          </form>
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

    mat-form-field {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .button-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    @media (max-width: 600px) {
      .container {
        width: 100%;
        padding: 8px;
      }
    }
  `]
})
export class InitialFormComponent {
  userData: UserData = {
    name: '',
    birthDate: ''
  };

  constructor(private router: Router) {}

  onSubmit() {
    // Format the birth date to YYYY-MM-DD format
    let formattedDate = this.userData.birthDate;
    if (this.userData.birthDate instanceof Date) {
      const date = this.userData.birthDate;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }

    // Navigate to the personal data display component with the form data
    this.router.navigate(['/personal-data'], { 
      queryParams: { 
        name: this.userData.name, 
        birthDate: formattedDate 
      } 
    });
  }
}
