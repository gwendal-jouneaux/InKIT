export class Config {
  constructor() {
    this.labels = { "": "red", default: "teal" };
    this.activeLabels = ["", "default"];
    this.activeTasksFilter = (tasks) => {
      return tasks.filter(
        (t) => t.status != "Archived" && this.activeLabels.includes(t.type)
      );
    };
  }
}
