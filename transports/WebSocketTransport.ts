import Logger from "../Logger";
import EnhancedEventEmitter from "../EnhancedEventEmitter";
import retry, { RetryOptions } from "../retry";
import { isClosedViaServer, isString } from "../utils";
import RetryOperation from "../retry/operation";
import Message from "../Message";

const logger = new Logger('WebSocketTransport');

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  retries: 10,
  factor: 2,
  minTimeout: 1 * 1000,
  maxTimeout: 8 * 1000
};

class WebsocketTransport extends EnhancedEventEmitter {
  public url: string | URL
  public protocol: string
  public options: RetryOptions = DEFAULT_RETRY_OPTIONS
  public websocket: WebSocket = null

  public isClosed: boolean = false
  public isConnected: boolean = false
  //
  private operation: RetryOperation

  constructor(url: string | URL, protocol?: string | RetryOptions, retryOptions?: RetryOptions) {
    super(logger)
    logger.debug('constructor() [url:%s, options:%o]', url);

    this.url = url
    if (isString(protocol)) {
      this.protocol = protocol as string
    }
    if (retryOptions) {
      this.options = retryOptions
    }

    this.initWebsocket()
  }

  private initWebsocket(): void {
    this.operation = retry.operation(this.options)
    this.operation.attempt((currentAttempt) => {
      if (this.isClosed) return this.operation.stop()

      logger.debug(`CurrentAttempt: ${currentAttempt}`);

      this.websocket = new WebSocket(this.url, this.protocol)

      this.websocket.onopen = this.onOpen.bind(this)
      this.websocket.onerror = this.onError.bind(this)
      this.websocket.onmessage = this.onMessage.bind(this)
      this.websocket.onclose = (event) => this.onClose(event, currentAttempt)
    })
  }

  private onOpen(): void {
    if (this.isClosed) return
    this.isConnected = true
    this.safeEmit('open')
  }

  private onClose(event: CloseEvent, currentAttempt: number): void {
    if (this.isClosed) return

    logger.error(`WebSocket close: ${event.reason}`)

    if (!isClosedViaServer(event.code)) {
      if (!this.isConnected) {
        this.safeEmit('failed', currentAttempt)
        if (this.isClosed) return
        if (this.operation.retry(new Error(event.reason))) return
      } else {
        this.isConnected = false
        this.operation.stop()
        this.safeEmit('disconnected')

        if (this.isClosed) return

        return this.initWebsocket()
      }
    }
    this.isConnected = false
    this.isClosed = true
    this.safeEmit('close')

  }

  private onError(event: ErrorEvent): void {
    if (this.isClosed) return

    logger.error(`WebSocket error: ${event.message}`)
  }

  private onMessage(event: MessageEvent): void {
    if (this.isClosed) return

    const message = Message.parse(event.data)

    if (!message) return

    if (this.listenerCount('message')) return

    this.safeEmit('message', message)
  }

  public close(): void {
    if (this.isClosed || !this.websocket) return

    this.isConnected = false

    this.websocket.onopen = null
    this.websocket.onmessage = null
    this.websocket.onclose = null
    this.websocket.onerror = null

    this.websocket.close()
  }

  public send(message: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.isClosed) throw new Error('websocket already closed!')

    this.websocket.send(message)
  }
}

export default WebsocketTransport