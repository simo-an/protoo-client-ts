import Logger from "./Logger";
import { generateRandomNumber } from './utils'

const logger = new Logger('Message')

interface RequestMessage {
	request: true
	id: number
	method: string
	data: object
}

interface NotificationMessage {
	notification: true
	method: string
	data: object
}

interface SuccessResponseMessage {
	response: true
	id: number
	ok: true
	data: object
}

interface ErrorResponseMessage {
	response: true
	id: number
	ok: false
	errorCode: number
	errorReason: string
}

type MessageType = RequestMessage | NotificationMessage | SuccessResponseMessage | ErrorResponseMessage

class Message {
	static parse(raw: string): MessageType {
		const object = JSON.parse(raw) as MessageType
		if ('request' in object) { // Request
			const message = object as RequestMessage

			message.request = true
			message.data = message.data || {}

			return message
		}

		if ('response' in object) {
			if (object.ok) {
				const message = object as SuccessResponseMessage

				message.response = true
				message.data = message.data || {}

				return message
			}
			if (!object.ok) {
				const message = object as ErrorResponseMessage

				message.response = true

				return message
			}
		}

		if ('notification' in object) {
			const message = object as NotificationMessage

			message.notification = true
			message.data = message.data || {}

			return message
		}

		throw new TypeError('unknown message type')
	}

	static createRequest(method: string, data?: object) {
		const request = {
			request: true,
			id: generateRandomNumber(),
			method: method,
			data: data || {}
		};

		return request as RequestMessage;
	}

	static createNotification(method: string, data?: object) {
		const notification = {
			notification: true,
			method: method,
			data: data || {}
		};

		return notification as NotificationMessage;
	}

	static createSuccessResponse(requestId: number, data?: object) {
		const response = {
			response: true,
			id: requestId,
			ok: true,
			data: data || {}
		};

		return response as SuccessResponseMessage;
	}

	static createErrorResponse(requestId: number, errorCode: number, errorReason: string) {
		const response = {
			response: true,
			id: requestId,
			ok: false,
			errorCode: errorCode,
			errorReason: errorReason
		};

		return response as ErrorResponseMessage;
	}
}

export default Message