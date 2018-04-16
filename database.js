module.exports = {
		createUser,
    verifyUser,
    addCar,
    addService,
    getGarage,
    getCar,
    removeService,
    removeCar,
    updateCar,
    addPriorDate,
    updateNextDate,
    getIncrement,
		getEmailId,
		resetPassword,
		updateUser,
		removeUser,
		getUser
	}

// Create Functions

function createUser(userRef, uid, email, firstname, lastname, phone, password, notifPhone, notifEmail) {
  userRef.update({
    [uid]:"novalue"
  });
  userRef.child(uid).update({
    "email": email,
    "firstname": firstname,
    "lastname": lastname,
    "phone": phone,
    "password": password,
    "Garage": "",
		"notifPhone": notifPhone,
		"notifEmail": notifEmail,
  });
  userRef.child(uid).child("Garage").update({
    "carCount": 0
  });
}

function addCar(userRef, uid, carName, make, model, year, level) {
  var ref = userRef.child(uid).child("Garage");
  var carCount;
  ref.once("value").then(function(snapshot){
    carCount = snapshot.val().carCount + 1;
    console.log("Car count:");
    console.log(carCount);
    ref.update({
      "carCount": carCount,
      [carName]: ""
    });
    ref.child(carName).update({
      "make": make,
      "model": model,
      "year": year,
      "level": level,
      "Service List": ""
    });
    ref.child(carName).child("Service List").update({
      "serviceCount": 0
    });
  });
}

function addService(userRef, uid, carName, serviceName, priorDate, nextDate, increment) {
  var ref = userRef.child(uid).child("Garage").child(carName).child("Service List");
  var serviceCount;
  ref.once("value").then(function(snapshot){
    serviceCount = snapshot.val().serviceCount + 1;
    ref.update({
      "serviceCount": serviceCount,
      [serviceName]: ""
    })
    ref.child(serviceName).update({
      "priorDates": priorDate,
      "nextDate": nextDate,
      "increment": increment
    })
  });
}

// Read Functions
function verifyUser(userRef, uid, password, callback) {
  var ref = userRef.child(uid).child("password");
  var correctPassword;
  ref.once("value").then(function(snapshot) {
    correctPassword = snapshot.val();
    if (password == correctPassword) {
      callback(true);
    }
    else {
      callback(false);
    }
  });
}

// Returns all cars in user's Garage
function getGarage(userRef, uid, callback) {
  var ref = userRef.child(uid).child("Garage");
  var json = {};
  ref.once("value").then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key;
        if (key != "carCount") {
          json[key] = {};
          json[key]["make"] = childSnapshot.val().make;
          json[key]["model"] = childSnapshot.val().model;
          json[key]["level"] = childSnapshot.val().level;
          json[key]["year"] = childSnapshot.val().year;
        }
      });
    callback(json);
  });
}

// Returns all services for a car in json
function getCar(userRef, uid, carName, callback) {
  var ref = userRef.child(uid).child("Garage").child(carName).child("Service List");
  var json = {};
  ref.once("value").then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key;
        if (key != "serviceCount") {
          json[key] = {};
          json[key]["increment"] = childSnapshot.val().increment;
          json[key]["nextDate"] = childSnapshot.val().nextDate;
          childSnapshot.forEach(function(babySnapshot) {
            json[key]["priorDates"] = babySnapshot.val();
          });
        }
      });
    callback(json);
  });
}

function getIncrement(userRef, uid, carName, serviceName, callback) {
  var ref = userRef.child(uid).child("Garage").child(carName).child("Service List").child(serviceName);
  ref.once("value").then(function(snapshot){
    // Parse increment and return value as int
    var increment = snapshot.val().increment.split(" ");
    callback(+increment[0]);
  });
}

// Update Functions

function removeService(userRef, uid, carName, serviceName) {
  var ref = userRef.child(uid).child("Garage").child(carName).child("Service List");
  var serviceCount;
  ref.once("value").then(function(snapshot){
    serviceCount = snapshot.val().serviceCount - 1;
    ref.update({
      "serviceCount": serviceCount,
    });
  });
  ref.child(serviceName).remove();
}

function removeCar(userRef, uid, carName) {
  var ref = userRef.child(uid).child("Garage");
  var carCount;
  ref.once("value").then(function(snapshot){
    carCount = snapshot.val().carCount - 1;
    ref.update({
      "carCount": carCount,
    });
  });
  ref.child(carName).remove();
}

function updateCar(userRef, uid, carName, make, model, year, level) {
  var ref = userRef.child(uid).child("Garage");
    if (make != "undefined") {
      ref.child(carName).update({
        "make": make
      });
    }
    if (model != "undefined") {
      ref.child(carName).update({
        "model": model
      });
    }
    if (year != "undefined") {
      ref.child(carName).update({
        "year": year
      });
    }
    if (level != "undefined") {
      ref.child(carName).update({
        "level": level
      });
    }
}

function addPriorDate(userRef, uid, carName, serviceName, priorDate) {
  var ref = userRef.child(uid).child("Garage").child(carName).child("Service List").child(serviceName);
  var priorDatesList;
  ref.once("value").then(function(snapshot){
    priorDatesList = snapshot.val().priorDates;
    priorDatesList.unshift(priorDate);
    console.log(priorDatesList);
    ref.update({
      "priorDates": priorDatesList
    });
  });
}

function updateNextDate(userRef, uid, carName, serviceName, nextDate) {
  var ref = userRef.child(uid).child("Garage").child(carName).child("Service List").child(serviceName);
  ref.update({
    "nextDate": nextDate
  });
}

function getEmailId(userRef, uid, callback) {
	var ref = userRef.child(uid).child("email");
	ref.once("value").then(function(snapshot) {
		emailId = snapshot.val();
		console.log("Email Id: "+emailId);
		callback(emailId);
	});
}

function resetPassword(userRef, uid, oldPassword, newPassword, callback) {
  var ref = userRef.child(uid).child("password");
  var correctPassword;
  ref.once("value").then(function(snapshot) {
    correctPassword = snapshot.val();
		console.log(correctPassword+" "+oldPassword);
    if (oldPassword == correctPassword) {
			userRef.child(uid).update({
		    "password": newPassword
		  });
			callback(true);
    }
    else {
			callback(false);
    }
  });
}

function updateUser(userRef, uid, firstname, lastname, phone, notifPhone, notifEmail) {
  var ref = userRef.child(uid);
    if (firstname != "undefined") {
      ref.update({
        "firstname": firstname
      });
    }
		if (lastname != "undefined") {
      ref.update({
        "lastname": lastname
      });
    }
		if (phone != "undefined") {
      ref.update({
        "phone": phone
      });
    }
		if (notifEmail != "undefined") {
      ref.update({
        "notifEmail": notifEmail
      });
    }
		if (notifPhone != "undefined") {
      ref.update({
        "notifPhone": notifPhone
      });
    }
}

function removeUser(userRef, uid, password, callback) {
	var ref = userRef.child(uid);
	verifyUser(userRef, uid, password, (x) => {
			if(x) {
				ref.remove();
				callback(true);
			}
			else {
				callback(false);
			}
	});
}

function getUser(userRef, uid, callback) {
  var ref = userRef.child(uid);
  ref.once("value").then(function(snapshot) {
		var json = {"email": snapshot.val().email, "firstname": snapshot.val().firstname, "lastname": snapshot.val().lastname, "phone": snapshot.val().phone, "notifPhone": snapshot.val().notifPhone, "notifEmail": snapshot.val().notifEmail};
		callback(json);
	});
}
