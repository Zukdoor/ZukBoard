const axios = require('axios')

/**
 * [fetch description]
 * @param  {[String]}  options.method     [description]
 * @param  {[String]}  options.url        [description]
 * @param  {[Object]}  options.data   [description]
 */

const fetch = (options) => {
  return axios(options).then((response) => {
    return response.data
  }).catch((err) => {
    console.log(err.response.data)
    return err.response.data
  })
}

module.exports = fetch
