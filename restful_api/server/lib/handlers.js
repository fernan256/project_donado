/*
 * Request handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');


// Define the headers
let handlers = {};

// Users handler
handlers.users = (data,callback) => {
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  // Sanitaze data
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement) {
    // Check duplicate users
    _data.read('users',phone, (err, data) => {
      if(err) {
        // Hash the password
        let hashedPassword = helpers.hash(password);

        if(hashedPassword) {
          // Create the user object
          let userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          }

          // Store the user
          _data.create('users',phone,userObject, (err) => {
            if(!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, {'Error': 'Could not create the new user'});
            }
          });
        } else {
          callback(500, {'Error' : 'Could not hash the user\'s password'});
        }

      } else {
        callback(400, {'Error' : 'Phone already in use'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required fields'});
  }
}

// Users - get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object.
handlers._users.get = (data, callback) => {
  // Check that the phone number is valid
  let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
    // Lookup the user
    _data.read('users',phone, (err,data) => {
      if(!err && data) {
        // Remove password before return callback
        delete data.hashedPassword;
        callback(200,data);
      } else {
        callback(404);
      }
    })
  } else {
    callback(400, {'Error' : 'Missing required field'});
  }
}

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least must be specified)
// @TODO Only let an authenticated user update their object.
handlers._users.put = (data, callback) => {
  // Check that the phone number is valid
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check optional fields
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the phone is invalid
  if(phone) {
    // Error if nothing is sent to update
    if(firstName || lastName || password) {
      // Lookup the user
      _data.read('users',phone, (err,userData) => {
        if(!err && userData) {
          // update the fields necessary
          if(firstName) {
            userData.firstName = firstName;
          }
          if(lastName) {
            userData.lastName = lastName;
          }
          if(password) {
            userData.hashedPassword = helpers.hash(password);
          }
          // Store the updates
          _data.update('users', phone, userData, (err,) => {
            if(!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, {'Error' : 'Could not update the user'});
            }
          });
        } else {
          callback(400, {'Error' : 'The specified user does not exist'});
        }
      })

    } else {
      callback(400, {'Error' : 'Missing fields to update'});
    }
  } else {
    callback(400, {'Error' : 'Missing required field'});
  }
}

// Users - delete
// Required data: phone
// @TODO Only let an authenticated user update their object.
// @TODO Cleanup (delete) any other data files associated with this user.
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
    // Lookup the user
    _data.read('users',phone, (err,data) => {
      if(!err && data) {
        // Remove password before return callback
        _data.delete('users', phone, (err) => {
          if(!err) {
            callback(200);
          } else {
            callback(500, {'Error' : 'Could not delete the specified user'});
          }
        })
      } else {
        callback(400, {'Error': 'Could not find the specified user'});
      }
    })
  } else {
    callback(400, {'Error' : 'Missing required field'});
  }

}

// Ping handler
handlers.ping = (data,callback) => {
  callback(200);
}

// Not found handler
handlers.notFound = (data,callback) => {
  callback(404);
};

// Export the module
module.exports = handlers;
