const sgMail = require("@sendgrid/mail");
const keys = require("../config/keys");

class Mailer {
  constructor({ subject, recipients }, content) {
    this.message = {
      to: recipients,
      from: "no-reply@emaily.com",
      subject: subject,
      html: content,
      trackSettings: {
        clickTracking: { enable: true }
      }
    };
    sgMail.setApiKey(keys.sendGridKey);
  }

  async send() {
    const resp = await sgMail.sendMultiple(this.message);
    return resp;
  }
}
module.exports = Mailer;
