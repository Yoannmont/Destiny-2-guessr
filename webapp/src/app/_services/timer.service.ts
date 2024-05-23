import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private startTime!: number;
  private timer: any;
  private elapsed: number = 0;
  private running: boolean = false;

  constructor() {}

  startTimer() {
    this.startTime = Date.now() - this.elapsed;
    this.timer = setInterval(() => {
      this.elapsed = Date.now() - this.startTime;
    }, 100); 
    this.running = true;
  }

  stopTimer() {
    clearInterval(this.timer);
    this.running = false;
  }

  resetTimer() {
    this.elapsed = 0;
  }

  getElapsed(): Observable<number> {
    return new Observable(observer => {
      setInterval(() => {
        observer.next(this.elapsed);
      }, 100);
    });
  }

  isRunning() {
    return this.running;
  }
}
