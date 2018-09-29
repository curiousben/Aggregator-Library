/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module will initialize the internal cache structure and validate the confiurations for the cache
*/

const util = require('util')

/*
* Description:
*   This promise validates the  properties that governs structure of the cache
* Args:
*   logger (Logger): This is the logger that is provided by external processes
*   cacheConfig (Object): This is the cache configuration that the cache's properties will be modeled after.
* Returns:
*   N/A
* Throws:
*   N/A
* Notes:
*   This promise is only here for validation and so nothing will be returned if successful
* TODO:
*   [#1]:
*/

let validateCacheProps = (logger, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.log('debug', 'Starting to validate rules for the cache structure ... ')
      let storagePolicy = cacheConfig['storage']['policy']['archiveBy']
      if (storagePolicy === 'secondaryEvent') {
        let secondaryEventPath = cacheConfig['storage']['eventTrigger']['secondaryEvent']
        if (secondaryEventPath.length === 0) {
          throw new Error(util.format('The data path encountered for the cache\'s secondary event Data storage event trigger was empty, this is not allowed. The path encountered was [%s].', secondaryEventPath))
        }
      }
      let waterMark = cacheConfig['storage']['byteSizeWatermark']
      if (waterMark < 5000000) {
        throw new Error('It is recommended to have at least 5MB of space for cached data.')
      } else if (waterMark > 100000000) {
        logger.log('warn', 'Be mindful that this cache microservice has an exceptionally large internal cache')
      } else {
        logger.log('debug', 'Encountered expected cache size')
      }
      logger.log('debug', '... Successfully validate rules for the Cache.')
      resolve()
    }
  )
}

/*
* Description:
*   This promise loads the configurations to the parent module that is calling this function
* Args:
*   that (Cache Module): This is the module instance for which the configurations will be loaded
*   cacheConfig (Object): This is the cache configuration that the cache's properties will be modeled after.
* Returns:
*   N/A
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let loadCacheAndProps = (logger, cacheInst, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.log('debug', 'Starting to load the configurations for the cache and create the cache...')
      cacheInst.cache = {}
      cacheInst.config = cacheConfig
      cacheInst.properties = {}
      cacheInst.properties.sizeOfCache = {
        'all': 0,
        'eventCaches': {}
      }
      cacheInst.properties.numberOfEvents = {
        'all': 0,
        'eventCaches': {}
      }
      logger.log('debug', '... Successfully loaded configurations and created the cache.')
      resolve()
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  validateCacheProps: validateCacheProps,
  loadCacheAndProps: loadCacheAndProps
}
