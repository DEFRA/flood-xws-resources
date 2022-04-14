const AWS = require('aws-sdk')
const sns = new AWS.SNS()
const converter = AWS.DynamoDB.Converter
const {
  CONTACT_UPDATED_TOPIC_ARN
} = process.env

exports.handler = async function (event, context) {
  console.log('Event', JSON.stringify(event))

  // Extract message (batch = 1)
  const record = event.Records[0]
  const newImage = converter.unmarshall(record.dynamodb.NewImage)
  const oldImage = converter.unmarshall(record.dynamodb.OldImage)
  const sk = newImage.sk

  if (sk === 'C') {
    // Build an "actions" message attribute for subscription filtering
    const action = ['updated']

    if (record.eventName === 'INSERT') {
      action.push('created')
      console.log('Contact Inserted', newImage)
    } else {
      // Add to actions if user has submitted their confirmation
      const confirmedUpdated = (oldImage.last_confirmed === undefined && newImage.last_confirmed) ||
      (newImage.last_confirmed > oldImage.last_confirmed)

      if (confirmedUpdated) {
        action.push('confirmed')
        console.log('Contact confirmed', oldImage, newImage)
      }
    }

    const result = await sns.publish({
      Message: JSON.stringify(newImage),
      MessageGroupId: newImage.pk, // Group by email (pk) so FIFO topic processes each in the correct order
      MessageAttributes: {
        action: { DataType: 'String.Array', StringValue: JSON.stringify(action) }
      },
      TopicArn: CONTACT_UPDATED_TOPIC_ARN
    }).promise()

    console.log('Update published', result)
  }

  return 'ok'
}
