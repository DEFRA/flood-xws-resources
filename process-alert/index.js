const AWS = require('aws-sdk')
const sns = new AWS.SNS()
const ddb = new AWS.DynamoDB.DocumentClient()
const converter = AWS.DynamoDB.Converter
const {
  ALERT_TABLE_NAME,
  ALERT_UPDATED_TOPIC_ARN
} = process.env

async function getAlertData (id) {
  return ddb.get({
    Key: {
      pk: 'AD',
      sk: id
    },
    TableName: ALERT_TABLE_NAME
  }).promise()
}

exports.handler = async function (event, context) {
  console.log('Event', JSON.stringify(event))

  // Extract message (batch = 1)
  const record = event.Records[0]
  const newImage = converter.unmarshall(record.dynamodb.NewImage)
  const pk = newImage.pk

  // Build an "actions" message attribute for subscription filtering
  const action = ['updated']

  if (pk === 'A' && record.eventName === 'INSERT') {
    console.log('Alert inserted', newImage)
    action.push('issued')
    const id = newImage.id
    console.log('id', id)

    // Get the alert data
    const alertDataItem = await getAlertData(id)
    const alert = alertDataItem.Item
    console.log('Alert issued', alert)

    // For now, only publish the "ALERT_UPDATED_TOPIC" event when the alert is actually issued
    const result = await sns.publish({
      Message: JSON.stringify(alert),
      MessageGroupId: alert.code, // Group by area code so FIFO topic processes each in the correct order
      MessageAttributes: {
        action: { DataType: 'String.Array', StringValue: JSON.stringify(action) }
      },
      TopicArn: ALERT_UPDATED_TOPIC_ARN
    }).promise()

    console.log('Alert updated event published', result)
  }
}
