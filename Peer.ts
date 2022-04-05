import Logger from "./Logger";
import EnhancedEventEmitter from './EnhancedEventEmitter'
import Message from './Message'
import WebSocketTransport from "./transports/WebSocketTransport";

const logger = new Logger('Peer');

interface Sent {

	id: number
	method: string
	timer: number
	resolve: (data2: any) => void
	reject: (error: Error) => void
	close: () => void
}

class Peer extends EnhancedEventEmitter {
	public transport: WebSocketTransport
	public isClosed: boolean = false
	public isConnected: boolean = false
	public sents: Map<number, Sent> = new Map()
	public data: object = {}

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

	/**
	 * 关闭Peer和Websocket
	 */
	public close(): void {
		if (this.isClosed) return

		this.isClosed = true
		this.isConnected = false

		this.transport?.close()
		for (let send of this.sents.values()) {
			send.close()
		}

		this.safeEmit('close')
	}


}

export default Peer
