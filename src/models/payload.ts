import { ValidationError } from './errors'

/**
 * The Payload class represents and validates the payload request parameter. 
 * The validation can throw a ValidationError.
*/

export class Payload {
    payload: any
    constructor(payload: any) {
        this.validate(payload)
        this.payload = payload
    }
    validate(payload: any): void {
        if (payload === undefined || payload === null) {
            throw new ValidationError('Payload is required')
        }
    }
}

