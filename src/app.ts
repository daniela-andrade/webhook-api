import bodyParser from 'body-parser'
import express, { Application, Request, Response } from 'express'
import { Webhook } from './models/webhook'
import { Payload } from './models/payload'
import axios, { AxiosResponse } from 'axios'
import { DB } from './db/db'
import { CODE_OK, CODE_BAD_REQUEST, CODE_INTERNAL_ERROR, ValidationError } from './models/errors'
import { Result, APIResponse } from './models/response'

/**
 * The WebhooksApp has two endpoints:
 *     POST api/webhooks/
 *         It creates a webhook
 *     POST api/webhooks/test/
 *         It triggers a POST request to every webhook stored
 */
export class WebhooksApp {
    db: DB
    app: Application

    constructor(db: DB){
        this.db = db
        this.app = express()
        this.setupMiddleware()
        this.setupEndpoints()
    }

    /**
     * Sets up middleware.
     */
    setupMiddleware() {
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(bodyParser.json())
    }
    
    /**
     * Sets up the server's endpoints.
     */
    setupEndpoints() {
        /**
         *  POST api/webhooks
         *  Validates and creates a webhook
         */
        this.app.post('/api/webhooks', async (req: Request, res: Response) => {
            try {
                const { url, token } = req.body
                const validatedWebhook = new Webhook(url, token) // can throw a ValidationError
                const createdWebhook : Webhook = await this.db.addWebhook(validatedWebhook)

                const result: Result = {
                    url: createdWebhook.url, 
                    statusCode: CODE_OK,
                    message: `Success creating webhook with url: ${createdWebhook.url} and token: ${createdWebhook.token}`
                }
                this.handleResponse(/* response  */ res, /* statusCode  */ CODE_OK, /* results  */ [result], /* errors  */ [])
                
            } catch (error) {
                const code = error instanceof ValidationError ? CODE_BAD_REQUEST : CODE_INTERNAL_ERROR
                const result: Result = {
                    statusCode: code, 
                    message: error.message
                }
                this.handleResponse(/* response  */ res, /* statusCode  */ code, /* results  */ [], /* errors  */ [result])
            }
        })

        /**
         * POST api/webhooks/test
         * Validates the payload request parameter.
         * Sends a POST request to all webhooks.
         */
        this.app.post('/api/webhooks/test', async (req: Request, res: Response) => {
            // Successfull POST requests will be added to results, unsuccessful to errors
            const results: Result[] = []
            const errors: Result[] = []
            try {
                const validatedPayload = new Payload(req.body.payload) // can throw a ValidationError

                // Every request will be made in a promise so we don't have to wait before sending the next
                const promises: Promise<void>[] = []

                const webhooks: Webhook[] = await this.db.getWebhooks()

                if (webhooks.length === 0) {
                    // If there are no webhooks, we send a successful response
                    // There are no results and no errors because no POST request has been done
                    this.handleResponse(/* response  */ res, /* statusCode  */ CODE_OK, /* results  */ [], /* errors  */ [])
                    return
                }

                for (const webhook of webhooks) {
                    /**
                     * For every webhook in the db, send a new POST request
                     * The body of the request should be:
                     *     {
                     *         "payload": any   --> the payload received in the POST api/webhook/test request
                     *         "token": string  --> the token provided when the webhook was created
                     *     }
                     */
                    const promise: Promise<void> = this.makeWebkookRequest(
                        webhook,
                        validatedPayload.payload
                    ).then((response) => {

                        // We received a successful response
                        // If the status code was not OK 200, axios would have thrown an error instead

                        const result: Result = {
                            url: webhook.url,
                            statusCode: response.status,
                            message: `Success posting to ${webhook.url}: ${JSON.stringify(response.data)}`
                        }
                        results.push(result)

                    }).catch((error)=> {
                        // Handle AxiosError, any other type should be handled in the outer try catch block
                        if(!axios.isAxiosError(error)){
                            throw(error)
                        }
                        errors.push({
                            url: webhook.url,
                            statusCode: error.response.status,
                            message: `Error posting to ${webhook.url}: ${error}`
                        })
                    })

                    promises.push(promise)
                }

                // Wait for all promises to resolve
                await Promise.all(promises)

                // Send final response
                this.handleResponse(/* response  */ res, /* statusCode  */ CODE_OK, /* results  */ results, /* errors  */ errors)

            } catch (error) {
                const code = error instanceof ValidationError ? CODE_BAD_REQUEST : CODE_INTERNAL_ERROR
                const result: Result = {
                    statusCode: code, 
                    message: error.message
                }
                errors.push(result)
                this.handleResponse(/* response  */ res, /* statusCode  */ code, /* results  */ results, /* errors  */ errors)
            }
        })
    }

    /**
     * Sends a POST request to a webhook and returns a promise for the request's response.
     * The POST request to the webhook should include the token of the webhook and the payload 
     * received in the POST api/webhook/test request
     *
     * @param {Webhook} webhook The webhook to send the POST request to.
     * @param {any} payload The payload to include in the request's body, received in the POST api/webhook/test request.
     * @return {Promise<AxiosResponse>} The promise for the response to the POST request.
     */
    async makeWebkookRequest(
        webhook: Webhook,
        payload: any
    ): Promise<AxiosResponse> {
        const data = {
            token: webhook.token,
            payload: payload,
        }
        return axios.post(webhook.url, data)
    }

    /**
     * Sends a response to a POST request.
     *
     * @param {Response} response The response object.
     * @param {number} statusCode The response status code.
     * @param {Result[]} results The successful results to include in the response.
     * @param {Result[]} errors The errors to include in the response.
     */
    handleResponse(res: Response, statusCode: number, results: Result[], errors: Result[]) {
        const response : APIResponse = {
            success: statusCode === CODE_OK ? true : false,
            results: results,
            errors: errors
        }
        res.status(statusCode).json(response)
    }

    /**
     * Starts the server.
     */
    startServer() {
        this.app.listen(process.env.PORT, () => console.log(`${process.env.ENV} server started listening on port ${process.env.PORT}`))
    }

}

export const createApp = (db: DB) : WebhooksApp => {
    return new WebhooksApp(db)
}