import { checkConcurrency } from './tools'

type PromiseFn<T> = () => Promise<T>

class MyLimit {
  public concurrency: number = 1;
  private queue: PromiseFn<any>[] = [];
  private tasksAry: Promise<any>[] = [];
  public activeCount: number = 0;
  constructor(concurrency: number) {
    if (checkConcurrency(concurrency)) {
      this.concurrency = concurrency
    } else {
      throw new TypeError(`Expected ${concurrency} to be a number from 1 and up`)
    }
  }

  private limitToConcurrency(): void {
    Promise.resolve().then(() => {
      if (this.activeCount < this.concurrency && this.pendingCount > 0) {
        this.queue.shift()?.call(null)
      }
    })
  }

  run(fn: PromiseFn<any>, resolve: (val: Promise<any>) => void): void {
    this.activeCount++
    
    const task = fn()
    resolve(task)
    task.then(() => this.next())
  }
  
  next() {
    this.activeCount--
  
    if (this.queue.length > 0) {
      this.queue.shift()?.call(null)
    }
  }

  add(fn: PromiseFn<any>): void {
    const context = this
    const p = new Promise(resolve => {
      this.queue.push(this.run.bind(context, fn, resolve))
    })

    this.tasksAry.push(p)

    this.limitToConcurrency()
  }

  get tasks() {
    return this.tasksAry
  }

  get pendingCount():Number {
    return this.queue.length
  }

  public clearQueue(): void {
    this.queue.length = 0
  }
}

export default MyLimit