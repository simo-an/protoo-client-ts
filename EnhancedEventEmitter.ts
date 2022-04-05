import Logger from "./Logger";

let logger = new Logger('EnhancedEventEmitter')

class EnhancedEventEmitter {
	private maxListener: number = Infinity
	private eventListeners: Map<string, Function[]> = new Map()

	constructor(customLogger?: Logger) {
		if (customLogger) logger = customLogger
	}

	public listenerCount(event: string): number {
		const current = this.eventListeners.get(event) || []

		return current.length
	}

	public setMaxListener(max: number): void {
		this.maxListener = max
	}

	public emit(event: string, ...args): void {
		const current = this.eventListeners.get(event)

		if (!current) {
			return
		}

		current.forEach(listener => listener(...args))
	}

	public on(event: string, listener: Function): void {
		const current = this.eventListeners.get(event)

		if (!current) {
			this.eventListeners.set(event, [listener])
			return
		}

		if (current.length > this.maxListener) {
			throw new Error(`the event of ${event} is exceed max listener`)
		}

		current.push(listener)
	}

	public off(event: string, listener: Function): void {
		const current = this.eventListeners.get(event)

		if (!current || current.length === 0) return

		const index = current.findIndex(fn => fn === listener)
		current.splice(index, 1)
	}

	safeEmit(event: string, ...args) {
		try { this.emit(event, ...args); }
		catch (error) {
			logger.error('safeEmit() | event listener threw an error [event:%s]:%o', event, error);
		}
	}

	async safeEmitAsPromise(event: string, ...args) {
		return new Promise((resolve, reject) => {
			this.safeEmit(event, ...args, resolve, reject);
		});
	}
}

export default EnhancedEventEmitter
