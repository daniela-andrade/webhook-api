import { ValidationError } from './payload'

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
            throw new ValidationError('Url is required')
        }
        if (url.length === 0) {
            throw new ValidationError('Url must not be empty')
        }
        try {
            new URL(url)
        } catch (_) {
            throw new ValidationError('Url format is invalid')
        }
    }
    validateToken(token: string) {
        if (token === undefined || token === null) {
            throw new ValidationError('Token is required')
        }
        if (token.length === 0) {
            throw new ValidationError('Token must not be empty')
        }
    }
}
