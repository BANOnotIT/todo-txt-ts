import { ITask, Priority, Dictionary } from './types';
import { formatDate, spliceWhere, tryParseDate } from './utils';

export default class Task implements ITask {
  isComplete: boolean;
  projects: string[];
  contexts: string[];
  dueDate?: Date;
  completionDate?: Date;
  creationDate?: Date;
  priority?: Priority;
  fields: Dictionary<string>;
  body: string;
  raw: string;
  index: number;
  
  constructor(s?: string) {
    this.isComplete = false;
    this.projects = [];
    this.contexts = [];
    this.fields = {};
    this.body = '';
    this.raw = '';
    this.index = -1;

    if (s) {
      this.load(s);
    }
  }

  load(data: string): void {
    this.raw = data;
    const line = data.trim();
    const tokens = line.split(/\s+/).map(s => s.trim());

    if (tokens[0] === 'x') {
      this.isComplete = true;
      tokens.shift();
    }

    if (this.isComplete && tokens.length > 1) {
      const completionDate = tryParseDate(tokens[0]);
      if (completionDate) {
        this.completionDate = completionDate;
        tokens.shift();
      }
    }

    const priority = tokens[0].match(/\(([A-Z])\)/);
    if (priority) {
      this.priority = priority[1];
      tokens.shift();
    }

    const creationDate = tryParseDate(tokens[0]);
    if (creationDate) {
      this.creationDate = creationDate;
      tokens.shift();
    }

    this.contexts = spliceWhere(tokens, s => /^@[\S]+/.test(s));
    this.projects = spliceWhere(tokens, s => /^\+[\S]+/.test(s));

    spliceWhere(tokens, s => /[^:]+:[^:]+/.test(s))
      .forEach(s => {
        const tuple = s.split(':');
        this.fields[tuple[0]] = tuple[1];
      });

    this.body = tokens.join(' ');
  }

  static parse(s: string): Task {
    return new Task(s);
  }

  stringify(): string {
    const tokens = [];
    if (this.isComplete) {
      tokens.push('x');
    }
    if (this.completionDate) {
      tokens.push(formatDate(this.completionDate));
    }
    if (this.priority) {
      tokens.push(`(${this.priority})`);
    }
    if (this.creationDate) {
      tokens.push(formatDate(this.creationDate));
    }
    tokens.push(this.body);
    this.contexts.forEach(c => tokens.push(c));
    this.projects.forEach(p => tokens.push(p));
    return tokens.join(' ');
  }
}