const AWS = require('aws-sdk')
const { Feed } = require('feed')
const date = require('flood-xws-common/date')
const { Alert } = require('flood-xws-common/caplib')
const service = require('flood-xws-common/data/cap/service.json')
const publisher = require('flood-xws-common/data/cap/publisher.json')
const s3 = new AWS.S3()
const sns = new AWS.SNS()
const ddb = new AWS.DynamoDB.DocumentClient()
const bucketName = process.env.S3_BUCKET_NAME
const bucketDomainName = process.env.S3_BUCKET_DOMAIN_NAME
const tableName = process.env.ALERT_TABLE_NAME
const topicArn = process.env.ALERT_PUBLISHED_TOPIC_ARN

/**
 * Convert an alert to cap. Currently uses the
 * `caplib` library which needs work but is ok for now.
 *  Ultimately we may opt to choose something else.
 *
 * @param {object} alert - the alert model
 */
function buildCapAlert (alert) {
  const code = alert.code
  const dateFormat = 'YYYY-MM-DDTHH:mm:ssZ'

  const capAlert = new Alert()
  capAlert.identifier = alert.id
  capAlert.sender = publisher.url
  capAlert.sent = date(alert.updated).format(dateFormat)
  capAlert.status = alert.cap_status
  capAlert.msgType = alert.cap_msg_type
  capAlert.source = service.description
  capAlert.scope = alert.cap_scope

  const capInfo = capAlert.addInfo()
  capInfo.language = 'en-GB'
  capInfo.headline = alert.headline
  capInfo.description = alert.body
  capInfo.event = getDescription(alert)
  capInfo.addEventCode('type_id', alert.type_id)

  alert.cap_category.forEach(c => capInfo.addCategory(c))
  alert.cap_response_type.forEach(rt => capInfo.addResponseType(rt))

  capInfo.urgency = alert.cap_urgency
  capInfo.severity = alert.cap_severity
  capInfo.certainty = alert.cap_certainty

  const capArea = capInfo.addArea(code)
  capArea.addGeocode('TargetAreaCode', code)

  // Todo: Add polygon
  // capArea.addPolygon(...)

  const xml = addStylesheet('../assets/alert-style.xsl', capAlert.toXml())

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

function getDescription (alert) {
  switch (alert.type_id) {
    case 'fa':
      return `Flood alert in force for ${alert.code}`
    case 'fw':
      return `Flood warning in force for ${alert.code}`
    case 'sfw':
      return `Severe flood warning in force for ${alert.code}`
    default:
      return `Flood no longer in force for ${alert.code}`
  }
}

function getRssFeed (alerts) {
  const feed = new Feed({
    id: 'https://www.gov.uk',
    title: service.description,
    description: service.name,
    generator: 'xws',
    link: 'https://www.gov.uk/check-flooding',
    updated: new Date(),
    image: 'assets/xws.png',
    favicon: 'assets/favicon.ico',
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
    const description = getDescription(alert)

    const item = {
      id: alert.sk,
      title: alert.headline,
      link: `https://${bucketDomainName}/alerts/items/${alert.sk}.xml`,
      description: description,
      content: alert.body,
      date: new Date(alert.updated),
      image: `https://${bucketDomainName}/alerts/assets/alert-types/${alert.type_id}.gif`
    }

    feed.addItem(item)
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

  const rss = addStylesheet('./assets/rss-style.xsl', feed.rss2())
  const atom = feed.atom1()

  return { alerts, rss, atom }
}

async function saveFeeds () {
  const { alerts, rss, atom } = await getRss()

  const rssResult = await s3.putObject({
    Bucket: bucketName,
    Key: 'alerts/alerts.rss',
    Body: rss,
    ContentType: 'text/xml',
    ACL: 'public-read'
  }).promise()

  const atomResult = await s3.putObject({
    Bucket: bucketName,
    Key: 'alerts/alerts.atom',
    Body: atom,
    ContentType: 'text/xml',
    ACL: 'public-read'
  }).promise()

  const mapper = alert => {
    const {
      sk: id, code, type_id: typeId, headline, body: message,
      ea_owner_id: eaOwnerId, ea_area_id: eaAreaId, updated
    } = alert

    return {
      id,
      code,
      type_id: typeId,
      headline,
      message,
      ea_owner_id: eaOwnerId,
      ea_area_id: eaAreaId,
      updated
    }
  }

  const jsonResult = await s3.putObject({
    Bucket: bucketName,
    Key: 'alerts/alerts.json',
    Body: JSON.stringify(alerts.map(mapper), null, 2),
    ContentType: 'text/json',
    ACL: 'public-read'
  }).promise()

  return { rssResult, atomResult, jsonResult }
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

async function publishAlert (alert) {
  const { id, code, type_id: typeId } = alert

  return sns.publish({
    Message: JSON.stringify(alert),
    MessageAttributes: {
      id: { DataType: 'String', StringValue: id },
      type_id: { DataType: 'String', StringValue: typeId },
      code: { DataType: 'String', StringValue: code }
    },
    TopicArn: topicArn
  }).promise()
}

module.exports = { saveAlert, saveFeeds, getAlertData, publishAlert }
