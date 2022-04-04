import Logger from "./Logger";
import EnhancedEventEmitter from './EnhancedEventEmitter'
import Message from './Message'
import WebSocketTransport from "./transports/WebSocketTransport";

const logger = new Logger('Peer');

class Peer extends EnhancedEventEmitter {
	private transport: WebSocketTransport
	private closed: boolean = false
	private connected: boolean = false
	private sents: Map<number, object> = new Map()
	private data: object = {}

	get isClosed(): boolean { return this.closed }
	get isConnected(): boolean { return this.connected }


	/**
	 * @param {protoo.Transport} transport
	 *
	 * @emits open
	 * @emits {currentAttempt: Number} failed
	 * @emits disconnected
	 * @emits close
	 * @emits {request: protoo.Request, accept: Function, reject: Function} request
	 * @emits {notification: protoo.Notification} notification
	 */
	constructor(transport: WebSocketTransport) {
		super()

		this.initTransport()
	}

	private initTransport(): void {
		if (this.transport) {

		}
	}
}

export default Peer
