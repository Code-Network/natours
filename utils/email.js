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

  // step: Create different transports for production and development
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

  // step: Create a send() method that will do all of the actual sending
  // note: send() will receive a template and a subject
  send(template, subject) {
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
  }

  // step: Create function that will call send( template, subject )
  // note: Will be used to create emails for all kinds of different situations
  sendWelcome() {
    // Use this.send because will be defined on the current object
    // 'welcome' will be a pug template
    this.send('welcome', 'Welcome to the Natours Family!');
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
   // OP:  Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
   // OP:   Preview only available when sending through an Ethereal account
   -- console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
   // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

 */
