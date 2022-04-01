const { NotifyClient } = require('notifications-node-client')
const {
  NOTIFY_API_KEY,
  NOTIFY_EMAIL_TEMPLATE_ID,
  NOTIFY_SMS_TEMPLATE_ID
} = process.env
const client = new NotifyClient(NOTIFY_API_KEY)

exports.handler = async function (event, context) {
  console.log('Event', JSON.stringify(event))

  // Extract message (batch = 1)
  const record = event.Records[0]

  const message = JSON.parse(record.body)
  console.log('Message', message)
  const { endpoint, channel, alert } = message
  const { headline, body } = alert

  if (channel === 'email') {
    await sendEmail(endpoint, { headline, body })
  } else if (channel === 'sms') {
    await sendSMS(endpoint, { body })
  }
}

const sendEmail = function (email, personalisation) {
  return client.sendEmail(NOTIFY_EMAIL_TEMPLATE_ID, email, { personalisation })
}

const sendSMS = function (phoneNumber, personalisation) {
  return client.sendSms(NOTIFY_SMS_TEMPLATE_ID, phoneNumber, { personalisation })
}
