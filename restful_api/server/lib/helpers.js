/*
 * Helpers
 *
 */

const crypto = require('crypto');
const config = require('./config');

// Container for herlpers
let helpers = {};

// Create a SHA256 has
helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0) {
    let hash = crypto.createHmac('SHA256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
}

// Parse a JSON string to an object
helpers.parseJsonToObject = function(str) {
  try {
    let obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
}

// Export module
module.exports = helpers;
