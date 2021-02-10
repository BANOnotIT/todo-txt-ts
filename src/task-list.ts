import Task from './task';

export default class TaskList {
  items: Task[];

  constructor(s?: string) {
    this.items = [];
    if (s) {
      this.load(s);
    }
  }

  load(s: string): void {
    this.items = s.split('\n')
      .map(e => e.trim())
      .filter(e => e.length > 0)
      .map((e, i) => Task.parse(e, i));
  }

  stringify(): string {
    return this.items.map(t => t.stringify()).join('\n');
  }

  static parse(s: string): TaskList {
    return new TaskList(s);
  }
}