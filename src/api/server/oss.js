const crypto = require('crypto')
const id = process.env.OSS_ID
const secret = process.env.OSS_SECRET
const host = 'https://cdn.yucircle.com'

console.log('oss: config:', id, secret)

function getOSSParams(dirPath, filename) {
  let end = new Date().getTime() + 300000
  let expiration = new Date(end).toISOString()
  let policyString = {
    expiration,
    conditions: [
      ['content-length-range', 0, 1048576000],
      ['starts-with', '$key', dirPath]
    ]
  }
  policyString = JSON.stringify(policyString)
  const policy = Buffer.from(policyString).toString('base64')
  const signature = crypto.createHmac('sha1', secret).update(policy).digest('base64')
  return {
    OSSAccessKeyId: id,
    host,
    policy,
    signature,
    saveName: filename,
    startsWith: dirPath
  }
}
module.exports = getOSSParams
