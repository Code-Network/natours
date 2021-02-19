const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

/*
  Goal: Example instance would be:
   new Email(user, url).sendWelcome()

   user: Where we can extract the name or email
   url: An example would be the reset URL for resetting the password

   Goal: Methods to create
    sendWelcome(): Used in authController in exports.signup;
    -- The message that is going to be sent whenever a new user signs up for our
          application
    sendPasswordReset(): Used in authController, in exports.forgotPassword */
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;

    // step: Set Email address as an environment variable in config
    this.from = `Bree Lorenz <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
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

  // TODO: Send the actual email
  async send(template, subject) {
    /*
    step:  1) Render HTML based PUG template
    Note: Usually we use res.render('welcome'), for instance, to render a PUG
     template;
     -- what this render() function does behind the scenes is to create
      the HTML based on the PUG template and then send it to the client;
      -- but this time we do not want to render; instead we want to create
      the HTML out of the template so that we can then send that HTML as the
      email and define it in the html property within const mailOption.
      -- So, basically, we will generate the HTML and pass it mailOptions.html
           modify it and pass it to mailOptions.text;
       -- To do this, we must require the PUG package and use their renderFile()
       function.
        -- There are some good examples here:
           -  https://www.codota.com/code/javascript/functions/pug/renderFile
           -  https://pugjs.org/api/reference.html
           - Syntax:  pug.renderFile(path, ?options, ?callback)
                - path: string
                    The path to the Pug file to render
                - options: ?options
                    An options object, also used as the locals object
                - callback: ?function
                    Node.js-style callback receiving the rendered results.
                        This callback is called synchronously.
                - returns: string
                    The resulting HTML string
      OP: __dirname is the location of the currently running script == utils/ */
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    /*
    step: 2) Define email options
    note: We want to use the text option because it is better for email
       delivery rates and also to avoid spam folders; also, some people
       prefer plain text emails instead of more formatted HTML emails;
       so we will use npm html-to-text package to convert HTML to simple text
    OP:
     const { htmlToText } = require('html-to-text');
     const html = '<h1>Hello World</h1>';
     const text = htmlToText(html, {
      wordwrap: 130
     });
     console.log(text); // Hello World */

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // step: 3) Create a transport and send email
    // note: In the previous const sendEmail = async options => {}, we had
    //        await transporter.sendMail(mailOptions);
    //        this is what we are replacing
    await this.newTransport().sendMail(mailOptions);
  }

  // step: Create function that will call send( template, subject )
  // note: Will be used to create emails for all kinds of different situations
  async sendWelcome() {
    // Use this.send because will be defined on the current object
    // 'welcome' will be a pug template
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
