// FOR TESTING PURPOSES
import chai from 'chai'
import chaiHttp from 'chai-http'
import { createApp } from '../app'
import bodyParser from 'body-parser'
import express, { Application, Request, Response } from 'express'
import { InMemoryDB } from '../db/inMemoryDB'
import { Webhook } from '../models/webhook'
import { URL_IS_REQUIRED, URL_IS_EMPTY, URL_FORMAT_IS_INVALID, TOKEN_IS_REQUIRED, TOKEN_IS_EMPTY, PAYLOAD_IS_REQUIRED, CODE_200, CODE_400, NO_WEBHOOKS, CODE_500, CODE_404 } from '../models/errors'
import request from 'superagent'

const PORT = 9876
const TEST_PORT = 3005
const db = new InMemoryDB()
const webhooksApp = createApp(db)
webhooksApp.startServer(PORT)
const app : Application = webhooksApp.app

const test_app: Application = express()
test_app.use(bodyParser.urlencoded({ extended: false }))
test_app.use(bodyParser.json())

test_app.post('/test/', (req: Request, res: Response) => {
    res.json(req.body)
})
test_app.listen(TEST_PORT, () =>
    console.log(`Test server started listening on port ${TEST_PORT}`)
)

const VALID_TOKEN = 'token'
const VALID_TOKEN_2 = 'token2'
const VALID_URL_FORMAT = 'http://www.urlExample.io'
const VALID_URL_FORMAT_2 = 'http://www.urlExample2.io'
const REACHABLE_URL = `http://localhost:${TEST_PORT}/test`
const INVALID_URL = 'invalid.com'
const VALID_PAYLOAD = ['payload']

const should = chai.should()
chai.use(chaiHttp)

function shouldHaveMessage(res: request.Response, messages: string[], code: number) {
    res.should.have.status(code)
    res.body.should.be.a('object')
    res.body.should.have.property('messages')
    res.body.messages.should.be.a('array')
    res.body.messages.length.should.be.eql(messages.length)
    for (const message of messages){
        res.body.messages.includes(message).should.eql(true)
    }
}

const shouldHaveError = (res: request.Response, errors: string[], errorCode: number) => {
    res.should.have.status(errorCode)
    res.body.should.be.a('object')
    res.body.should.have.property('errors')
    res.body.errors.should.be.a('array')
    res.body.errors.length.should.be.eql(errors.length)
    for (const error of errors){
        res.body.errors.includes(error).should.eql(true)
    }
}

const dbStateShouldBe = (num_entries: number, expectedWebhooks: Webhook[], done: Mocha.Done) => {
    db.getWebhooks().then((webhooks: Webhook[]) => {
        webhooks.should.be.a('array')
        webhooks.length.should.be.eql(num_entries)
        for (const expectedWebhook of expectedWebhooks){
            webhooks.includes(expectedWebhook)
        }
        done()
    }).catch(error=>done(error))
}

