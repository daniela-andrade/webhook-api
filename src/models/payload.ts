import { ValidationError } from './errors'

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

