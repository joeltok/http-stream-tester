const path = require('path')
const axios = require('axios')
const fs = require('fs')

function validateApp(app) {
  try {
    app.listen
  } catch (e) {
    throw new Error('app should be an express server')
  }

  if (!app.listen) {
    throw new Error('app should be an express server')
  }
}

function validateSource(source) {
  if (typeof source === 'string') {
    if (!fs.existsSync(source)) {
      throw new Error('file does not exist: ' + source)
    } 
    return true
  }

  if (source.pipe) {
    return true
  }

  throw new Error('source must be a stream or a path to a file')
}

const httpstreamtest = async (app, source, options) => {
  validateApp(app)
  validateSource(source)

  const {
    route = '/',
    method = 'post',
    contentType = 'application/octet-stream',
    axiosOptions = {},
  } = options

  let listener;
  const port = await new Promise(async (resolve, reject) => {
    listener = await app.listen(0, () => {
      const { port } = listener.address()
      resolve(port)
    })
  })

  try {
    let stream;
    if (typeof source === 'string') {
      stream = fs.createReadStream(source)
    } else {
      stream = source
    }
  
    // handle headers specially
    headers = Object.assign({
      'content-type': contentType,
    }, axiosOptions.headers)
    delete axiosOptions['headers']
  
    options = Object.assign({}, {
      method: method,
      url: new URL(route, `http://127.0.0.1:${port}`).href,
      headers: headers,
      data: stream,
    }, axiosOptions)
  
    const res = await axios(options)
    listener.close()
    return res;  
  } catch (e) {
    listener.close()
    throw e
  }

}

module.exports = httpstreamtest;