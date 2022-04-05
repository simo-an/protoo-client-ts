import RetryOperation, { RetryOperationOptions } from "./operation"

export interface RetryOptions extends RetryOperationOptions {
  retries?: number  // normal = 10 重试次数
  factor?: number // normal = 2
  minTimeout?: number // normal = 1000ms
  maxTimeout?: number // Infinity
  randomize?: boolean  // false
}

const toDefalutRetryOptions = (options: RetryOptions): RetryOptions => {
  const finalOptions: RetryOptions = {
    retries: options?.retries ?? 10, // a ?? b <=> a == null ? b : a
    factor: options?.factor ?? 2,
    minTimeout: options?.minTimeout ?? 1 * 1000,
    maxTimeout: options?.maxTimeout ?? Infinity,
    randomize: options?.randomize ?? false
  }

  return finalOptions
}


class Retry {
  public static retry: Retry = new Retry()

  constructor() { }

  /**
   * 计算第 attemptTime 次重试的时间
   * @param attemptTime 重试次数
   * @param options 参数
   * @returns 第 attemptTime 次重试的时间（ms）
   */
  private createTimeout(attemptTime: number, options: RetryOptions): number {
    const random = options.randomize ? (Math.random() + 1) : 1
    // times = min * x^n
    const time = Math.max(options.minTimeout, 1) * Math.pow(options.factor, attemptTime)
    const timeout = Math.round(random * time)

    return timeout
  }

  /**
   * 计算重试时间列表
   * @param options 重试参数 或 重试时间列表
   * @returns 重试时间列表
   */
  public timeouts(options?: RetryOptions | number[]): number[] {
    if (Array.isArray(options)) {
      return [].concat(options)
    }
    const finalOptions = toDefalutRetryOptions(options)

    if (finalOptions.maxTimeout < finalOptions.minTimeout) {
      throw new Error('Error: minTimeout > maxTimeout')
    }
    const timeouts = []
    for (let i = 0; i < finalOptions.retries; i++) {
      timeouts.push(this.createTimeout(i, finalOptions))
    }
    // 按照时间从小到大排序，一般 timeouts 是已经排列好的， 随机时候可能出现乱序
    if (finalOptions.randomize) {
      timeouts.sort((t1, t2) => t1 - t2)
    }


    return timeouts
  }

  public operation(options?: RetryOptions): RetryOperation {
    const timeouts = this.timeouts(options)
    const operationOptions = {
      forever: options?.forever,
      unref: options?.unref,
      maxRetryTime: options?.maxRetryTime
    }

    if (operationOptions.forever == null) {
      operationOptions.forever = options.retries === Infinity
    }

    return new RetryOperation(timeouts, operationOptions)
  }
}

export default Retry.retry