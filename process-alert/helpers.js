const AWS = require('aws-sdk')
const { Feed } = require('feed')
const { Alert } = require('caplib')
const s3 = new AWS.S3()
const sns = new AWS.SNS()
const ddb = new AWS.DynamoDB.DocumentClient()
const bucketName = process.env.S3_BUCKET_NAME
const tableName = process.env.DYNAMODB_TABLE_NAME
const topicArn = process.env.ALERT_PUBLISHED_TOPIC_ARN

const alertTypes = [
  {
    id: 'fa',
    name: 'Flood alert'
  },
  {
    id: 'fw',
    name: 'Flood warning'
  },
  {
    id: 'sfw',
    name: 'Severe flood warning'
  }
]
const alertTypesMap = new Map(alertTypes.map(type => [type.id, type]))

const publisher = {
  id: '92895119-cb53-4012-8eb9-173a22f2db7a',
  name: 'Environment Agency',
  url: 'www.gov.uk/environment-agency'
}

const service = {
  id: 'ecbb79cc-47f5-4bb0-ad0c-ca803b671cfb',
  name: 'XWS',
  description: 'Flood warning service'
}

/**
 * Convert an alert to cap. Currently uses the
 * `caplib` library which needs work but is ok for now.
 *  Ultimately we may opt to choose something else.
 *
 * @param {object} alert - the alert model
 */
function buildCapAlert (alert) {
  // Todo: Create valid capxml
  // Extract from this file for testing
  // https://cap-validator.appspot.com/validate

  const sender = publisher.url
  const source = service.description
  const language = 'en-GB'
  const identifier = alert.id
  const event = '031 Issue Flood Alert EA'

  const capAlert = new Alert()
  capAlert.identifier = identifier
  capAlert.sender = sender
  capAlert.sent = new Date().toString()
  capAlert.msgType = 'Alert' // alert.cap_msg_type_name
  capAlert.source = source

  // Todo: support multiple infos for Welsh?
  const capInfo = capAlert.addInfo()
  capInfo.language = language
  capInfo.headline = alert.headline
  capInfo.description = alert.body
  capInfo.event = event

  capInfo.addCategory('Geo')
  capInfo.addCategory('Met')
  capInfo.addCategory('Env')

  capInfo.urgency = 'Expected' // alert.cap_urgency_name // Todo
  capInfo.severity = 'Minor' // alert.cap_severity_name // Todo
  capInfo.certainty = 'Likely' // alert.cap_certainty_name // Todo

  // const capArea = capInfo.addArea(areaId)
  // capArea.addGeocode('TargetAreaCode', code)

  // Todo: Add polygon
  // capArea.addPolygon(...)

  const xml = addStylesheet('../__static/alert-style.xsl', capAlert.toXml())

  return xml
}

// Add XSL stylesheet processing instruction
function addStylesheet (href, xml) {
  const declaration = '<?xml version="1.0" encoding="utf-8"?>\n'
  const decExists = xml.includes(declaration)
  const insertIdx = decExists ? declaration.length : 0
  const instruction = `<?xml-stylesheet type="text/xsl" href="${href}"?>\n`

  return xml.substring(0, insertIdx) + instruction + xml.substring(insertIdx)
}

function getRssFeed (alerts) {
  // Todo: pull titles, author etc. from service/publisher/source/sender
  const feed = new Feed({
    id: 'https://www.gov.uk',
    title: 'Flood Alerts and Warnings',
    description: 'Latest flood alerts and warnings',
    generator: 'xws',
    link: 'https://www.gov.uk/check-flooding',
    updated: new Date(),
    image: '__static/xws.png',
    favicon: '__static/favicon.ico',
    feedLinks: {
      json: 'https://www.gov.uk/json',
      atom: 'https://www.gov.uk/atom'
    },
    author: {
      name: 'DEFRA',
      email: 'defra@gov.uk',
      link: 'https://gov.com/defra'
    }
  })

  alerts.forEach(alert => {
    const type = alertTypesMap.get(alert.type)
    feed.addItem({
      id: alert.sk,
      title: `${type.name} for ${alert.code}: ${alert.headline}`,
      link: `items/${alert.sk}.xml`,
      description: alert.body,
      date: new Date(alert.updated),
      image: `https://xws-dstone-files.s3.eu-west-2.amazonaws.com/alerts/__static/alert-types/${type.id}.gif`
    })
  })

  return feed
}

async function getRss () {
  // TODO: Page and order
  const params = {
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'AD'
    },
    TableName: tableName
  }

  // Get all alerts
  const result = await ddb.query(params).promise()
  const alerts = result.Items

  // Get rss feed
  const feed = getRssFeed(alerts)

  const rss = addStylesheet('./__static/rss-style.xsl', feed.rss2())
  const json = feed.json1()

  return { rss, json }
}

async function saveFeed () {
  const { rss, json } = await getRss()

  const result = await s3.putObject({
    Bucket: bucketName,
    Key: 'alerts/alerts.xml',
    Body: rss,
    ContentType: 'text/xml',
    ACL: 'public-read'
  }).promise()

  const result1 = await s3.putObject({
    Bucket: bucketName,
    Key: 'alerts/alerts.json',
    Body: json,
    ContentType: 'text/json',
    ACL: 'public-read'
  }).promise()

  return { result, result1 }
}

async function getAlertData (id) {
  return ddb.get({
    Key: {
      pk: 'AD',
      sk: id
    },
    TableName: tableName
  }).promise()
}

async function saveAlert (alert) {
  const cap = buildCapAlert(alert)

  const params = {
    Bucket: bucketName,
    Key: `alerts/items/${alert.id}.xml`,
    Body: cap,
    ContentType: 'text/xml',
    ACL: 'public-read'
  }

  return s3.putObject(params).promise()
}

async function publishAlert (message) {
  return sns.publish({
    Message: JSON.stringify(message),
    MessageAttributes: {
      code: { DataType: 'String', StringValue: message.area_code }
    },
    TopicArn: topicArn
  }).promise()
}

module.exports = { saveAlert, saveFeed, getAlertData, publishAlert }
