
var Request = require('./user.js').Request;
var User = require('./user.js').User;


// create dummy users

for (var i = 0; i < 10; i++) {
	User.createNewUser("name_" + i, "phone_" + i, "user_" + i);
}

// create dummp request
var counter = 0;
for (var i = 0; i < 10; i++) {
	for (var j = 0; j < 3; j++) {
		for (var status = 0; status < 2; status++) {
			counter++;
			Request.createNewRequest("gps_" + i, j, "Save Me!!", "user_" + parseInt(Math.random() * 10), "request_" + counter, status);
		}
	}
}

