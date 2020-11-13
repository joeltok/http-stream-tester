const path = require('path')
const axios = require('axios')

function validateSource(source) {

}

const httpstreamtest = async (app, route, source, axiosOptions={}) => {
  let listener;
  const port = await new Promise(async (resolve, reject) => {
    listener = await app.listen(0, () => {
      const { port } = listener.address()
      resolve(port)
    })
  })

  let stream;
  if (typeof source === 'string') {
    stream = fs.createReadStream(source)
  } else {
    stream = source
  }

  options = Object.assign({
    method: 'post',
    url: new URL(route, `http://127.0.0.1:${port}`).href,
    headers: {
      'content-type': 'application/octet-stream',
    },
    data: stream,
  }, axiosOptions)

  const res = await axios(options)
  listener.close()
  return res;
}

module.exports = httpstreamtest;