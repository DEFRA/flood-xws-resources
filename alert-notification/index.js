const AWS = require('aws-sdk')
const pinpointApplicationId = process.env.PINPOINT_APPLICATION_ID
const pinpoint = new AWS.Pinpoint()
const emailCampaignTemplate = require('./email-campaign-template.json')
const smsCampaignTemplate = require('./sms-campaign-template.json')
const segmentTemplate = require('./segment-template.json')
const parse = require('json-templates')

async function createSegment (areaCode) {
  const template = parse(segmentTemplate)
  const params = template({
    applicationId: pinpointApplicationId,
    name: areaCode,
    areaCode
  })
  console.log(JSON.stringify(params, null, 4))
  try {
    // Note: docs suggest it should be possible to use updateSegment to upsert but get 'resource not available'
    // when trying to do the initial create with SegmentId = {{name}} in segment-template.json
    const { SegmentResponse: { Id: id, Version: version } } = await pinpoint.createSegment(params).promise()
    console.log({ error: false, id, version })
    return { id, version }
  } catch (err) {
    console.log({ error: true, err })
  }
}

async function createEmailCampaign (segmentId, segmentVersion, areaCode, headline, description) {
  const template = parse(emailCampaignTemplate)

  const body = `<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/></head><body><p>${description}</p></body></html>`

  const params = template({
    applicationId: pinpointApplicationId,
    headline,
    body,
    name: areaCode,
    segmentId,
    segmentVersion
  })

  console.log(JSON.stringify(params, null, 4))

  try {
    const pinpointResult = await pinpoint.createCampaign(params).promise()
    console.log({ error: false, pinpointResult })
    return {
      pinpointResult
    }
  } catch (err) {
    console.log({ error: true, err })
  }
}

async function createSmsCampaign (segmentId, segmentVersion, areaCode, headline, description) {
  const template = parse(smsCampaignTemplate)

  const params = template({
    applicationId: pinpointApplicationId,
    body: `${headline}\n${description}`,
    name: areaCode,
    segmentId,
    segmentVersion
  })

  console.log(JSON.stringify(params, null, 4))

  try {
    const pinpointResult = await pinpoint.createCampaign(params).promise()
    console.log({ error: false, pinpointResult })
    return {
      pinpointResult
    }
  } catch (err) {
    console.log({ error: true, err })
  }
}

async function handler (event) {
  // console.log({ event })
  const { Records: records } = event
  const record = records[0]
  const { Sns: data } = record
  console.log({ data })

  const message = JSON.parse(data.Message)

  console.log({ message })

  const { id, version } = await createSegment(message.area_code)
  const [emailResult, smsResult] = await Promise.all([
    createEmailCampaign(id, version, message.area_code, message.headline, message.description),
    createSmsCampaign(id, version, message.area_code, message.headline, message.description)
  ])
  console.log({ emailResult, smsResult })
}

module.exports = { handler }
