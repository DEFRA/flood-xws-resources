const https = require('https')
const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()
const contactTableName = process.env.CONTACT_TABLE_NAME
const subscriptionTableName = process.env.SUBSCRIPTION_TABLE_NAME
const areaApiUrl = process.env.AREA_API_URL

exports.handler = async function (event, context) {
  console.log('REQUEST RECEIVED:\n' + JSON.stringify(event))

  const record = event.Records[0]
  const message = JSON.parse(record.body)
  await saveSubscriptions(message.pk)
}

async function getContactById (id) {
  const result = await ddb.get({
    TableName: contactTableName,
    Key: {
      pk: id,
      sk: 'C'
    }
  }).promise()

  return result.Item
}

async function getContactLocations (contactId) {
  const result = await ddb.query({
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': contactId,
      ':sk': 'L#'
    },
    TableName: contactTableName
  }).promise()

  return result.Items
}

async function saveSubscriptions (contactId) {
  console.log('contactId', contactId, contactTableName, subscriptionTableName)

  const contact = await getContactById(contactId)
  const contactLocations = await getContactLocations(contactId)

  console.log('contact', contact)
  console.log('contactLocations', contactLocations)

  const contactSubscriptions = (await ddb.query({
    TableName: subscriptionTableName,
    IndexName: 'user-index',
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': contactId
    }
  }).promise()).Items

  console.log('contactSubscriptions', contactSubscriptions)

  // Delete all current subscriptions
  if (Array.isArray(contactSubscriptions) && contactSubscriptions.length) {
    const req = {
      [subscriptionTableName]: contactSubscriptions.map(sub => ({
        DeleteRequest: {
          Key: {
            code: sub.code,
            endpoint: sub.endpoint
          }
        }
      }))
    }

    await ddb.batchWrite({
      RequestItems: req
    }).promise()
  }

  console.log(contact, contactLocations, contactSubscriptions)

  for (let i = 0; i < contactLocations.length; i++) {
    const contactLocation = contactLocations[i]
    const areas = await findAreasByPoint(contactLocation.x, contactLocation.y)

    for (let j = 0; j < areas.length; j++) {
      const area = areas[j]

      if (area.category_id === 'fwa' || contact.receive_messages === 'all') {
        // Email
        if (contact.email && contact.email_active) {
          await ddb.put({
            TableName: subscriptionTableName,
            Item: {
              code: area.code,
              endpoint: contact.email,
              user_id: contactId,
              channel: 'email'
            }
          }).promise()
        }

        // SMS
        if (contact.mobile && contact.mobile_active) {
          await ddb.put({
            TableName: subscriptionTableName,
            Item: {
              code: area.code,
              endpoint: contact.mobile,
              user_id: contactId,
              channel: 'sms'
            }
          }).promise()
        }
      }
    }

    console.log(areas)
  }
}

async function findAreasByPoint (x, y) {
  return getJson(`${areaApiUrl}/area?x=${x}&y=${y}`)
}

function getJson (url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const data = []
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date'
      console.log('Status Code:', res.statusCode)
      console.log('Date in Response header:', headerDate)

      res.on('data', chunk => {
        data.push(chunk)
      })

      res.on('end', () => {
        console.log('Response ended: ')
        const res = JSON.parse(Buffer.concat(data).toString())
        resolve(res)
      })
    }).on('error', err => {
      console.log('Error: ', err.message)
      reject(err)
    })
  })
}
