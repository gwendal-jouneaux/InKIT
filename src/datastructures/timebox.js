export class Timebox {
  constructor(id, week, day, from, to, title) {
    this.id = id;
    this.week = week;
    this.day = day;
    this.from = from;
    this.to = to;
    this.timeUnits = to - from + 1;
    this.title = title;
  }
}
