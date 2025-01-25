export interface Updateable<T> {
  update(item: T): T;
}

export class SetWithContentEquality<T extends Updateable<T>> {
  private items: T[] = [];
  private getKey: (item: T) => string;

  constructor(items: T[] = [], getKey: (item: T) => string) {
    this.getKey = getKey;
    this.items = items;
    items.forEach(item => this.add(item));
  }

  add(item: T): void {
    console.warn('add', item);
    const key = this.getKey(item);
    if (!this.has(item)) {
      this.items.push(item);
    } else {
      this.get(item)?.update(item);
    }
  }

  get(item: T): T | undefined {
    return this.items.find(existing => this.getKey(existing) === this.getKey(item));
  }

  delete(item: T): boolean {
    const key = this.getKey(item);
    const index = this.items.findIndex(existing => this.getKey(existing) === key);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  has(item: T): boolean {
    return this.items.some(existing => this.getKey(existing) === this.getKey(item));
  }

  values(): T[] {
    return [...this.items];
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }
}
