// Emails come from here.

var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport(process.env.EMAIL_TRANSPORT_TYPE, {
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  secureConnection: true,
  port: 465
});

module.exports = {
  sendActivationEmail: function (prof_email, token, callback) {
    transport.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: prof_email,
      subject: 'Your activation link for UPRRP: GES.',
      text: 'Reset your password at http://localhost:5000/password?token=' + token,
      html: 'Reset your <a href="http://localhost:5000/password?token=' + token +'">password</a>'
    }, function (error, response) {
      if (error) {
        console.log(require('util').inspect(error));
      } else {
        // console.log(response.message);
      }
      callback();
    });
  },

  sendProgressReportEmail: function (prof_email, callback) {
    transport.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: prof_email,
      subject: 'Your grades progress report.',
      text: 'REPORT GOES HERE!',
      html: ''
    }, function (error, response) {
      if (error) {
        console.log(require('util').inspect(error));
      } else {
        // console.log(response.message);
      }
      callback();
    });
  }
}