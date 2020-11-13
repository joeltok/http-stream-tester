# HTTP Stream Tester

A library to test streaming of data to HTTP endpoints for ExpressJS Applications. Promise-based.

## Installation

```
npm install --save-dev http-stream-tester
```

## Example usage
app.js
```js
const express = require('express')

app = express();
app.post('/route',(req, res) => {
  req.on('data', (chunk) => {
    console.log(data)
  });
  req.on('end', () => {
    console.log('received.')
    res.send({})
  })
})
```

app.test.js
```js
const httpstreamtester = require('httpstreamtester')
const app = require('./app')

describe('http-stream-tester', () => {
  it('simple post request with stream', async () => {
    const msgs = ['some input a', 'some input b']
    const source = Readable.from(msgs)
    const res = await httpstreamtester(app, source, {
      route: '/route', 
      method: 'post',
    })

    expect(res.status).toEqual(200)
  })
})
```

run
```sh
npm test
> http-stream-tester@0.1.0 test /path/to/application
> jest --env=node

 PASS  ./app.test.js
  httpstreamtester
    ✓ simple post request with stream (36 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.1 s, estimated 1 s
Ran all test suites.
```

## Note when using with Jest

When using with Jest, ensure that Jest runs in the node env by setting the following in `package.json`
```
...
  "scripts": {
    "test": "jest --env=node"
  },
...
```
If not, we will get a `Error: Cross origin http://localhost forbidden` error.

## Arguments

- app: An express server
- source: a readable stream, or a path to a file
- options: 
  - route: the route on the express app
  - method: get, post, put, etc. default: post
  - contentType: the content-type header; default: application/octet-stream
  - axiosOptions: all options that the [axios](https://www.npmjs.com/package/axios) package supports.

## Why axios?

This library spins up the app as a server internally, and has it listen to open ports on localhost. It then uses [axios](https://www.npmjs.com/package/axios) to write streams to the application via these ports. It shuts down the app/server automatically after tests are complete.