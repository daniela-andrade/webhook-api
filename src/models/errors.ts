export const CODE_200 = 200
export const CODE_400 = 400
export const CODE_404 = 404
export const CODE_500 = 500

export const URL_IS_REQUIRED = 'URL is required'
export const URL_IS_EMPTY = 'URL cannot be empty'
export const URL_FORMAT_IS_INVALID = 'URL format is invalid'
export const TOKEN_IS_REQUIRED = 'Token is required'
export const TOKEN_IS_EMPTY = 'Token cannot be empty'
export const PAYLOAD_IS_REQUIRED = 'Payload is required'
export const NO_WEBHOOKS = 'There are no webhooks, no POST requests were sent'


export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'
    }
}