const APP_NAME = 'protoo-client';

class Logger {
	private fdebug: (...info: any) => void
	private fwarn: (...info: any) => void
	private ferror: (...info: any) => void
	constructor(prefix) {
		if (prefix) {
			this.fdebug = (...info: any) => console.debug(`${APP_NAME}:${prefix} ${info}`);
			this.fwarn = (...info: any) => console.warn(`${APP_NAME}:WARN:${prefix} ${info}`);
			this.ferror = (...info: any) => console.error(`${APP_NAME}:ERROR:${prefix} ${info}`);
		}
		else {
			this.fdebug = (...info: any) => console.debug(`${APP_NAME} ${info}`);
			this.fwarn = (...info: any) => console.debug(`${APP_NAME}:WARN ${info}`);
			this.ferror = (...info: any) => console.debug(`${APP_NAME}:ERROR ${info}`);
		}
	}

	get debug() { return this.fdebug; }
	get warn() { return this.fwarn; }
	get error() { return this.ferror; }
}

export default Logger
