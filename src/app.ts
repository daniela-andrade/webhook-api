import bodyParser from 'body-parser'
import express, { Application, Request, Response } from 'express'
import { Webhook } from './models/webhook'
import { Payload } from './models/payload'
import axios, { AxiosResponse } from 'axios'

const app: Application = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const PORT = 9876
const TEST_PORT = 3005
const CODE_200 = 200
const CODE_404 = 404
const CODE_500 = 500

const webhooks: Webhook[] = []

app.post('/api/webhooks', (req: Request, res: Response) => {
    try {
        const { url, token } = req.body
        const webhook = new Webhook(url, token)
        webhooks.push(webhook)
        res.json({ webhook: webhook })
    } catch (error) {
        handleError(error, res)
    }
})

app.post('/api/webhooks/test', async (req: Request, res: Response) => {
    try {
        const payload = new Payload(req.body.payload)
        const errors: string[] = []
        for (const webhook of webhooks) {
            const response: AxiosResponse = await makeWebkookRequest(
                webhook,
                payload.payload
            )
            console.log(`Status Code: ${response.status}`)

            if (response.status !== CODE_200) {
                errors.push(
                    `Error making POST request to ${webhook.url}: ${response.statusText}`
                )
            }
        }
        if (errors.length === 0) {
            res.send('Sucessfully sent POST request to all webhooks')
        } else {
            res.status(CODE_404).json({ errors: errors })
        }
    } catch (error) {
        handleError(error, res)
    }
})

app.listen(PORT, () => console.log(`Server started listening on port ${PORT}`))

const makeWebkookRequest = async (
    webhook: Webhook,
    payload: any
): Promise<AxiosResponse> => {
    const data = {
        token: webhook.token,
        payload: payload,
    }
    return axios.post(webhook.url, data)
}

function handleError(error: Error, res: Response) {
    res.status(CODE_500).json({ errors: [error.message] })
}

// FOR TESTING PURPOSES

const test_app: Application = express()
test_app.use(bodyParser.urlencoded({ extended: false }))
test_app.use(bodyParser.json())

test_app.post('/test/', (req: Request, res: Response) => {
    console.log(`Received test POST request: ${req.body}`)
    res.json(req.body)
})
test_app.listen(TEST_PORT, () =>
    console.log(`Test server started listening on port ${TEST_PORT}`)
)
