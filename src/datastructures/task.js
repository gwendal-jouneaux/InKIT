export class Task {
  constructor(id, title, description, deadline) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.deadline = deadline;
    this.status = "To Do";
    this.type = "";
    this.parent = undefined;
    this.children = [];
    this.importance = 0;
    this.fun = 0;
    this.estimatedTime = -1;
    this.progress = [];
  }
}
