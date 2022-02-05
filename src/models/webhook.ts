import { ValidationError } from './errors'

const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/

/**
 * The Webhook class represents and validates the url and token requests parameter.
 * The validation can throw a ValidationError.
 */

export class Webhook {
    url: string
    token: string

    constructor(url: string, token: string) {
        this.validateUrl(url)
        this.url = url
        this.validateToken(token)
        this.token = token
    }

    validateUrl(url: string) {
        if (url === undefined || url === null) {
            throw new ValidationError('URL is required')
        }
        if (url.length === 0) {
            throw new ValidationError('URL cannot be empty')
        }
        if (!urlRegex.test(url)){
            throw new ValidationError('URL format is invalid')
        }
    }
    validateToken(token: string) {
        if (token === undefined || token === null) {
            throw new ValidationError('Token is required')
        }
        if (token.length === 0) {
            throw new ValidationError('Token cannot be empty')
        }
    }
}
