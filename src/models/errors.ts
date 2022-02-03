export const CODE_200 = 200
export const CODE_400 = 400
export const CODE_404 = 404
export const CODE_500 = 500

export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'
    }
}

export interface Result {
    url?: string
    statusCode: number
    message: string
}

export interface APIResponse {
    success: boolean
    results?: Result[]
    errors?: Result[]
}