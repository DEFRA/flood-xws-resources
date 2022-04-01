const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()
const sqs = new AWS.SQS()
const {
  SUBSCRIPTION_TABLE_NAME,
  MESSAGE_QUEUE_URL
} = process.env

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
    TableName: SUBSCRIPTION_TABLE_NAME
  }).promise()

  const subscribers = result.Items
  console.log('Subscribers', subscribers)

  for (let i = 0; i < subscribers.length; i++) {
    const subscriber = subscribers[i]
    const channel = subscriber.channel
    const endpoint = subscriber.endpoint
    const message = {
      endpoint,
      channel,
      alert: { headline, body }
    }

    await sqs.sendMessage({
      MessageBody: JSON.stringify(message),
      QueueUrl: MESSAGE_QUEUE_URL
    }).promise()
  }
}
