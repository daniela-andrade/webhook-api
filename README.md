<h1 align="center">Welcome to webhook-api 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/npm-%3E%3D8.3.0-blue.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D16.13.1-blue.svg" />
  <a href="https://github.com/daniela-andrade/webhook-api#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/daniela-andrade/webhook-api/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
</p>

A simple webhook `API` that allows `API` clients to register `URL`s that will receive `HTTP` requests in response to certain events.

## Prerequisites

- `npm` >=8.3.0
- `node` >=16.13.1

## Install

```sh
npm install
```

## Run tests

```sh
npm run test
```

## Run application as dev environment
The dev environment uses `nodemon` to facilitate quick iteration.

```sh
npm run dev
```

## Run application as prod environment

```sh
npm run prod
```

# Development Considerations

The following points describe the design decisions for this exercise.

## 1. Structuring the entry point of the app
To demonstrate how the application could run with different settings in different environments, there are `[ENV].ts` files which read their settings from `[ENV].env` files.

Amongst other settings, `[ENV].ts` sets the `DB` implementation for the environment.


## 2. `DB` implementation
For this exercise, the `InMemoryDB` implementation doesn't persist to disk.
For a production app I would create an additional `DB` implementation that provides persistence locally or in the cloud.
The `InMemoryDB` implementation would still be used to run the app in the `TEST` environment.


## 2. Request body Validation and Error Handling
The validation of the request body of the POST `api/webhooks` happens when creating a `Webhook`.

The validation of the request body of the POST `api/webhooks/test` happens when creating a `Payload`.

Each class's constructor performs the validation of the fields and formats it expects.

The validation could have also been performed before creating the objects.
However, by putting the validation's logic in the constructors we don't have to add an additional validation step every time we want to create an instance of those classes.
When a validation steps fails, we throw a `ValidationError`.
The error is handled in a catch block and we send an informative response to the request sender.

URL validation in the `Webhook` class is done by testing a regex pattern on the URL provided.
There are libraries that provide validation functionality, but for the scope of the project I chose to keep it simple.

For the `Payload` class, as the payload could be anything, I only check for its presence in the request, not for its format.


## 3. The `APIResponse`
For consistency, I chose to always return a `Response` body that consists of an `APIResponse` object. This object has the following properties:
- a flag, `successful`, stating if the request was successful or not,
- a list of `results` for successful operations,
- a list of `errors` for unsuccessful operations


## 4. Making timely webhook POST requests
I chose to use `Axios` to perform the POST requests to the webhooks.
`Axios`' requests return a `Promise` for an `AxiosResponse`.

To make the requests as timely as possible, these are performed concurrently.
Each request is created as a promise to return a response and we don't wait for the response to send the next request.
This way, they don't block each other.


## 5. Error handling for POST `api/webhooks/test`
Axios rejects the `AxiosResponse` promise when a POST request is unsuccessful.
The error will be handled in the `catch()` method of the promise.
Any other kinds of errors that could happen inside the `then()` method, for example while calling `JSON.stringify()`,
will be rethrown by the `catch()` method so they can be handled in the outer try/catch block instead.


This way, the inner catch handles `AxiosError`s, meaning an error in calling the `Webhook`'s URL. 
The outer catch handles local server errors, meaning errors thrown from our own code.
If the error is handled in the outer catch, the overal response status will be unsuccessful.
If all errors are handled in the inner catch the overal response status will be successful (since we have successesfully collected those errors from the webhooks).


So, if the `AxiosResponse` is unsuccessful, the POST `api/webhook/test` request can still be successful.
This is because  the local server managed to send the request. The problem was with the `Webhook`.



# API Endpoints

## POST `/api/webhooks/`
Posts a webhook

**Parameters**

|          Name | Required |  Type   | Description                                                                                                                                                           |
| -------------:|:--------:|:-------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     `URL` | required | string  | The webhook URL in the format 'protocol://path'. |
|     `token` | required | string  | The token. |



**Response**

```json
// Url param is not sent
{
    "success": false,
    "results": [],
    "errors": [
      {
        statusCode: 400,
        message: 'URL is required'
      }
    ]
}

// Url param is empty
{
    "success": false,
    "results": [],
    "errors": [
      {
        statusCode: 400,
        message: 'URL cannot be empty'
      }
    ]
}

// Url param is invalid
{
    "success": false,
    "results": [],
    "errors": [
      {
        statusCode: 400,
        message: 'URL format is invalid'
      }
    ]
}

// Url param is sent and valid, but token param is not sent
{
    "success": false,
    "results": [],
    "errors": [
      {
        statusCode: 400,
        message: 'Token is required'
      }
    ]
}

// Url param is sent and valid, but token param is empty
{
    "success": false,
    "results": [],
    "errors": [
      {
        statusCode: 400,
        message: 'Token cannot be empty'
      }
    ]
}

// Both the URL and token params are valid
{
    "success": true,
    "results": [
      {
        statusCode: 200,
        URL: <URL>,
        message: 'Success creating webhook'
      }
    ],
    "errors": [],
}
```

## POST `/api/webhooks/test`

Sends a POST request to all webhooks created with POST `/api/webhooks/`. The body of each request is an object with the properties `payload` and `token`.
```ts
{
  payload: any // the payload sent in POST /api/webhooks/test
  token: string // the token sent in POST /api/webhooks/
}
```

**Parameters**

|          Name | Required |  Type   | Description                                                                                                                                                           |
| -------------:|:--------:|:-------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     `payload` | required | any  | The payload that should be sent to the webhooks. |



**Response**

```json
// Payload param is not sent
{
    "success": false,
    "results": [],
    "errors": [
      {
        statusCode: 400,
        message: 'Payload is required'
      }
    ]
}

// Payload param is sent but there are no webhooks
// In this case, there are no errors nor results
{
    "success": true
    "results": [],
    "errors": [],
}

// Payload param is sent
// the POST request to the webhook with URL <URL> fails
{
    "success": true,
    "results": [],
    "errors": [
      {
        URL: <URL>
        statusCode: <ERROR_CODE>,
        message: <ERROR>
      }
    ]
}

// Payload param is sent 
// the POST request to the webhook with URL <URL> succeceds
// the POST request to the webhook with URL <URL2> fails
{
    "success": true,
    "results": [
      {
        URL: <URL>
        statusCode: 200
        message: 'Success posting to <URL>'
      }
    ],
    "errors": [
      {
        URL: <URL2>
        statusCode: <ERROR_CODE>,
        message: <ERROR_MESSAGE>
      }
    ]
    
}

// Payload param is sent
// the POST request to the webhook with URL <URL> succeceds
{
    "success": true,
    "results": [
      {
        URL: <URL>
        statusCode: 200
        message: 'Success posting to <URL>'
      }
    ],
    "errors": []
}
```