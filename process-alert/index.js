const { saveAlert, saveFeed, getAlertData, publishAlert } = require('./helpers')

exports.handler = async (event) => {
  console.log('Event', event)

  // Extract message (batch = 1)
  const record = event.Records[0]

  // Check if a new alert was issued
  if (record.eventName === 'INSERT') {
    const item = record.dynamodb

    if (item.StreamViewType === 'NEW_IMAGE') {
      const pk = item.NewImage.pk.S

      if (pk === 'A') {
        // An alert was inserted
        console.log('An alert was inserted', item.NewImage)
        const id = item.NewImage.id.S

        // Get the alert data
        const alertDataItem = await getAlertData(id)
        console.log('alertDataItem', alertDataItem)

        const keysToRemove = ['pk', 'sk', 'user_id']
        const alert = removeKeys(alertDataItem.Item, keysToRemove)
        console.log('alert', alert)

        // Write the alert capxml file
        const saveResult = await saveAlert(alert)
        console.log('saveResult', saveResult)

        // Update the feeds
        const feedResult = await saveFeed()
        console.log('feedResult', feedResult)

        // Publish
        const publishResult = await publishAlert(id, alert.code)
        console.log('publishResult', publishResult)
      }
    }
  }
}

function removeKeys (obj, keys) {
  const ret = {}

  for (const key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key]
    }
  }

  return ret
}
