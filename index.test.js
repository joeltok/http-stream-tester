const fs = require('fs')
const { Readable } = require('stream')
const express = require('express')
const httpstreamtest = require('./index')

describe('httpstreamtest', () => {
  let server;

  beforeAll(() => {
    server = express();
    server.post('/route',(req, res) => {
      let chunksReceived = []
      req.on('data', (chunk) => {
        chunksReceived.push(chunk.toString())
      });
      req.on('end', () => {
        res.send({
          contentType: req.headers['content-type'],
          message: chunksReceived
        })
      })
    })
  })

  it('simple post request with stream', async () => {
    const msgs = ['some input a', 'some input b']
    const readStream = Readable.from(msgs)
    const res = await httpstreamtest(server, readStream, {
      route: '/route', 
      method: 'post',
    })

    expect(res.status).toEqual(200)
    expect(res.data).toEqual({
      contentType: 'application/octet-stream',
      message: msgs
    })
  })

  it('simple post request with stream with empty headers', async () => {
    const msgs = ['some input a', 'some input b']
    const readStream = Readable.from(msgs)
    const res = await httpstreamtest(server, readStream, {
      route: '/route',
      method: 'post',
      axiosOptions: {
        headers: {}
      }
    })

    expect(res.status).toEqual(200)
    expect(res.data).toEqual({
      contentType: 'application/octet-stream',
      message: msgs
    })
  })

  it('simple post request with file', async () => {
    const readStream = fs.createReadStream('./fixtures/example.txt')
    const res = await httpstreamtest(server, readStream, {
      route: '/route',
      method: 'post',
      axiosOptions: {
        headers: {}
      }
    })

    expect(res.status).toEqual(200)
    expect(res.data).toEqual({
      contentType: 'application/octet-stream',
      message: ['I am a line\nI am another line\n'],
    })
  })

  it('validate is express app', async () => {
    let errorCaughtMessage = '';
    try {
        const msgs = ['some input a', 'some input b']
        const readStream = Readable.from(msgs)
        const res = await httpstreamtest(null, readStream, {
        route: '/route', 
        method: 'post',
      })
    } catch (err) {
      errorCaughtMessage = err.message
    }

    expect(errorCaughtMessage).toEqual('app should be an express server')
  })

  it('validate source exists', async () => {
    let errorCaughtMessage = '';
    try {
      const res = await httpstreamtest(server, './non_existent_file.txt', {
        route: '/route', 
        method: 'post',
      })
    } catch (err) {
      errorCaughtMessage = err.message
    }

    expect(errorCaughtMessage).toEqual(
      'file does not exist: ./non_existent_file.txt'
    )
  })
})