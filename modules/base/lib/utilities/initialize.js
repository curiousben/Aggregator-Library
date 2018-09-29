/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

/*
* Module design:
*   This module will check to see if the configuration file has the correct fields
*/

let InitializationError = require('../errors/initializationError.js')

/*
* Description:
*   This promise initializes the Aggregator configuration.
* Args:
*   logger (Logger): This is the logger that is provided by the logger from the consumer.
*   configJSON (Obj): This obj has the configurations for the Aggregator microservice.
* Returns:
*   Aggregator (AggregatorInstance): This AggregatorInstance has a validated configuration and a promise that can be
*     accessed asynchronously that aggregators messages based on those configurations.
*   Example:
{
  "setup": external or internal,
  "storage": {
    "strategy": singleEvent or multiEvent,
    "policy": {
      "archiveBy": Object or Array,
      "eventLimit": 10,
    },
    "byteSizeWatermark": 1000000
  }
}
* Throws:
*   InitializationError (Error): This error is raised if any configurations are out of place when initializing the Aggregator module
* Notes:
*   The default cache watermark is 25 MB if the passed in value is 0 or null.
* TODO:
*   [#1]:
*/

let initAggregator = (aggregatorConfig) => {
  return new Promise(
    resolve => {
      // Checking to see if all base keys exist and has the right types
      if (!('setup' in aggregatorConfig) || !('storage' in aggregatorConfig)) {
        throw new InitializationError('Aggregator configuration is missing either \'setup\' or \'storage\' for the Aggregator configuration.')
      }
      // Setup configuration
      const setupSection = aggregatorConfig['setup']
      if (typeof setupSection !== 'string' && !(setupSection instanceof String)) {
        throw new InitializationError('Aggregator configuration has encountered \'' + setupSection + '\' for the setup configuration in the Setup section. Only strings are accepted.')
      }
      if (setupSection !== 'internal' && setupSection !== 'external') {
        throw new InitializationError('Aggregator configuration has encountered \'' + setupSection + '\' for the setup configuration in the Setup section. Only options \'internal\' and \'external\' are excepted.')
      }

      // Storage configuration
      const storageSection = aggregatorConfig['storage']
      if (!('strategy' in storageSection) || !('policy' in storageSection) || !('byteSizeWatermark' in storageSection)) {
        throw new InitializationError('Aggregator configuration is missing either \'strategy\', \'policy\', or \'byteSizeWatermark\' for the Storage section in the configuration')
      }

      // Strategy Storage subsection
      const storageStrategy = storageSection['strategy']
      if (typeof storageStrategy !== 'string' && !(storageStrategy instanceof String)) {
        throw new InitializationError('Aggregator configuration has encountered \'' + storageStrategy + '\' for the strategy configuration in the Storage section. Only strings are accepted.')
      }
      if (storageStrategy !== 'singleEvent' && storageStrategy !== 'multiEvent') {
        throw new InitializationError('Aggregator configuration has encountered \'' + storageStrategy + '\' for the strategy configuration in the Storage section. Only options \'singleEvent\' and \'multiEvent\' are excepted.')
      }

      // Policy Storage subsection
      const policySubSection = storageSection['policy']
      if (!('archiveBy' in policySubSection) || !('eventLimit' in policySubSection)) {
        throw new InitializationError('Aggregator configuration is missing either \'uniqueData\' or \'eventLimit\' in the Policy subsection of the Data section in the Aggregator configuration')
      }

      const policyArchive = policySubSection['archiveBy']
      if (typeof policyArchive !== 'string' && !(policyArchive instanceof String)) {
        throw new InitializationError('Aggregator configuration has encountered \'' + policyArchive + '\' for the strategy configuration in the Storage section. Only strings are accepted.')
      }
      if (policyArchive !== 'Object' && policyArchive !== 'Array') {
        throw new InitializationError('Aggregator configuration has encountered \'' + policyArchive + '\' for the strategy configuration in the Storage section. Only options \'Object\' and \'Array\' are excepted.')
      }

      const policyEventLimit = policySubSection['eventLimit']
      if (typeof policyEventLimit !== 'number' && isFinite(policyEventLimit)) {
        throw new InitializationError('Aggregator configuration has encountered \'' + policyEventLimit + '\' for the policyEventLimit configuration in the Policy subsection of the Storage section. Only Number values are accepted.')
      }

      resolve(aggregatorConfig)
    }
  )
}

module.exports = {
  initAggregator: initAggregator
}
