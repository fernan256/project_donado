/*
* Creat and expoort configuration variables
*
*/

// Container for all the environments
let environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging',
  'hashingSecret' : 'thisissecret',
};

// Production environment
environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production',
  'hashingSecret' : 'thisissecret',
};

// Determine which environment was passed as a command-line argument
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current env exists
let environmentToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

// Export module
module.exports = environmentToExport;
