import bodyParser from 'body-parser'
import express, { Application, Request, Response } from 'express'
import { Webhook } from './models/webhook'
import { Payload } from './models/payload'
import axios, { AxiosResponse } from 'axios'
import {DB} from './db/db'
import { CODE_200, CODE_400, CODE_404, CODE_500, NO_WEBHOOKS, ValidationError } from './models/errors'

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
                res.json({ messages: [`Success creating webhook with url: ${createdWebhook.url} and token: ${createdWebhook.token}`] })
            } catch (error) {
                this.handleError(error, res)
            }
        })
        
        this.app.post('/api/webhooks/test', async (req: Request, res: Response) => {
            try {
                const payload = new Payload(req.body.payload)
                const errors: string[] = []
                const messages: string[] = []
                const promises: Promise<AxiosResponse>[] = []
                const webhooks: Webhook[] = await this.db.getWebhooks()

                if (webhooks.length === 0) {
                    res.json({messages: [NO_WEBHOOKS]})
                }
                for (const webhook of webhooks) {
                    const promise: Promise<AxiosResponse> = this.makeWebkookRequest(
                        webhook,
                        payload.payload
                    ).then((response) => {
                        if (response.status !== CODE_200) {
                            errors.push(`Error posting to ${webhook.url}, ${response.statusText}`)
                        } else {
                            messages.push(`Success posting to ${webhook.url}`)
                        }
                        return response
                    }).catch((error)=> {
                        errors.push(`Error posting to ${webhook.url}, ${error}`)
                        return error
                    })

                    promises.push(promise)
                }
                await Promise.all(promises)
                this.handleTestErrors(res, errors, messages)
            } catch (error) {
                this.handleError(error, res)
            }
        })
    }
    
    startServer(port: number) {
        this.app.listen(port, () => console.log(`Server started listening on port ${port}`))
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
    
    handleError(error: Error, res: Response) {
        if (error instanceof ValidationError) {
            res.status(CODE_400).json({ errors: [error.message] })
        }
        else{
            res.status(CODE_500).json({ errors: [error.message] })
        }
    }

    handleTestErrors(res: Response, errors: string[], messages: string[]) {
        if (errors.length === 0) {
            res.json({messages: messages})
        } else if (messages.length === 0) {
            res.status(CODE_404).json({ errors: errors})
        } else {
            res.status(CODE_404).json({ errors: errors, messages: messages})
        }
    }

}

export const createApp = (db: DB) : WebhooksApp => {
    return new WebhooksApp(db)
}