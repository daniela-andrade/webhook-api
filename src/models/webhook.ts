import { TOKEN_IS_EMPTY, TOKEN_IS_REQUIRED, URL_FORMAT_IS_INVALID, URL_IS_EMPTY, URL_IS_REQUIRED, ValidationError } from './errors'

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
            throw new ValidationError(URL_IS_REQUIRED)
        }
        if (url.length === 0) {
            throw new ValidationError(URL_IS_EMPTY)
        }
        try {
            new URL(url)
        } catch (_) {
            throw new ValidationError(URL_FORMAT_IS_INVALID)
        }
    }
    validateToken(token: string) {
        if (token === undefined || token === null) {
            throw new ValidationError(TOKEN_IS_REQUIRED)
        }
        if (token.length === 0) {
            throw new ValidationError(TOKEN_IS_EMPTY)
        }
    }
}
