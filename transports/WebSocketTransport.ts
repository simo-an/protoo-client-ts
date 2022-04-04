import Logger from "../Logger";
import EnhancedEventEmitter from "../EnhancedEventEmitter";
import retry from "../retry";

const logger = new Logger('WebSocketTransport');

const DEFAULT_RETRY_OPTIONS = {
	retries    : 10,
	factor     : 2,
	minTimeout : 1 * 1000,
	maxTimeout : 8 * 1000
};

class WebsocketTransport extends EnhancedEventEmitter {
  public closed: boolean = false
  public url: string
  public options: object = {}
  public websocket: WebSocket = null

  constructor(url: string, options) {
    super(logger)
    logger.debug('constructor() [url:%s, options:%o]', url, options);

    this.url = url
    this.initWebsocket()
  }

  private initWebsocket(): void {
    const operation = retry.operation(this.options.retry || DEFAULT_RETRY_OPTIONS)
    operation.attempt((currentAttempt) => {
      if (this.closed) return operation.stop()
      
      logger.debug(`CurrentAttempt: ${currentAttempt}`);

      this.websocket = new WebSocket(this.url)
      

    })
  }

  public close(): void {
    if (this.closed || !this.websocket) return

    this.websocket.onopen = null
    this.websocket.onmessage = null
    this.websocket.onclose = null
    this.websocket.onerror = null

    this.websocket.close()
  }

  public send(message: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.closed) throw new Error('websocket already closed!')

    this.websocket.send(message)
  }
}

export default WebsocketTransport