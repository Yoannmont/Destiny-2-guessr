import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subject, Subscription } from 'rxjs';
import { map, takeWhile, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CountdownService {
  private countdown$: Subject<number> = new Subject();
  private interval$: Subscription = new Subscription();
  private isPaused: boolean = true;
  private remainingTime: number = 0;

  getCountdown() {
    return this.countdown$.asObservable();
  }

  startCountdown(seconds: number) {
    this.remainingTime = seconds;
    this.isPaused = false;
    this.runCountdown();
    return this.countdown$.asObservable();
  }

  private runCountdown() {
    this.interval$.unsubscribe();
    this.interval$ = interval(1000)
      .pipe(
        takeWhile(() => this.remainingTime > 0),
        tap(() => {
          if (!this.isPaused) {
            this.remainingTime--;
            this.countdown$.next(this.remainingTime * 1000);
          }
        })
      )
      .subscribe();
  }

  pauseCountdown() {
    this.isPaused = true;
  }

  resumeCountdown() {
    this.isPaused = false;
  }

  stopCountdown() {
    this.isPaused = true;
    this.remainingTime = 0;
    this.countdown$.next(this.remainingTime);
    this.interval$.unsubscribe();
  }
}
