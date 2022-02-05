/**
 * A ValidationError can be thrown while creating a Webhook or a Payload.
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'
    }
}

// Error codes
export const CODE_OK = 200
export const CODE_BAD_REQUEST = 400
export const CODE_NOT_FOUND = 404
export const CODE_INTERNAL_ERROR = 500