describe('api/webhook', () => {
    beforeEach( () => { //Before each test we empty the database
        db.reset()
    })

    describe('/POST api/webwhook', () => {
        it('it should not POST a webhook if the url is missing', (done) => {
            const webhook = {
                token: VALID_TOKEN
            }
            chai.request(app)
                .post('/api/webhooks/')
                .send(webhook)
                .end((err, res: request.Response) => {
                    shouldHaveError(res, [URL_IS_REQUIRED], CODE_400)
                    db.getWebhooks().then((webhooks: Webhook[]) => {
                        webhooks.should.be.a('array')
                        webhooks.length.should.be.eql(0)
                        done()
                    }).catch(error=>done(error))
                })
        })
    })

    describe('/POST api/webwhook', () => {
        it('it should not POST a webhook if the url is empty', (done) => {
            const webhook = {
                url: '',
                token: VALID_TOKEN
            }
            chai.request(app)
                .post('/api/webhooks/')
                .send(webhook)
                .end((err, res) => {
                    shouldHaveError(res, [URL_IS_EMPTY], CODE_400)
                    done()
                })
        })
    })

    describe('/POST api/webwhook', () => {
        it('it should not POST a webhook if the url is invalid', (done) => {
            const webhook = {
                url: INVALID_URL,
                token: VALID_TOKEN
            }
            chai.request(app)
                .post('/api/webhooks/')
                .send(webhook)
                .end((err, res) => {
                    shouldHaveError(res, [URL_FORMAT_IS_INVALID], CODE_400)
                    done()
                })
        })
    })

    describe('/POST api/webwhook', () => {
        it('it should not POST a webhook if the token is missing', (done) => {
            const webhook = {
                url: VALID_URL_FORMAT
            }
            chai.request(app)
                .post('/api/webhooks/')
                .send(webhook)
                .end((err, res) => {
                    shouldHaveError(res, [TOKEN_IS_REQUIRED], CODE_400)
                    done()
                })
        })
    })

    describe('/POST api/webwhook', () => {
        it('it should not POST a webhook if the token is empty', (done) => {
            const webhook = {
                url: VALID_URL_FORMAT,
                token: ''
            }
            chai.request(app)
                .post('/api/webhooks/')
                .send(webhook)
                .end((err, res) => {
                    shouldHaveError(res, [TOKEN_IS_EMPTY], CODE_400)
                    done()
                })
        })
    })

    describe('/POST api/webwhook', () => {
        it('it should POST a webhook if the url and token are valid', (done) => {
            const VALID_WEBHOOK = new Webhook(VALID_URL_FORMAT, VALID_TOKEN)
            chai.request(app)
                .post('/api/webhooks/')
                .send(VALID_WEBHOOK)
                .end( (err, res) => {
                    shouldHaveMessage(res, [`Success creating webhook with url: ${VALID_URL_FORMAT} and token: ${VALID_TOKEN}`], CODE_200)
                    dbStateShouldBe(1, [VALID_WEBHOOK], done)
                })
        })
    })

    describe('/POST api/webwhook', () => {
        it('it should POST multiple webhooks if the urls and tokens are valid', (done) => {

            const VALID_WEBHOOK = new Webhook(VALID_URL_FORMAT, VALID_TOKEN)
            chai.request(app)
                .post('/api/webhooks/')
                .send(VALID_WEBHOOK)
                .end( (err, res) => {
                    shouldHaveMessage(res, [`Success creating webhook with url: ${VALID_URL_FORMAT} and token: ${VALID_TOKEN}`], CODE_200)
                    const VALID_WEBHOOK_2 = new Webhook(VALID_URL_FORMAT_2, VALID_TOKEN_2)
                    chai.request(app)
                        .post('/api/webhooks/')
                        .send(VALID_WEBHOOK_2)
                        .end( (err, res) => {
                            shouldHaveMessage(res, [`Success creating webhook with url: ${VALID_URL_FORMAT_2} and token: ${VALID_TOKEN_2}`], CODE_200)
                            dbStateShouldBe(2, [VALID_WEBHOOK, VALID_WEBHOOK_2], done)
                        })
                })
        })
    })
})

describe('api/webhook/test', () => {
    beforeEach( () => { //Before each test we empty the database
        db.reset()
    })

    describe('/POST api/webwhook/test', () => {
        it('it should not POST a test if the payload is missing', (done) => {
            chai.request(app)
                .post('/api/webhooks/test')
                .send({})
                .end((err, res: request.Response) => {
                    shouldHaveError(res, [PAYLOAD_IS_REQUIRED], CODE_400)
                    done()
                })
        })
    })

    describe('/POST api/webwhook/test', () => {
        it('it should POST a test with no effect if the payload is valid but there are no webhooks', (done) => {
            const payload = {
                payload: VALID_PAYLOAD
            }
            chai.request(app)
                .post('/api/webhooks/test')
                .send(payload)
                .end((err, res: request.Response) => {
                    shouldHaveMessage(res, [NO_WEBHOOKS], CODE_200)
                    done()
                }) 
        })
    })

    describe('/POST api/webwhook/test', () => {
        it('it should POST a test with errors if the payload is valid but a webhook is not reachable', (done) => {
            const payload = {
                payload: VALID_PAYLOAD
            }

            const VALID_WEBHOOK = new Webhook(VALID_URL_FORMAT, VALID_TOKEN)
            db.addWebhook(VALID_WEBHOOK).then((webhook) => {
                chai.request(app)
                    .post('/api/webhooks/test')
                    .send(payload)
                    .end((err, res: request.Response) => {
                        shouldHaveError(res, [`Error posting to ${webhook.url}, Error: getaddrinfo ENOTFOUND www.urlexample.io`], CODE_404)
                        done()
                    }) 
            }).catch((error)=>done(error))
        }).timeout(20000)
    })


    describe('/POST api/webwhook/test', () => {
        it('it should POST a test with no errors if the payload and the webhook are valid', (done) => {
            const payload = {
                payload: VALID_PAYLOAD
            }
            const REACHABLE_WEBHOOK = new Webhook(REACHABLE_URL, VALID_TOKEN)

            db.addWebhook(REACHABLE_WEBHOOK).then((_) => {
                chai.request(app)
                    .post('/api/webhooks/test')
                    .send(payload)
                    .end((err, res: request.Response) => {
                        shouldHaveMessage(res, [`Success posting to ${REACHABLE_URL}`], CODE_200)
                        done()
                    }) 
            }).catch((error)=>done(error))
        }).timeout(20000)
    })

})
    