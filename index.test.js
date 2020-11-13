const { Readable } = require('stream')
const express = require('express')
const httpstreamtest = require('./index')

describe('httpstreamtest', () => {
  it('simple post request with stream', async () => {
    const server = express();
    server.post('/route',(req, res) => {
      let chunksReceived = []
      req.on('data', (chunk) => {
        chunksReceived.push(chunk.toString())
      });
      req.on('end', () => {
        res.send(chunksReceived)
      })
    })

    const msgs = ['some input a', 'some input b']
    const readStream = Readable.from(msgs)
    const res = await httpstreamtest(server, '/route', readStream)

    expect(res.status).toEqual(200)
    expect(res.data).toEqual(msgs)
  })

  it.skip('simple post request with file', async () => {})
  it.skip('post request with overriding axios options', async () => {})
})