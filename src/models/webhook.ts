import { ValidationError } from './errors'

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
        try {
            new URL(url)
        } catch (_) {
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
