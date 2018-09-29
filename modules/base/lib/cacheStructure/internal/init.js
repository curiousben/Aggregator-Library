/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module will initialize the internal cache structure and validate the confiurations for the cache
*/

const util = require('util')
const utilities = require('./utilities/utilities.js')

/*
* Description:
*   This Promise returns the cache and if it returned the cache then the cache configurations were validated as well
* Args:
*   logger (Logger): This is the logger that is provided by external processes
*   configJSON (Obj): This obj has the configurations for the cache
* Returns:
*   cache (Promise): This Promise resolves to an object that has the cache object
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let init = (logger, cacheInst, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.log('debug', 'Starting to initialize the cache structure...')
      resolve()
    })
    .then(() => utilities.validateCacheProps(logger, cacheConfig))
    .then(() => utilities.loadCacheAndProps(logger, cacheInst, cacheConfig))
    .then(() => {
      logger.log('debug', '... Finished initializing the cache structure.')
    })
    .catch(error => {
      throw new Error(util.format('... Encountered an Error when creating the cache structure. Details:\n\t%s', error.message))
    })
}

// Exports the promise when you create this module
module.exports = {
  init: init
}
