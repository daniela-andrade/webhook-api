import {createApp, WebhooksApp} from './app'
import { DB } from './db/db'
import { InMemoryDB } from './db/inMemoryDb'
import * as dotenv from 'dotenv'
import path from 'path'

/**
 * This file creates a WebHook's App.
 */ 
dotenv.config({path: path.resolve(__dirname, '../prod.env')})

/**
 * For this particular exercise, I've created an implementation of the
 * DB that stores data in an in-memory list. This means that there is no
 * persistence. For a production application I would implement the DB
 * interface using a persistent db.
 * The in-memory implementation would still be used to run tests.
 */ 
const db: DB = new InMemoryDB()


const app : WebhooksApp = createApp(db)
app.startServer()
