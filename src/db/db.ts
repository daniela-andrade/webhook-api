import { Webhook } from '../models/webhook'

export interface DB {
    addWebhook(webhook: Webhook): Promise<Webhook>
    getWebhooks(): Promise<Webhook[]>
}