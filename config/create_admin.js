module.exports.createAdmin = function (email, password, firstName, lastName, ssn4) {
	var AddAdmin = function(email, password, firstName, lastName, ssn4) {
		//Create the user and hash the password
		User.create({
			email: email,
			password: require('bcrypt').hashSync(password, require('bcrypt').genSaltSync(10)),
			first_names: firstName,
			last_names: lastName,
			role: 'admin',
			passwordResetToken: '',
			ssn4: ssn4
		}).done(
		function(err, entry) {
	      // Error handling
	      if (err) {
             return console.log("There was an error:", require('util').inspect(err || results, false, null));
	      // The entry was created successfully!
	      }
	      else {
	        console.log("Successfully created:", entry);
	      }
	    })
	}

	//Check the amount of arguments
	if (arguments.length < 4) {
		console.log("Missing arguments")
		console.log("Proper use: sails.config.createAdmin(email, password, firstName, lastName, ssn4)")

	}
	//Show the input and save the user
	else {
		console.log('Command-line input received:');
	    console.log('  Email: ' + email);
	    console.log('  Password: ' + password);
	    console.log('  First Name: ' + firstName);
	    console.log('  Last Name: ' + lastName);
	    console.log('  SSN4: ' + ssn4);
	    AddAdmin(email, password, firstName, lastName, ssn4);
	};
}
