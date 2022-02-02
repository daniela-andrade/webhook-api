import {createApp, WebhooksApp} from './app'
import { DB } from './db/db'
import { InMemoryDB } from './db/inMemoryDb'

const PORT = 9876
const db: DB = new InMemoryDB()

const app : WebhooksApp = createApp(db)
app.startServer(PORT)