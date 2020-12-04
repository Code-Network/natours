const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // TODO: 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // TODO: 2) Define the email options
  const mailOptions = {
    from: 'Bree Lorenz admin@jonas.io',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  /*
     3) TODO: Actually send the email with nodemailer sendMail()
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
