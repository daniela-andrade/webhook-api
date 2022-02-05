import { Webhook } from '../models/webhook'

/**
 * The DB provides methods to store and retrieve webhooks
*/
export interface DB {
    addWebhook(webhook: Webhook): Promise<Webhook>
    getWebhooks(): Promise<Webhook[]>
}