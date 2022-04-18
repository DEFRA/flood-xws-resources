const { saveAlert, saveFeeds, publishAlert } = require('./helpers')

exports.handler = async (event) => {
  console.log('Event', event)

  // Extract message (batch = 1)
  const record = event.Records[0]

  // An alert was issued
  const alert = JSON.parse(record.body)

  console.log('An alert was issued', alert)

  // Write the alert capxml file
  const saveResult = await saveAlert(alert)
  console.log('saveResult', saveResult)

  // Update the feeds
  const feedResult = await saveFeeds()
  console.log('feedResult', feedResult)

  // Publish ALERT_PUBLISHED event
  const publishResult = await publishAlert(alert)
  console.log('publishResult', publishResult)
}
