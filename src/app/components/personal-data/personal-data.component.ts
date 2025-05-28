import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule
  ],
  template: `
    <div class="container" *ngIf="userData">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ 'PERSONAL_DATA.TITLE' | translate }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <span matListItemTitle>{{ 'COMMON.NAME' | translate }}</span>
              <span matListItemLine>{{ userData.name }}</span>
            </mat-list-item>
            <mat-divider></mat-divider>

            <mat-list-item>
              <span matListItemTitle>{{ 'COMMON.BIRTH_DATE' | translate }}</span>
              <span matListItemLine>{{ userData.birthDate | date:'yyyy-MM-dd' }}</span>
            </mat-list-item>
            <mat-divider></mat-divider>

            <mat-list-item>
              <span matListItemTitle>{{ 'COMMON.BAPTISM_DATE' | translate }}</span>
              <span matListItemLine>{{ userData.baptismDate | date:'yyyy-MM-dd' }}</span>
            </mat-list-item>
            <mat-divider></mat-divider>

            <mat-list-item>
              <span matListItemTitle>{{ 'COMMON.MOBILE_PHONE' | translate }}</span>
              <span matListItemLine>{{ userData.mobilePhone }}</span>
            </mat-list-item>
            <mat-divider></mat-divider>

            <mat-list-item>
              <span matListItemTitle>{{ 'COMMON.HOME_PHONE' | translate }}</span>
              <span matListItemLine>{{ userData.homePhone }}</span>
            </mat-list-item>
            <mat-divider></mat-divider>

            <mat-list-item>
              <span matListItemTitle>{{ 'COMMON.ADDRESS' | translate }}</span>
              <span matListItemLine>{{ userData.address }}</span>
            </mat-list-item>
            <mat-divider></mat-divider>

            <mat-list-item>
              <span matListItemTitle>{{ 'COMMON.EMERGENCY_CONTACT' | translate }}</span>
              <span matListItemLine>{{ userData.emergencyContact }}</span>
            </mat-list-item>
            <mat-divider></mat-divider>

            <mat-list-item *ngIf="userData.lastValidatedDate">
              <span matListItemTitle>{{ 'COMMON.LAST_VALIDATED' | translate }}</span>
              <span matListItemLine>{{ userData.lastValidatedDate | date:'yyyy-MM-dd' }}</span>
            </mat-list-item>
            <mat-divider *ngIf="userData.lastValidatedDate"></mat-divider>

            <mat-list-item *ngIf="userData.lastUpdateDate">
              <span matListItemTitle>{{ 'COMMON.LAST_UPDATED' | translate }}</span>
              <span matListItemLine>{{ userData.lastUpdateDate | date:'yyyy-MM-dd' }}</span>
            </mat-list-item>
          </mat-list>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="onValidate()">
            <mat-icon>check_circle</mat-icon> {{ 'COMMON.VALIDATE' | translate }}
          </button>
          <button mat-raised-button color="accent" (click)="onEdit()">
            <mat-icon>edit</mat-icon> {{ 'COMMON.EDIT' | translate }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="!userData && !error">
      <mat-spinner diameter="50"></mat-spinner>
      <p>{{ 'PERSONAL_DATA.LOADING' | translate }}</p>
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

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px;
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

      mat-card-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PersonalDataComponent implements OnInit {
  userData: any = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      const birthDate = params['birthDate'];

      if (name && birthDate) {
        this.userService.getUserData(name, birthDate).subscribe({
          next: (data) => {
            this.userData = data;
          },
          error: (err) => {
            this.translate.get('PERSONAL_DATA.NOT_FOUND').subscribe((res: string) => {
              this.error = res;
            });
            console.error('Error fetching user data:', err);
          }
        });
      } else {
        this.translate.get('PERSONAL_DATA.MISSING_INFO').subscribe((res: string) => {
          this.error = res;
        });
      }
    });
  }

  onValidate(): void {
    if (this.userData && this.userData.id) {
      this.userService.validateUserData(this.userData.id).subscribe({
        next: (response) => {
          // Update the userData with the new lastValidatedDate
          this.userData.lastValidatedDate = response.lastValidatedDate;
          this.translate.get('PERSONAL_DATA.VALIDATED').subscribe((res: string) => {
            alert(res);
          });
        },
        error: (err) => {
          console.error('Error validating user data:', err);
          this.translate.get('PERSONAL_DATA.VALIDATION_FAILED').subscribe((res: string) => {
            alert(res);
          });
        }
      });
    } else {
      this.translate.get('PERSONAL_DATA.CANNOT_VALIDATE').subscribe((res: string) => {
        alert(res);
      });
    }
  }

  onEdit(): void {
    this.router.navigate(['/edit-personal-data'], { 
      queryParams: { id: this.userData.id } 
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
