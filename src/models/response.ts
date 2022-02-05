/**
 * The response to send to an API Request.
 * The response is only unsuccessful if the errors' list is not empty.
 */
export interface APIResponse {
    success: boolean
    results: Result[]
    errors: Result[]
}

/**
 * A Result object includes detailed information about an operation of a request.
 * The operations can be:
 *     1. Creating a webhook
 *     1. Sending a POST request to one webhook
 * A result can be successful or not.
 * Examples of non successful results are:
 *     1. The request body parameters validation for a POST api/webhook request fails.
 *     2. Sending a POST request to a webhook triggered by a POST api/webhook/test request fails.
 * Result objects are sent in the APIResponse.
 */
export interface Result {
    url?: string
    statusCode: number
    message: string
}

