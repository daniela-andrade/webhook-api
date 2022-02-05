// FOR TESTING PURPOSES
import chai from 'chai'
import chaiHttp from 'chai-http'
import { createApp } from '../app'
import { Application } from 'express'
import { InMemoryDB } from '../db/inMemoryDB'
import { Webhook } from '../models/webhook'
import { CODE_200, CODE_400, CODE_404 } from '../models/errors'
import { Result } from '../models/response'
import request from 'superagent'
import { TestHelperApp, shouldHaveDbStateAs, shouldHaveErrorsAs, shouldHaveResultsAs, shouldHaveSuccessAs, shouldHaveStatusCodeAs} from './testUtils'
import dotenv from 'dotenv'
import path from 'path'
import { Payload } from '../models/payload'

// Read environment variables for the TEST environment
dotenv.config({path: path.resolve(__dirname, '../../test.env')})

// Create an in-memory DB to facilitate testing
const db = new InMemoryDB()

// Create an instance of the app
const webhooksApp = createApp(db)
webhooksApp.startServer()
const app : Application = webhooksApp.app

// Create an instance of the helper app
// This helper app will provide 2 reachable endpoints
// These endpoints will be used as webhook urls
// So we can test if the POST request the app sends
// can reach the helper app
const testHelperApp = new TestHelperApp()
testHelperApp.startServer()

// Constants used during the tests for the POST request parameters
export const VALID_TOKEN = 'token'
export const VALID_TOKEN_2 = 'token2'
export const VALID_URL_FORMAT = 'http://www.urlExample.io'
export const VALID_URL_FORMAT_2 = 'http://www.urlExample2.io'
export const INVALID_URL = 'invalid.com'
export const VALID_PAYLOAD = ['payload']

chai.use(chaiHttp)

/**  
 * To verify the request response, we use helper methods from testUtils
 * There are four helper methods:
 *      shouldHaveStatusCodeAs(res, CODE_400)
 *      shouldHaveSuccessAs(res, expectedSuccess)
 *      shouldHaveResultsAs(res, expectedResults)
 *      shouldHaveErrorsAs(res, expectedErrors)
 *      shouldHaveDbStateAs(db, numEntries, entries, done)
*/

describe('api/webhook', () => {
    beforeEach( () => { 
        //Before each test we empty the database
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
                    const expectedErrors: Result[] = [{
                        statusCode: CODE_400,
                        message: 'URL is required'
                    }]
                    
                    shouldHaveStatusCodeAs(res, /* expectedStatusCode */ CODE_400)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ false)
                    shouldHaveResultsAs(res, /* expectedResults */ [])
                    shouldHaveErrorsAs(res, /* expectedErrors */ expectedErrors)
                    shouldHaveDbStateAs(db, /* expectedEntries */ [], done)
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
                    const expectedErrors: Result[] = [{
                        statusCode: CODE_400,
                        message: 'URL cannot be empty'
                    }]

                    shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_400)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ false)
                    shouldHaveResultsAs(res, /* expectedResults */ [])
                    shouldHaveErrorsAs(res, /* expectedErrors */ expectedErrors)
                    shouldHaveDbStateAs(db, /* expectedEntries */ [], done)
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
                    const expectedErrors: Result[] = [{
                        statusCode: CODE_400,
                        message: 'URL format is invalid'
                    }]

                    shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_400)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ false)
                    shouldHaveResultsAs(res, /* expectedResults */ [])
                    shouldHaveErrorsAs(res, /* expectedErrors */ expectedErrors)
                    shouldHaveDbStateAs(db, /* expectedEntries */ [], done)
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
                    const expectedErrors: Result[] = [{
                        statusCode: CODE_400,
                        message: 'Token is required'
                    }]

                    shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_400)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ false)
                    shouldHaveResultsAs(res, /* expectedResults */ [])
                    shouldHaveErrorsAs(res, /* expectedErrors */ expectedErrors)
                    shouldHaveDbStateAs(db, /* expectedEntries */ [], done)
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
                    const expectedErrors: Result[] = [{
                        statusCode: CODE_400,
                        message: 'Token cannot be empty'
                    }]
                    shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_400)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ false)
                    shouldHaveResultsAs(res, /* expectedResults */ [])
                    shouldHaveErrorsAs(res, /* expectedErrors */ expectedErrors)
                    shouldHaveDbStateAs(db, /* expectedEntries */ [], done)
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
                    const expectedResults: Result[] = [{
                        url: VALID_URL_FORMAT,
                        statusCode: CODE_200,
                        message: `Success creating webhook with url: ${VALID_URL_FORMAT} and token: ${VALID_TOKEN}`
                    }]

                    shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_200)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ true)
                    shouldHaveResultsAs(res, /* expectedResults */ expectedResults)
                    shouldHaveErrorsAs(res, /* expectedErrors */ [])
                    shouldHaveDbStateAs(db, /* expectedEntries */ [VALID_WEBHOOK], done)
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

                    const expectedResults: Result[] = [{
                        url: VALID_URL_FORMAT,
                        statusCode: CODE_200,
                        message: `Success creating webhook with url: ${VALID_URL_FORMAT} and token: ${VALID_TOKEN}`
                    }]

                    shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_200)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ true)
                    shouldHaveResultsAs(res, /* expectedResults */ expectedResults)
                    shouldHaveErrorsAs(res, /* expectedErrors */ [])
                    shouldHaveDbStateAs(db, /* expectedEntries */ [VALID_WEBHOOK], () => {return})

                    const VALID_WEBHOOK_2 = new Webhook(VALID_URL_FORMAT_2, VALID_TOKEN_2)
                    chai.request(app)
                        .post('/api/webhooks/')
                        .send(VALID_WEBHOOK_2)
                        .end( (err, res) => {

                            const expectedResults: Result[] = [{
                                url: VALID_URL_FORMAT_2,
                                statusCode: CODE_200,
                                message: `Success creating webhook with url: ${VALID_URL_FORMAT_2} and token: ${VALID_TOKEN_2}`
                            }]

                            shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_200)
                            shouldHaveSuccessAs(res, /* expectedSuccess */ true)
                            shouldHaveResultsAs(res, /* expectedResults */ expectedResults)
                            shouldHaveErrorsAs(res, /* expectedErrors */ [])
                            shouldHaveDbStateAs(db, /* expectedEntries */ [VALID_WEBHOOK, VALID_WEBHOOK_2], done)
                        })
                })
        })
    })
})

