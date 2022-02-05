
import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import request from 'superagent'
import { Result } from '../models/response'
import { Webhook } from '../models/webhook'
import { DB } from '../db/db'
import chai from 'chai'
import deepEqualInAnyOrder from 'deep-equal-in-any-order'

/*
    The TestHelperApp is used to test the POST api/webhooks/test/ endpoint.
    It has two endpoints that correspond to two different webhook urls.
    Each of this endpoints increments a counter when the endpoint is reached.
    This way, it's possible to verify how many times a certain endpoint has been reached.
    Using this class, we can verify that:
        1. The response is received by the expected endpoint
        2. The response body received by the endpoint is as expected
        3. The POST request is only sent once to each endpoint (verifiable with the counter)
    It also provides a way to consistently verify the response when the endpoint is not 
    reachable because we are in control of the unreachable url.
*/

export class TestHelperApp {
    requestCount = {endpoint1: 0, endpoint2: 0}
    app : Application
    reachableUrl1: string
    reachableUrl2: string
    unreachableUrl: string

    constructor(){
        this.app = express()
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(bodyParser.json())

        this.app.post('/test/1', (req: Request, res: Response) => {
            this.requestCount.endpoint1 += 1
            res.json({'Server 1' : req.body})
        })

        this.app.post('/test/2', (req: Request, res: Response) => {
            this.requestCount.endpoint2 += 1
            res.json({'Server 2' : req.body})
        })
    }

    startServer() {
        const port = process.env.TEST_PORT
        this.app.listen(port, () =>
            console.log(`Test helper app started listening on port ${port}`)
        )
        this.reachableUrl1 = `http://localhost:${port}/test/1`
        this.reachableUrl2 = `http://localhost:${port}/test/2`
        this.unreachableUrl = `http://localhost:${port}/not/reachable`
    }

    resetRequestCount() {
        this.requestCount = {endpoint1: 0, endpoint2: 0}
    }

    getRequestCount() {
        return this.requestCount
    }
}


const should = chai.should()
chai.use(deepEqualInAnyOrder)
const { expect } = chai

/**
 * The following helper functions verify that the response body is as expected
*/

/**
 * Verifies the status code is as expected.
 * 
 * @param {request.Response} res The response to verify.
 * @param {number} expectedStatusCode The expected status code for the response.
*/
export const shouldHaveStatusCodeAs = (res: request.Response, expectedStatusCode: number) => {
    res.should.have.status(expectedStatusCode)
}

/**
 * Verifies the success flag is as expected.
 * 
 * @param {request.Response} res The response to verify.
 * @param {number} expectedSuccess The expected success flag value for the response.
*/
export const shouldHaveSuccessAs = (res: request.Response, expectedSuccess: boolean) => {
    res.body.should.be.a('object')
    res.body.should.have.property('success')
    res.body.success.should.be.a('boolean')
    res.body.success.should.be.eql(expectedSuccess)
}

/**
 * Verifies the results are as expected.
 * Before comparing the results, both lists are sorted.
 * This is because the POST request responses could have arrived in any order.
 * 
 * @param {request.Response} res The response to verify.
 * @param {Result[]} expectedResults The expected results for the response.
*/
export const shouldHaveResultsAs = (res: request.Response, expectedResults: Result[]) => {
    res.body.should.be.a('object')
    res.body.should.have.property('results')
    res.body.results.should.be.a('array')
    res.body.results.length.should.be.eql(expectedResults.length)
    expect(res.body.results).to.deep.equalInAnyOrder(expectedResults)
}

/**
 * Verifies the errors are as expected.
 * Before comparing the errors, both lists are sorted.
 * This is because the POST request responses could have arrived in any order.
 * 
 * @param {request.Response} res The response to verify.
 * @param {Result[]} expectedErrors The expected errors for the response.
*/
export const shouldHaveErrorsAs = (res: request.Response, expectedErrors: Result[]) => {
    res.body.should.be.a('object')
    res.body.should.have.property('errors')
    res.body.errors.should.be.a('array')
    res.body.errors.length.should.be.eql(expectedErrors.length)
    expect(res.body.errors).to.deep.equalInAnyOrder(expectedErrors)
}

/**
 * Verifies the list of webhooks in the db is as expected.
 * Before comparing the state, both lists are sorted.
 * This is because the POST request to add the webhooks could have been resolved in any order.
 * 
 * @param {DB} db The db to verify.
 * @param {Webhook[]} expectedEntries The webhooks expected to be in the db.
*/
export const shouldHaveDbStateAs = (db: DB, expectedEntries: Webhook[], done: Mocha.Done) => {
    db.getWebhooks().then((webhooks: Webhook[]) => {
        webhooks.should.be.a('array')
        webhooks.length.should.be.eql(expectedEntries.length)
        expect(webhooks).to.deep.equalInAnyOrder(expectedEntries)
        done()
    }).catch((error: Error)=>done(error))
}