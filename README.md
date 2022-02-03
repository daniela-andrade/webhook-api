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

> A simple webhook api

## Prerequisites

- npm >=8.3.0
- node >=16.13.1

## Install

```sh
npm install
```

## Run tests

```sh
npm run test
```

## Run application as dev environment

```sh
npm run dev
```

## Run application as prod environment

```sh
npm run prod
```
<br/>
<br/>

# API Endpoints

> ### POST /api/webhooks/
> ### POST /api/webhooks/test/
___
<br/>
<br/>

### POST /api/webhooks/
Posts a webhook
<br/>
<br/>

**Parameters**

|          Name | Required |  Type   | Description                                                                                                                                                           |
| -------------:|:--------:|:-------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     `url` | required | string  | The webhook url in the format 'protocol://hostname'. |
|     `token` | required | string  | The token. |

<br/>

**Response**

```
// Url param is not sent
{
    "success": false,
    "errors": [
      {
        statusCode: 400,
        message: 'URL is required'
      }
    ]
}

or

// Url param is empty
{
    "success": false,
    "errors": [
      {
        statusCode: 400,
        message: 'URL cannot be empty'
      }
    ]
}

or

// Url param is invalid
{
    "success": false,
    "errors": [
      {
        statusCode: 400,
        message: 'URL format is invalid'
      }
    ]
}

or

// Url param is sent and valid, but token param is not sent
{
    "success": false,
    "errors": [
      {
        statusCode: 400,
        message: 'Token is required'
      }
    ]
}

or

// Url param is sent and valid, but token param is empty
{
    "success": false,
    "errors": [
      {
        statusCode: 400,
        message: 'Token cannot be empty'
      }
    ]
}

or 

// Both the url and token params are valid
{
    "success": true,
    "results": [
      {
        statusCode: 200,
        url: <URL>,
        message: 'Success creating webhook'
      }
    ]
}
```
<br/>
<br/>

### POST /api/webhooks/test
Sends a POST request to all webhooks created with POST /api/webhooks/. The body of each request is an object with the properties payload and token.
```
{
  payload: any // the payload sent in POST /api/webhooks/test
  token: string // the token sent in POST /api/webhooks/
}
```
<br/>
<br/>

**Parameters**

|          Name | Required |  Type   | Description                                                                                                                                                           |
| -------------:|:--------:|:-------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     `payload` | required | any  | The payload that should be sent to the webhooks. |

<br/>

**Response**

```
// Payload param is not sent
{
    "success": false,
    "errors": [
      {
        statusCode: 400,
        message: 'Payload is required'
      }
    ]
}

or

// Payload param is sent but there are no webhooks
// In this case, there are no errors nor results
{
    "success": true
}

or

// Payload param is sent
// the POST request to the webhook with url <URL> fails
{
    "success": false,
    "errors": [
      {
        url: <URL>
        statusCode: <ERROR_CODE>,
        message: <ERROR>
      }
    ]
}

or

// Payload param is sent 
// the POST request to the webhook with url <URL> succeceds
// the POST request to the webhook with url <URL2> fails
{
    "success": false,
    "errors": [
      {
        url: <URL2>
        statusCode: <ERROR_CODE>,
        message: <ERROR_MESSAGE>
      }
    ]
    "results": [
      {
        url: <URL>
        statusCode: 200
        message: 'Success posting to <URL>'
      }
    ]
}

or 

// Payload param is sent
// the POST request to the webhook with url <URL> succeceds
{
    "success": true,
    "results": [
      {
        url: <URL>
        statusCode: 200
        message: 'Success posting to <URL>'
      }
    ]
}
```

## Author

👤 **danielaandrade**

* Github: [@daniela-andrade](https://github.com/daniela-andrade)


## 📝 License

Copyright © 2022 [danielaandrade](https://github.com/daniela-andrade).<br />

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_