var Faker = require('Faker');

console.log("Please wait while database is being populated");

var createSuccess = function(err, entry) {
    // Error handling
    if (err) {
      return console.log(err);

    // The entry was created successfully!
    }else {
      console.log("Successfully created:", entry);
    }
  };

//Create Random Users
for (var i = 0; i < 100; i++) {
  User.create({
    email: Faker.Internet.email(),
    password: require('bcrypt').hashSync(require('crypto').randomBytes(20).toString('hex'), require('bcrypt').genSaltSync(10)),
    first_names: Faker.Name.firstName(),
    last_names: Faker.Name.lastName(),
    role: 'professor',
    SSN4: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
  }).done(createSuccess);
}

//Create Random Students
for (var i = 0; i < 100; i++) {
  Student.create({
    student_number: Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000
  }).done(createSuccess);
}

var courses = ['MATE', 'CCOM', 'BIOL'];
var semesters = 3;

for (var i = 1; i <= semesters * 3; i++) {
  Course.create({
    course_code: courses[i % 3],
    user_id: Math.floor(Math.random() * (15 - 1 + 1)) + 1,
    done: false,
    already_dumped: false,
    session: 'B0' + i,
    section: '00' + i
  }).done(createSuccess);
}