const AWS = require('aws-sdk')
const { NotifyClient } = require('notifications-node-client')
const ddb = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.SUBSCRIPTION_TABLE_NAME
const apiKey = process.env.NOTIFY_API_KEY
const emailTemplateId = process.env.NOTIFY_EMAIL_TEMPLATE_ID
const smsTemplateId = process.env.NOTIFY_SMS_TEMPLATE_ID
const client = new NotifyClient(apiKey)

exports.handler = async function (event, context) {
  console.log('Event', JSON.stringify(event))

  // Extract message (batch = 1)
  const record = event.Records[0]

  // Get the alert TA code
  const alert = JSON.parse(record.Sns.Message)
  console.log('Alert', alert)
  const { code, headline, body } = alert

  // Get the subscribers
  // TODO: paginate
  const result = await ddb.query({
    KeyConditionExpression: 'code = :code',
    ExpressionAttributeValues: {
      ':code': code
    },
    TableName: tableName
  }).promise()

  const subscribers = result.Items
  console.log('Subscribers', subscribers)

  for (let i = 0; i < subscribers.length; i++) {
    const subscriber = subscribers[i]
    const channel = subscriber.channel
    const endpoint = subscriber.endpoint

    if (channel === 'email') {
      await sendEmail(endpoint, { headline, body })
    } else if (channel === 'sms') {
      await sendSMS(endpoint, { body })
    }
  }
}

const sendEmail = function (email, personalisation) {
  return client.sendEmail(emailTemplateId, email, { personalisation })
}

const sendSMS = function (phoneNumber, personalisation) {
  return client.sendSms(smsTemplateId, phoneNumber, { personalisation })
}
