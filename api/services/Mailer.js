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

var makeReport = function (data, callback) {
  var email_data = {
    text: '',
    html: ''
  };

  User.findOneByEmail(data.email, function (err, user) {
    if (!err) {
      Course.find({user_id: user.id, done: true}, function (err, doneCoursesFromQuery) {
        if (!err) {
          Course.find({user_id: user.id, done: false}, function (err, pendingCoursesFromQuery) {
            if (!err) {
              email_data.text += 'You have already finished grading these courses:\n'
              doneCoursesFromQuery.forEach(function (d_course) {
                email_data.text += '* ' + d_course.course_code + '-' + d_course.section + '\n';
              });
              email_data.text += 'You have to grade these courses:\n';
              pendingCoursesFromQuery.forEach(function (p_course) {
                email_data.text += '* ' + p_course.course_code + '-' + p_course.section + '\n';
              });
              callback(email_data);
            }
          });
        }
      });
    }
  });
};

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

  sendProgressReportEmail: function (data, callback) {
    makeReport(data, function (report) {
      transport.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: data.email,
        subject: 'Your grades progress report.',
        text: report.text,
        html: report.html
      }, function (error, response) {
        if (error) {
          console.log(require('util').inspect(error));
        } else {
          // console.log(response.message);
        }
        callback();
      });
    });
  }
}