import { Webhook } from '../models/webhook'
import { DB } from './db'

export class InMemoryDB implements DB {

    webhooks: Webhook[] = []

    addWebhook(webhook: Webhook): Promise<Webhook> {
        this.webhooks.push(webhook)
        return Promise.resolve(webhook)
    }
    
    getWebhooks(): Promise<Webhook[]> {
        return Promise.resolve(this.webhooks)
    }

    /* For testing purposes */
    reset() {
        this.webhooks = []
    }
    
}