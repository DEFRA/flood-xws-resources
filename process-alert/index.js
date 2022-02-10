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
        const alert = {
          pk,
          sk: item.NewImage.sk.S,
          id: item.NewImage.id.S,
          type: item.NewImage.type.S,
          updated: item.NewImage.updated.N
        }

        const id = alert.id
        const [, areaId, , code] = alert.sk.split('#')

        // Get the alert data
        const alertDataItem = await getAlertData(id)
        console.log('alertDataItem', alertDataItem)

        const alertData = alertDataItem.Item
        console.log('alertData', alertData)

        alert.areaId = areaId
        alert.code = code
        alert.headline = alertData.headline
        alert.body = alertData.body

        // Write the alert capxml file
        const saveResult = await saveAlert(alert)
        console.log('saveResult', saveResult)

        // Update the feeds
        const feedResult = await saveFeed()
        console.log('feedResult', feedResult)

        // Publish
        const publishResult = await publishAlert(id, code)
        console.log('publishResult', publishResult)
      }
    }
  }
}
