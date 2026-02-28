require('dotenv').config();
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

twilio.messages
  .create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: process.env.ADMIN_WHATSAPP_NUMBER,
    body: '✅ WhatsApp integration test successful!'
  })
  .then(msg => console.log('Sent:', msg.sid))
  .catch(err => console.error(err));
