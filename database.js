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
		getLatestPriorDate,
    updateNextDate,
    getIncrement,
		getEmailId,
		resetPassword,
		changePassword,
		forgotPassword,
		updateUser,
		removeUser,
		getUser,
		checkNotif,
		checkAllNotif
	}

const axios = require('axios');

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

function addService(userRef, uid, carName, serviceName, increment) {
  var ref = userRef.child(uid).child("Garage").child(carName).child("Service List");
  var serviceCount;
  ref.once("value").then(function(snapshot){
    serviceCount = snapshot.val().serviceCount + 1;
    ref.update({
      "serviceCount": serviceCount,
      [serviceName]: ""
    })
    ref.child(serviceName).update({
      "priorDates": {},
      "nextDate": "",
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

function addPriorDate(userRef, uid, carName, serviceName, priorDate, price, location) {
  var ref = userRef.child(uid).child("Garage").child(carName).child("Service List").child(serviceName).child("priorDates");
	var list = {};
	list[priorDate]={};
	ref.once("value").then(function(snapshot){
		if(price!=undefined) {
			list["price"] = price;
		}
		else {
			list["price"] = "null";
		}
		list["location"] = {};
		if(location.address!=undefined) {
			list["location"]["address"] = location.address;
		}
		if(location.lat!=undefined&&location.long!=undefined) {
			list["location"]["lat"] = location.lat;
			list["location"]["long"] = location.long;
		}
		ref.update({
      [priorDate]:list
    });
  });
}

function getLatestPriorDate(userRef, uid, carName, serviceName, callback) {
	var ref = userRef.child(uid).child("Garage").child(carName).child("Service List").child(serviceName).child("priorDates");
	var min = new Date(1950,0,1);
	var latest="";
	ref.once("value").then(function(snapshot) {
	 	snapshot.forEach(function(childSnapshot) {
			key=childSnapshot.key;
			var date=new Date(key.substring(0,4),key.substring(key.indexOf('-')+1,key.lastIndexOf('-'))-1,key.substring(key.lastIndexOf('-')+1));
			if((date-min)>0) {
				min=date;
				latest=key;
			}
		});
		callback(latest);
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

function changePassword(userRef, uid, newPassword, callback) {
  var ref = userRef.child(uid);
	if(newPassword!="undefined") {
		ref.update({
			"password": newPassword
		});
		callback(true);
	}
	else {
		callback(false);
	}
}

function forgotPassword(userRef, email, callback) {
  var ref = userRef;
	var found=false;
	ref.once("value").then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
  		uid=childSnapshot.key;
			var ref2=userRef.child(uid);
			ref2.once("value").then(function(babySnapshot) {
				var emailId=babySnapshot.val().email;
				var name=babySnapshot.firstname;
				if(emailId === email) {
          uid=childSnapshot.key;
					found=true;
          //console.log(uid)
          //console.log(emailId)
          var data = {
            service_id: 'gmail',
            template_id: 'forgot_password',
            user_id: 'user_dIUsSOu0uyfAzEOurtMFv',
            template_params: {
              "email":email,
              "name":name,
              "action_url":("https://carkeeper-90b76.firebaseapp.com/home/forgot/"+uid)
            }
          };
          axios.post('https://api.emailjs.com/api/v1.0/email/send',{
            ...data,
          }).catch((e)=>{
            console.log(e);
            callback(false);
          })
					callback(true);
          return;
				}
			});
		});
		setTimeout(function() {
			if(!found)
			callback(false);
		},1000);
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

function checkNotif(userRef, uid) {
	var ref = userRef.child(uid).child("Garage");
	var json = {};
	var servicesDue="";
	var numServicesDue=0;
	var dateDue;
	ref.once("value").then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key;
				var b=true;
				var b2=false;
				if (key != "carCount") {
					getCar(userRef, uid, key, (services)=> {
							for(var service in services) {
								var dt = services[service]["nextDate"];
								var nextD = new Date(dt.substring(0,4),dt.substring(dt.indexOf('-')+1,dt.lastIndexOf('-'))-1,dt.substring(dt.lastIndexOf('-')+1));
								var today = new Date();
								var dif = Math.floor((Date.UTC(nextD.getFullYear(), nextD.getMonth(), nextD.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) ) /(1000 * 60 * 60 * 24));
								if(dif==1) {
									dateDue=dt;
									b2=true;
									if(b) {
										b=false;
										servicesDue += key+": "+service+", ";
									}
									else {
										servicesDue+=service+", ";
									}
									numServicesDue++;
								}
							}
							if(b2) {
								servicesDue = servicesDue.substring(0,servicesDue.length-2);
								servicesDue+=";  ";
							}
						});

				}
    	});
  	});
		setTimeout(function() {
			if(numServicesDue>0) {
 				getUser(userRef, uid, (user) => {
 					var data = {
 						service_id: 'gmail',
 						template_id: 'service_soon',
 						user_id: 'user_dIUsSOu0uyfAzEOurtMFv',
 						template_params: {
 							"email":user["email"],
 							"service":servicesDue,
 							"name":user["firstname"],
 							"date":dateDue,
 							"action_url":"bit.ly/CarKeeper"
 						}
 					}
 					axios.post('https://api.emailjs.com/api/v1.0/email/send',{
           	...data,
         	}).catch((e)=>{
           console.log(e);
				 })
				 return;
 				});
 			}
		},1000);
	}

	function checkAllNotif(userRef) {
		userRef.once("value").then(function(snapshot) {
	  	snapshot.forEach(function(childSnapshot) {
	    	checkNotif(userRef,childSnapshot.key);
			});
		});
	}
