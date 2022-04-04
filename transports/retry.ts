class RetryOperation {
  private errors: Error[] = []
  private attempts: number = 1 // 



  constructor() {

  }

  public reset(): void { }
  public stop(): void { }
  public retry(): void { }
  public attempt(): void {

  }

  public try(): void { }
  public start(): void { }
  public errors(): void {

  }

  public attempts(): void { }
  public mainError(): void { }
}

export default RetryOperation