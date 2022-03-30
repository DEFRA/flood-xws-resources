const { removeKeys } = require('flood-xws-common/helpers')
const { saveAlert, saveFeeds, getAlertData, publishAlert } = require('./helpers')

exports.handler = async (event) => {
  console.log('Event', event)

  // Extract message (batch = 1)
  const record = event.Records[0]

  // Check if a new alert was issued
  if (record.eventName === 'INSERT') {
    const item = record.dynamodb

    const pk = item.NewImage.pk.S

    if (pk === 'A') {
      // An alert was inserted
      console.log('An alert was inserted', item.NewImage)
      const id = item.NewImage.id.S

      // Get the alert data
      const alertDataItem = await getAlertData(id)
      const keysToRemove = ['pk', 'sk', 'user_id']
      const alert = removeKeys(alertDataItem.Item, keysToRemove)
      console.log('alert', alert)

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
  }
}
