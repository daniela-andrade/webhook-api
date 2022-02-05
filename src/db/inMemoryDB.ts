import { Webhook } from '../models/webhook'
import { DB } from './db'

/**
 * The InMemoryDB implementation of the DB provides methods 
 * to store and retrieve webhooks using an in-memory list.
 * 
 * It also constains reset and addWebhooks methods for use in the TEST environment.
 * These are not part of the DB interface as they are only needed for testing purposes.
 * A DB implementation to use in a production environment wouldn't have these methods.
 */
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
    addWebhooks(webhooks: Webhook[]): Promise<Webhook[]> {
        for (const webhook of webhooks) {
            this.webhooks.push(webhook)
        }
        return Promise.resolve(webhooks)
    }
    
}