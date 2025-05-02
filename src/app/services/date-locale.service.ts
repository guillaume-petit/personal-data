import { Injectable, OnDestroy } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateLocaleService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private translateService: TranslateService
  ) {
    // Set initial locale
    this.updateDateLocale(this.translateService.currentLang);

    // Listen for language changes
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.updateDateLocale(event.lang);
      });
  }

  private updateDateLocale(locale: string): void {
    this.dateAdapter.setLocale(locale);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
