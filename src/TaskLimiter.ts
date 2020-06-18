type TaskFactory<T extends any, U extends any> = (...args: T[]) => Promise<U>

class TakLimiter<T, U> {
  private factory: TaskFactory<T, U>
  private argsAry: T[][]
  public readonly limitNumber: number
  public readonly taskCount: number
  private curIdx = 0
  private activeCount = 0
  public resultAry: U[] = []
  public taskList: Promise<U>[] = []
  constructor(f: TaskFactory<T, U>, argsAry: T[][],n: number) {
    this.factory = f
    this.argsAry = argsAry
    this.limitNumber = n
    this.taskCount = argsAry.length
  }
  async run() {
    debugger
    if (this.curIdx === this.taskCount - 1 && this.activeCount === 0) {
      this.taskList.length = 0
      this.curIdx = 0
      return Promise.resolve(() => this.resultAry)
    } else if (this.curIdx < this.taskCount - 1) {
      if (this.activeCount >= this.limitNumber) {
        // 不再并发
        await Promise.race(this.taskList).then(r => {
          this.activeCount--
          this.resultAry.push(r)
        })
      } else {
        this.taskList.push(this.factory.apply(null, this.argsAry[++this.curIdx]))
        this.activeCount++
      }
      // promise会减少存活数量并保存结果
      Promise.race(this.taskList).then(r => {
        this.activeCount--
        this.resultAry.push(r)
      })
    }
    this.run()
  }
}

export default TakLimiter