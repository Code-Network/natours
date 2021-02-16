const nodemailer = require('nodemailer');

/*
  Goal: Example instance would be:
   new Email(user, url).sendWelcome()

   user: Where we can extract the name or email
   url: An example would be the reset URL for resetting the password

   Goal: Methods to create
    sendWelcome(): Used in authController in exports.signup;
    -- The message that is going to be sent whenever a new user signs up for our
          application
    sendPasswordReset(): Used in authController, in exports.forgotPassword

*/
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;

    // step: Set Email address as an environment variable in config
    this.from = `Bree Lorenz <${process.env.EMAIL_FROM}>`;
  }

  // note: We want to have different transports for production and development
  // Production => Sendgrid; Development => MailTrap
  createTransport() {
    // step: If in production, we will use Sendgrid
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }

    // step: If in development, mail will be caught by MailTrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

/*
 step: 2) Define the email options
 note:
  -- from: 'sender name <senderAddress@email.com>
   -- to: "bar@example.com, baz@example.com", // list of receivers
   -- subject: "Hello ✔", // Subject line
   -- text: "Hello world?", // plain text body
   -- html: "<b>Hello world?</b>", // html body

   -- console.log("Message sent: %s", info.messageId);
   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
   // Preview only available when sending through an Ethereal account
   -- console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
   // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

 */
const mailOptions = {
  from: 'Bree Lorenz <hello@bree.io>',
  to: options.email,
  subject: options.subject,
  text: options.message
  // html:
};
