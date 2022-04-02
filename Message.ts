import Logger from "./Logger";
import { generateRandomNumber } from './utils'

const logger = new Logger('Message')

interface RequestMessage {
	request : boolean
	id      : number
	method  : string
	data    : object
}

interface NotificationMessage {
	notification : boolean
	method       : string
	data         : object
}

interface SuccessResponseMessage {
	response : boolean
	id       : number
	ok       : boolean
	data     : object
}

interface ErrorResponseMessage {
	response    : boolean
	id          : number
	ok          : boolean
	errorCode   : number
	errorReason : string
}


class Message {
	static createRequest(method: string, data?: object) {
		const request = {
			request : true,
			id      : generateRandomNumber(),
			method  : method,
			data    : data || {}
		};

		return request as RequestMessage;
	} 

	static createNotification(method: string, data?: object) {
		const notification = {
			notification : true,
			method       : method,
			data         : data || {}
		};

		return notification as NotificationMessage;
	}

	static createSuccessResponse(requestId: number, data?: object) {
		const response = {
			response : true,
			id       : requestId,
			ok       : true,
			data     : data || {}
		};

		return response as SuccessResponseMessage;
	}

	static createErrorResponse(requestId: number, errorCode: number, errorReason: string) {
		const response = {
			response    : true,
			id          : requestId,
			ok          : false,
			errorCode   : errorCode,
			errorReason : errorReason
		};

		return response as ErrorResponseMessage;
	}
}

export default Message