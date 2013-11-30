module.exports = {
  sanitizeInput: function (input) {
    return require('validator').sanitize(input).escape();
  },

  parseGradesFromForm: function (body) {
    var studentGrades = {};
    
    for (var key in body) {
      if (body.hasOwnProperty(key)) {
        if (new RegExp(/^[0-9]+$/).exec(key) !== null) {
          var tempGrade = {};
          tempGrade.id = key;
          tempGrade.value = Utils.sanitizeInput(body[key]).toLowerCase();
          tempGrade.incomplete = body[key + ':inc'] === 'on' ? true : false;

          studentGrades[key] = tempGrade;
        }
      }
    }

    return studentGrades;
  }
}