describe('api/webhook/test', () => {
    beforeEach( () => { 
        //Before each test we empty the database
        db.reset()
    })

    describe('/POST api/webwhook/test', () => {
        it('it should not POST a test if the payload is missing', (done) => {
            chai.request(app)
                .post('/api/webhooks/test')
                .send({})
                .end((err, res: request.Response) => {
                    const expectedErrors: Result[] = [{
                        statusCode: CODE_400,
                        message: 'Payload is required'
                    }]

                    shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_400)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ false)
                    shouldHaveResultsAs(res, /* expectedResults */ [])
                    shouldHaveErrorsAs(res, /* expectedErrors */ expectedErrors)
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

                    shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_200)
                    shouldHaveSuccessAs(res, /* expectedSuccess */ true)
                    shouldHaveErrorsAs(res, /* expectedResults */ [])
                    shouldHaveResultsAs(res, /* expectedErrors */ [])
                    done()
                }) 
        })
    })

    describe('/POST api/webwhook/test', () => {
        it('it should POST a test with errors if the payload is valid but a webhook is not reachable', (done) => {
            const payload = {
                payload: VALID_PAYLOAD
            }
            const VALID_WEBHOOK = new Webhook(testHelperApp.unreachableUrl, VALID_TOKEN)
            db.addWebhook(VALID_WEBHOOK).then((_) => {
                chai.request(app)
                    .post('/api/webhooks/test')
                    .send(payload)
                    .end((err, res: request.Response) => {
                        const expectedErrors: Result[] = [{
                            url: testHelperApp.unreachableUrl,
                            statusCode: CODE_404,
                            message: `Error posting to ${testHelperApp.unreachableUrl}: Error: Request failed with status code 404`
                        }]
                        
                        shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_200)
                        shouldHaveSuccessAs(res, /* expectedSuccess */ true)
                        shouldHaveResultsAs(res, /* expectedResults */ [])
                        shouldHaveErrorsAs(res, /* expectedErrors */ expectedErrors)
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
            const REACHABLE_WEBHOOK = new Webhook(testHelperApp.reachableUrl1, VALID_TOKEN)
            db.addWebhook(REACHABLE_WEBHOOK).then(() => {
                chai.request(app)
                    .post('/api/webhooks/test')
                    .send(payload)
                    .end((err, res: request.Response) => {
                        const expectedResults: Result[] = [{
                            url: testHelperApp.reachableUrl1,
                            statusCode: CODE_200,
                            message: `Success posting to ${testHelperApp.reachableUrl1}: {"Server 1":{"token":"${VALID_TOKEN}","payload":["${payload.payload}"]}}`
                        }]

                        shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_200)
                        shouldHaveSuccessAs(res, /* expectedSuccess */ true)
                        shouldHaveResultsAs(res, /* expectedResults */ expectedResults)
                        shouldHaveErrorsAs(res, /* expectedErrors */ [])
                        done()
                    }) 
            }).catch((error)=>done(error))
        }).timeout(20000)
    })

    describe('/POST api/webwhook/test', () => {
        it('it should only POST once per webhook', (done) => {
            const payload = {
                payload: VALID_PAYLOAD
            }
            const REACHABLE_WEBHOOK_1 = new Webhook(testHelperApp.reachableUrl1, VALID_TOKEN)
            const REACHABLE_WEBHOOK_2 = new Webhook(testHelperApp.reachableUrl2, VALID_TOKEN)
            testHelperApp.resetRequestCount()

            db.addWebhooks([REACHABLE_WEBHOOK_1, REACHABLE_WEBHOOK_2]).then((_) => {

                chai.request(app)
                    .post('/api/webhooks/test/')
                    .send(payload)
                    .end((err, res: request.Response) => {
                        const expectedResults: Result[] = [
                            {
                                url: testHelperApp.reachableUrl1,
                                statusCode: CODE_200,
                                message: `Success posting to ${testHelperApp.reachableUrl1}: {"Server 1":{"token":"${VALID_TOKEN}","payload":["${payload.payload}"]}}`
                            },
                            {
                                url: testHelperApp.reachableUrl2,
                                statusCode: CODE_200,
                                message: `Success posting to ${testHelperApp.reachableUrl2}: {"Server 2":{"token":"${VALID_TOKEN}","payload":["${payload.payload}"]}}`
                            }
                        ]
                        
                        shouldHaveStatusCodeAs(res , /* expectedStatusCode */ CODE_200)
                        shouldHaveSuccessAs(res, /* expectedSuccess */ true)
                        shouldHaveResultsAs(res, /* expectedResults */ expectedResults)
                        shouldHaveErrorsAs(res, /* expectedErrors */ [])
                        testHelperApp.getRequestCount().should.be.eql({endpoint1: 1, endpoint2: 1})
                        done()
                    }) 
            }).catch((error)=>done(error))
        }).timeout(20000)
    })
})
    