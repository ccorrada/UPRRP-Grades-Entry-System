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
  sendActivationEmail: function (prof_email, token) {
    transport.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: prof_email,
      subject: 'Your password reset link for UPRRP: GES.',
      text: 'Reset your password at http://localhost:5000/password?token=' + token,
      html: 'Reset your <a href="http://localhost:5000/password?token=' + token +'">password</a>'
    }, function (error, response) {
      // if (error) {
      //   console.log(response.message);
      // }
    });
  }
}