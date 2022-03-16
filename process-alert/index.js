const { updateAlerts, publishAlert } = require('./helpers')

exports.handler = async (event) => {
  console.log('Event', event)

  // Extract message (batch = 1)
  const record = event.Records[0]

  // Check if a new alert was issued
  if (record.eventName === 'INSERT') {
    const item = record.dynamodb

    if (item.StreamViewType === 'NEW_IMAGE') {
      const pk = item.NewImage.pk.S

      if (pk === 'AA') {
        // An alert (archive) was inserted
        console.log('An alert was inserted', item.NewImage)

        const id = item.NewImage.id.S
        const code = item.NewImage.code.S
        const eaOwnerId = item.NewImage.ea_owner_id.S

        // Update the alerts
        const alertsResult = await updateAlerts()
        console.log('alertsResult', alertsResult)

        // Publish
        const publishResult = await publishAlert(id, code, eaOwnerId)
        console.log('publishResult', publishResult)
      }
    }
  }
}
