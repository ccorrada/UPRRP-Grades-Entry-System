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
              email_data.text += data.res.i18n('emailTextGradeReportDone') + '\n'
              doneCoursesFromQuery.forEach(function (d_course) {
                email_data.text += '* ' + d_course.course_code + '-' + d_course.section + '\n';
              });
              email_data.text += data.res.i18n('emailTextGradeReportPending') + '\n';
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
  sendActivationEmail: function (prof_email, token, res, callback) {
    transport.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: prof_email,
      subject: res.i18n('emailChangePasswordSubject'),
      text: res.i18n('emailTextChangePassword', token),
      html: res.i18n('emailHTMLChangePassword', token)
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
        subject: data.res.i18n('emailGradeReportSubject'),
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