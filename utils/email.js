const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // step: 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

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

  /*
     3) step: Actually send the email with nodemailer sendMail()
      -- sendMail() syntax from nodemailer returns a PROMISE,
            so we will async/await instead

      Mail.sendMail(
          data: Object,
          callback?: Function)
      // Sends an email using the preselected transport object
      // Params: data -- E-data description
                 callback - Callback to run once the sending succeeded or failed
  */
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
