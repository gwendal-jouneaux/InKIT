export class Progress {
  constructor(previous, duration, completion) {
    this.timestamp = new Date();
    this.fromChild = false;
    this.previous = previous;
    this.duration = duration;
    this.completion = completion;
    let previousTime = 0;
    let previousCompletion = 0;
    let previousPerfRate = 1;
    if (previous) {
      previousTime = previous.totalTime;
      previousCompletion = previous.completion;
      previousPerfRate = previous.sessionPerfRate;
    }
    this.totalTime = previousTime + duration;
    this.sessionCompletion = completion - previousCompletion;
    this.sessionPerfRate = this.sessionCompletion / duration;
    this.totalPerfRate = completion / this.totalTime;
    this.deltaPerfRate = this.sessionPerfRate / previousPerfRate;
  }
}
