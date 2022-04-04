export interface RetryOperationOptions {
  forever?: boolean   // default false
  unref?: boolean     // default false
  maxRetryTime?: number // default Infinity
}

const toDefaultOptions = (options?: RetryOperationOptions | boolean): RetryOperationOptions => {
  if (options == null) return {}
  if (typeof options === 'boolean') return { forever: options } 

  const finalOptions: RetryOperationOptions = {
      forever: options?.forever ?? false, // a ?? b <=> a == null ? b : a
      unref: options?.unref ?? false,
      maxRetryTime: options?.maxRetryTime ?? Infinity,
    }

  return finalOptions
}

const cloneArray = (array: Array<any>) => array.slice(0) || []

type CallbackFn = (time?: number) => void

class RetryOperation {
  private timeouts: number[] = []
  private originalTimeouts: number[] = []
  private cachedTimeouts: number[] = []
  private options: RetryOperationOptions = {}
  private maxRetryTime: number = Infinity

  private callback: CallbackFn
  private errorList: Error[] = []
  private attemptTime: number = 1 // 

  // 定时器
  private operationStart: number = 0
  private timeout: number
  private timeoutCallback: CallbackFn
  private callbackTimeout: number
  private timer: number


  constructor(timeouts: number[], options?: RetryOperationOptions | boolean) {
    this.timeouts = timeouts
    this.originalTimeouts = cloneArray(timeouts)
    this.options = toDefaultOptions(options)

    if (this.options.forever) {
      this.cachedTimeouts = cloneArray(timeouts)
    }
  }

  /**
   * 重置
   */
  public reset(): void { 
    this.attemptTime = 1
    this.timeouts = cloneArray(this.cachedTimeouts)
  }

  /**
   * 停止
   */
  public stop(): void { 
    if (this.timeout) clearTimeout(this.timeout)
    if (this.timer) clearTimeout(this.timer)

    this.timeouts.length = 0
    this.cachedTimeouts.length = 0
  }

  /**
   * 重试
   */
  public retry(error: Error): boolean { 
    if (this.timeout) clearTimeout(this.timeout)
    if (!error) return false

    this.errorList.push(error)
    

    if (Date.now() - this.operationStart >= this.maxRetryTime) { // 超时
      this.errorList.unshift(new Error('RetryOperation timeout occurred'));

      return false
    }

    let timeout = this.timeouts.shift() // 取出第一个timeout

    if (timeout == null && this.cachedTimeouts.length === 0) {
      return false
    }
    if (timeout == null) {
      this.errorList = this.errorList.slice(-1) // only keep last error
      timeout = this.cachedTimeouts.slice(-1)[0]
    }

    this.timer = setTimeout(() => {
      this.attemptTime ++ // 尝试次数 +1
      if (this.timeoutCallback) {
        this.timeout = setTimeout(() => this.timeoutCallback(this.attemptTime), this.callbackTimeout)

        if (this.options.unref && this.timeout['unref']) {
          this.timeout['unref']()
        }
      }

      if (this.callback) this.callback(this.attemptTime)
    }, timeout)

    if (this.options.unref && this.timer['unref']) {
      this.timer['unref']()
    }

    return true
  }

  /**
   * 尝试
   */
  public attempt(callback: CallbackFn, timeout?: number, timeoutCallback?: CallbackFn): void {
    this.callback = callback

    if (timeout != null) {
      this.callbackTimeout = timeout
    }
    if (timeoutCallback != null) {
      this.timeoutCallback = timeoutCallback
    }

    if (this.timeoutCallback) {
      this.timeout = setTimeout(() => this.timeoutCallback(), this.callbackTimeout)
    }

    this.operationStart = Date.now()
    this.callback(this.attemptTime)
  }

  public try(callback: CallbackFn): void {  this.attempt(callback) }
  public start(callback: CallbackFn): void {  this.attempt(callback) }

  public errors(): Error[] { return this.errorList }
  public attempts(): number { return this.attemptTime }

  /**
   * 获取发生次数最多的Error
   * @returns 发生次数最多的Error
   */
  public mainError(): Error { 
    const errorCount = {}

    let mainError = null
    let maxTime = 0

    this.errorList.forEach(error => {
      const message = error.message
      const count = (errorCount[message] || 0) + 1

      errorCount[message] = count

      if (count > maxTime) {
        maxTime = count
        mainError = error
      }
    })

    return mainError
  }
}

export default RetryOperation