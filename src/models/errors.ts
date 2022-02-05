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
export const CODE_200 = 200
export const CODE_400 = 400
export const CODE_404 = 404
export const CODE_500 = 500