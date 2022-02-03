import bodyParser from 'body-parser'
import express, { Application, Request, Response } from 'express'
import { Webhook } from './models/webhook'
import { Payload } from './models/payload'
import axios, { AxiosResponse } from 'axios'
import {DB} from './db/db'
import { CODE_200, CODE_400, CODE_500, Result, APIResponse, ValidationError } from './models/errors'

export class WebhooksApp {
    db: DB
    app: Application

    constructor(db: DB){
        this.db = db
        this.app = express()
        this.setupMiddleware()
        this.setupRequestEndpoints()
    }

    setupMiddleware() {
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(bodyParser.json())
    }
    
    setupRequestEndpoints() {
        this.app.post('/api/webhooks', async (req: Request, res: Response) => {
            try {
                const { url, token } = req.body
                const webhook = new Webhook(url, token)
                const createdWebhook : Webhook = await this.db.addWebhook(webhook)
                const result: Result = this.createResult(
                    createdWebhook.url, 
                    CODE_200,
                    'Success creating webhook')
                this.handleResponse(CODE_200, [result], null, res)
            } catch (error) {
                const code = error instanceof ValidationError ? CODE_400 : CODE_500
                const result: Result = this.createResult(req.body.url, code, error.message)
                this.handleResponse(code, null, [result], res)
            }
        })
        
        this.app.post('/api/webhooks/test', async (req: Request, res: Response) => {
            const errors: Result[] = []
            const results: Result[] = []
            try {
                const payload = new Payload(req.body.payload)
                const promises: Promise<AxiosResponse>[] = []
                const webhooks: Webhook[] = await this.db.getWebhooks()

                if (webhooks.length === 0) {
                    this.handleResponse(CODE_200, null, null, res)
                }
                for (const webhook of webhooks) {
                    const promise: Promise<AxiosResponse> = this.makeWebkookRequest(
                        webhook,
                        payload.payload
                    ).then((response) => {
                        const result: Result = {
                            url: webhook.url,
                            statusCode: response.status,
                            message: ''
                        }
                        if (response.status !== CODE_200) {
                            result.message = `Error posting to ${webhook.url}: ${response.toString()}`
                            errors.push(result)
                        } else {
                            result.message = `Success posting to ${webhook.url}`
                            results.push(result)
                        }
                        return response
                    }).catch((error)=> {
                        errors.push({
                            url: webhook.url,
                            statusCode: CODE_500,
                            message: `Error posting to ${webhook.url}: ${error}`
                        })
                        return error
                    })

                    promises.push(promise)
                }
                await Promise.all(promises)
                const errorCode = errors.length === 0 ? CODE_200 : CODE_500
                this.handleResponse(errorCode, results, errors, res)
            } catch (error) {
                const code = error instanceof ValidationError ? CODE_400 : CODE_500
                const result: Result = this.createResult(null, code, error.message)
                errors.push(result)
                this.handleResponse(code, results, errors, res)
            }
        })
    }

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

    handleResponse(statusCode: number, results: Result[], errors: Result[], res: Response) {
        const response : APIResponse = {
            success: statusCode === CODE_200 ? true : false,
        }
        if (results !== null && results !== undefined && results.length !== 0){
            response.results = results
        }
        if (errors !== null && errors !== undefined && errors.length !== 0){
            response.errors = errors
        }
        res.status(statusCode).json(response)
    }

    createResult(url: string, statusCode: number, message: string){
        return {
            url: url,
            statusCode: statusCode,
            message:  message
        }
    }

    startServer(port: number) {
        this.app.listen(port, () => console.log(`Server started listening on port ${port}`))
    }

}

export const createApp = (db: DB) : WebhooksApp => {
    return new WebhooksApp(db)
}