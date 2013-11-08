var Faker = require('Faker');

var createSuccess = function(err, user) {
    // Error handling
    if (err) {
      return console.log(err);

    // The User was created successfully!
    }else {
      console.log("User created:", user);
    }
  };

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
