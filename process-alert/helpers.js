const AWS = require('aws-sdk')
const { Feed } = require('feed')
const { Alert } = require('flood-xws-common/caplib')
const { alertTypesMap, regionsMap, areasMap } = require('flood-xws-common/data')
const { publisher, service } = require('flood-xws-common/constants')
const s3 = new AWS.S3()
const sns = new AWS.SNS()
const ddb = new AWS.DynamoDB.DocumentClient()
const bucketName = process.env.S3_BUCKET_NAME
const tableName = process.env.DYNAMODB_TABLE_NAME
const topicArn = process.env.ALERT_PUBLISHED_TOPIC_ARN

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
  const code = alert.code
  const event = code + ' 062 Remove Flood Alert EA' // Todo

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
  const feed = new Feed({
    id: 'https://www.gov.uk',
    title: service.description,
    description: service.name,
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
      name: publisher.name,
      link: publisher.url
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
      image: `https://${bucketName}.s3.eu-west-2.amazonaws.com/alerts/__static/alert-types/${type.id}.gif`
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

  return { alerts, rss, json }
}

async function saveFeed () {
  const { alerts, rss, json } = await getRss()

  const result = await s3.putObject({
    Bucket: bucketName,
    Key: 'alerts/alerts.rss',
    Body: rss,
    ContentType: 'text/xml',
    ACL: 'public-read'
  }).promise()

  const mapper = alert => {
    const { code, headline, body: message, updated, areaId, type, sk: id } = alert
    const polygon = `https://${bucketName}.s3.eu-west-2.amazonaws.com/target-areas/${code}.json`
    const alertType = alertTypesMap.get(type)
    const area = areasMap.get(areaId)
    const region = regionsMap.get(area.regionId)

    return { id, code, type: alertType, headline, message, area, region, updated, polygon }
  }

  const result1 = await s3.putObject({
    Bucket: bucketName,
    Key: 'alerts/alerts.json',
    Body: JSON.stringify(alerts.map(mapper), null, 2),
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

async function publishAlert (id, code) {
  const message = { id, code }

  return sns.publish({
    Message: JSON.stringify(message),
    MessageAttributes: {
      code: { DataType: 'String', StringValue: code }
    },
    TopicArn: topicArn
  }).promise()
}

module.exports = { saveAlert, saveFeed, getAlertData, publishAlert }
