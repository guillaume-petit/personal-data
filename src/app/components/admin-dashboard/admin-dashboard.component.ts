import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatToolbarModule,
    MatGridListModule,
    MatTableModule,
    MatButtonToggleModule,
    TranslateModule
  ],
  template: `
    <div class="container">
      <mat-toolbar color="primary" class="dashboard-toolbar">
        <span>{{ 'ADMIN_DASHBOARD.TITLE' | translate }}</span>
        <span class="toolbar-spacer"></span>
        <mat-button-toggle-group [(ngModel)]="viewMode" aria-label="View Mode" class="view-toggle">
          <mat-button-toggle value="card">
            <mat-icon>view_module</mat-icon> {{ 'ADMIN_DASHBOARD.CARD_VIEW' | translate }}
          </mat-button-toggle>
          <mat-button-toggle value="table">
            <mat-icon>view_list</mat-icon> {{ 'ADMIN_DASHBOARD.TABLE_VIEW' | translate }}
          </mat-button-toggle>
        </mat-button-toggle-group>
        <button mat-raised-button color="warn" (click)="logout()" class="logout-button">
          <mat-icon>exit_to_app</mat-icon> {{ 'COMMON.LOGOUT' | translate }}
        </button>
      </mat-toolbar>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>{{ 'ADMIN_DASHBOARD.LOADING' | translate }}</p>
      </div>

      <div class="error-container" *ngIf="error">
        <mat-card>
          <mat-card-content>
            <p class="error-message">{{ error }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Card View -->
      <div class="users-grid" *ngIf="users && users.length > 0 && viewMode === 'card'">
        <mat-card class="user-card" *ngFor="let user of users">
          <mat-card-header>
            <mat-card-title>{{ user.name }}</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <mat-list>
              <mat-list-item>
                <span matListItemTitle>{{ 'COMMON.BIRTH_DATE' | translate }}</span>
                <span matListItemLine>{{ user.birthDate | date:'mediumDate' }}</span>
              </mat-list-item>
              <mat-divider></mat-divider>

              <mat-list-item>
                <span matListItemTitle>{{ 'COMMON.BAPTISM_DATE' | translate }}</span>
                <span matListItemLine>{{ user.baptismDate | date:'mediumDate' }}</span>
              </mat-list-item>
              <mat-divider></mat-divider>

              <mat-list-item>
                <span matListItemTitle>{{ 'COMMON.MOBILE_PHONE' | translate }}</span>
                <span matListItemLine>{{ user.mobilePhone }}</span>
              </mat-list-item>
              <mat-divider></mat-divider>

              <mat-list-item>
                <span matListItemTitle>{{ 'COMMON.HOME_PHONE' | translate }}</span>
                <span matListItemLine>{{ user.homePhone }}</span>
              </mat-list-item>
              <mat-divider></mat-divider>

              <mat-list-item>
                <span matListItemTitle>{{ 'COMMON.ADDRESS' | translate }}</span>
                <span matListItemLine>{{ user.address }}</span>
              </mat-list-item>
              <mat-divider></mat-divider>

              <mat-list-item>
                <span matListItemTitle>{{ 'COMMON.EMERGENCY_CONTACT' | translate }}</span>
                <span matListItemLine>{{ user.emergencyContact }}</span>
              </mat-list-item>

              <mat-list-item *ngIf="user.lastValidatedDate">
                <span matListItemTitle>{{ 'COMMON.LAST_VALIDATED' | translate }}</span>
                <span matListItemLine>{{ user.lastValidatedDate | date:'medium' }}</span>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Table View -->
      <div class="table-container" *ngIf="users && users.length > 0 && viewMode === 'table'">
        <table mat-table [dataSource]="users" class="users-table">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.NAME' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.name }}</td>
          </ng-container>

          <!-- Birth Date Column -->
          <ng-container matColumnDef="birthDate">
            <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.BIRTH_DATE' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.birthDate | date:'mediumDate' }}</td>
          </ng-container>

          <!-- Baptism Date Column -->
          <ng-container matColumnDef="baptismDate">
            <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.BAPTISM_DATE' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.baptismDate | date:'mediumDate' }}</td>
          </ng-container>

          <!-- Mobile Phone Column -->
          <ng-container matColumnDef="mobilePhone">
            <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.MOBILE_PHONE' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.mobilePhone }}</td>
          </ng-container>

          <!-- Home Phone Column -->
          <ng-container matColumnDef="homePhone">
            <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.HOME_PHONE' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.homePhone }}</td>
          </ng-container>

          <!-- Address Column -->
          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.ADDRESS' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.address }}</td>
          </ng-container>

          <!-- Emergency Contact Column -->
          <ng-container matColumnDef="emergencyContact">
            <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.EMERGENCY_CONTACT' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.emergencyContact }}</td>
          </ng-container>

          <!-- Last Validated Column -->
          <ng-container matColumnDef="lastValidatedDate">
            <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.LAST_VALIDATED' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.lastValidatedDate | date:'medium' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <div class="no-users-container" *ngIf="users && users.length === 0">
        <mat-card>
          <mat-card-content>
            <p>{{ 'ADMIN_DASHBOARD.NO_USERS' | translate }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px;
      width: 100%;
      box-sizing: border-box;
    }

    .dashboard-toolbar {
      margin-bottom: 16px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .view-toggle {
      margin-right: 16px;
    }

    .logout-button {
      white-space: nowrap;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      width: 100%;
    }

    .user-card {
      margin-bottom: 16px;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .users-table {
      width: 100%;
      min-width: 800px;
    }

    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .mat-mdc-header-cell, .mat-mdc-cell {
      padding: 8px 16px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .loading-container, .error-container, .no-users-container {
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

    @media (max-width: 768px) {
      .users-grid {
        grid-template-columns: 1fr;
      }

      .container {
        padding: 8px;
      }

      .dashboard-toolbar {
        flex-direction: column;
        align-items: stretch;
        padding: 16px;
      }

      .view-toggle {
        margin-right: 0;
        margin-bottom: 8px;
        width: 100%;
      }

      .logout-button {
        width: 100%;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  loading = true;
  error: string | null = null;
  viewMode: 'card' | 'table' = 'card';
  displayedColumns: string[] = ['name', 'birthDate', 'baptismDate', 'mobilePhone', 'homePhone', 'address', 'emergencyContact', 'lastValidatedDate'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.translate.get('ADMIN_DASHBOARD.LOAD_FAILED').subscribe((res: string) => {
          this.error = res;
        });
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
