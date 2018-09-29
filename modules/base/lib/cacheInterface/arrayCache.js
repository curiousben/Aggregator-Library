/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module has the functions that returns promises that will be used to interface with the
*     array Cache.
*/

const util = require('util')
const createModule = require('./methods/createEntry.js')
const readModule = require('./methods/readEntry.js')
const updateModule = require('./methods/updateEntry.js')
const deleteModule = require('./methods/deleteEntry.js')
const bufferManagement = require('./utilities/bufferManagement.js')
const cacheManagement = require('./utilities/cacheManagement.js')

/*
* Description:
*   This method is used to add event data in the Array cache.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
*   eventKey (String): This is the event where an Object cache will be stored under
*   ArrCacheValue (String): This is the record that is being stored in the Array cache
* Returns:
*   N/A
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let addEntryToArrayCache = (logger, cacheInst, eventKey, ArrCacheValue) => {
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to add data to the %s event cache', eventKey)
      return undefined
    })
    .then(() => readModule.readEventEntry(eventKey, cacheInst.cache))
    .then(value => {
      if (value === undefined) {
        return createModule.createCacheEntry(cacheInst.cache, eventKey, [])
      } else {
        return undefined
      }
    })
    .then(() => bufferManagement.createBufferFromString(ArrCacheValue))
    .then(buffer => updateModule.addValueToArray(cacheInst.cache, eventKey, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromString(ArrCacheValue))
    .then(bufferSize => cacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, eventKey))
    .then(() => cacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, eventKey))
    .then(() => {
      logger.log('debug', '... Successfully added data to the %s event cache', eventKey)
      return undefined
    })
    .catch(error => {
      throw new Error(util.format('... Failed to add data to the %s event cache. Details:%s', eventKey, error.message))
    }))
}

/*
* Description:
*   This method is updates the Array based cache assumming the event already exists.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
*   eventKey (String): This is the event where an Object cache will be stored under
*   ArrCacheValue (String): This is the record that is being stored in the Array cache
* Returns:
*   N/A
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*  There does exist a case where the addition of data exceeds the caceh watermark, but will later cause the cache to be flushed.
* TODO:
*   [#1]:
*/

let updateEntryToArrayCache = (logger, cacheInst, eventKey, ArrCacheValue) => {
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to update the %s cache with the new ArrCacheValue ...', eventKey)
      return undefined
    })
    .then(() => bufferManagement.createBufferFromString(ArrCacheValue))
    .then(buffer => updateModule.addValueToArray(cacheInst.cache, eventKey, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromBuffer(buffer))
    .then(bufferSize => cacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, eventKey))
    .then(() => cacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, eventKey))
    .then(() => {
      logger.log('debug', '... Successfully updateed the %s cache with the new ArrCacheValue.', eventKey)
      return undefined
    })
    .catch(error => {
      throw new Error(util.format('... Failed to update the %s cache with the new ArrCacheValue. Details:%s', eventKey, error.message))
    }))
}

/*
* Description:
*   This is methods determines whether or not the Array cache needs to be flushed.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
*   eventKey (String): This is the event where an Object cache will be stored under
* Returns:
*   doesArrayCacheNeedFlush (Boolean): This Boolean is determined whether or not the cache
*     for a particular event needs to be flushed.
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let doesArrayCacheNeedFlush = (logger, cacheInst, eventKey) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if the data for the %s cache needs to be flushed ...', eventKey)
      return undefined
    })
    .then(() => cacheManagement.getEventSize(cacheInst.properties.numberOfEvents, eventKey))
    .then(eventSize => {
      if (eventSize >= cacheInst.config['storage']['policy']['eventLimit']) {
        logger.log('debug', '... The data for the %s cache needs to be flushed', eventKey)
        return true
      } else {
        logger.log('debug', '... The data for the %s cache does not need to be flushed', eventKey)
        return false
      }
    })
    .catch(error => {
      throw new Error(util.format('.. Failed to determine if the data for the %s cache needs to be flushed. Details:%s', eventKey, error.message))
    })
}

/*
* Description:
*   This methods determines if the whole cache needs to be flush by comparing accumulated bytes in the cache
*     with the bytewatermark. If the byte watermark is reached or the cache is greater the cache is flushed
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
* Returns:
*   doesCacheNeedFlush (Boolean): This Boolean is determined if the whole cache needs to be flushed.
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let doesCacheNeedFlush = (logger, cacheInst) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if the cache needs to be flushed ...')
      return undefined
    })
    .then(() => cacheManagement.getCacheSize(cacheInst.properties.sizeOfCache))
    .then(cacheSize => {
      if (cacheSize >= cacheInst.config['storage']['byteSizeWatermark']) {
        logger.log('debug', '... The cache needs to be flushed.')
        return true
      } else {
        logger.log('debug', '... The cache does not need to be flushed')
        return false
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to determine if the cache needs to be flushed. Details:%s', error.message))
    })
}

/*
* Description:
*   This method determines if the event cache needs to be flush by comparing accumulated event in the cache
*     with the event threshold. If the event threshold is reached or is greater than the threshold the Array
*     cache is flushed.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
*   eventKey (String): This is the event where an Array cache will be stored under
* Returns:
*   finalCache (Object): This Object is the cache for the event
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let flushArrayCache = (logger, cacheInst, eventKey) => {
  let eventCacheArray = []
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to flush the %s cache ...', eventKey)
      return undefined
    })
    .then(() => cacheManagement.resetEventSize(cacheInst.properties.numberOfEvents, eventKey))
    .then(() => cacheManagement.resetBufferSize(cacheInst.properties.sizeOfCache, eventKey))
    .then(() => deleteModule.removeEntryArray(eventKey, cacheInst.cache))
    .then(rawArrayCache => {
      let promiseArray = []
      for (const value of rawArrayCache) {
        promiseArray.push(new Promise(
          resolve => {
            resolve(bufferManagement.getStringFromBuffer(value))
          })
          .then(dataString => {
            eventCacheArray.push(dataString)
            return undefined
          })
          .catch(error => {
            throw error
          })
        )
      }
      return promiseArray
    })
    .then(promiseArray => Promise.all(promiseArray))
    .then(() => {
      let finalCache = {}
      finalCache[eventKey] = eventCacheArray
      logger.log('debug', '... Successfully flushed the %s cache.', eventKey)
      return finalCache
    })
    .catch(error => {
      throw new Error(util.format('... Failed to flush the %s cache. Details:%s', eventKey, error.message))
    }))
}

/*
* Description:
*   This method is flushes the whole cache that has been collected so far.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
* Returns:
*   cacheObj (Object): This is the whole cache of Object caches.
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let flushCache = (logger, cacheInst) => {
  let cacheObj = {}
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to flush the whole cache ...')
      return undefined
    })
    .then(() => {
      let promiseArray = []
      for (const key of Object.keys(cacheInst.cache)) {
        promiseArray.push(new Promise(
          resolve => {
            resolve(flushArrayCache(logger, cacheInst, key))
          })
          .then(JSON => {
            cacheObj = Object.assign(cacheObj, JSON)
            return undefined
          })
          .catch(error => {
            throw error
          })
        )
      }
      return promiseArray
    })
    .then(promiseArray => Promise.all(promiseArray))
    .then(() => {
      logger.log('debug', '... Finished flushing the whole cache')
      return cacheObj
    })
    .catch(error => {
      throw new Error(util.format('... Failed to flush the whole cache. Details:%s', error.message))
    })
}

/*
* Description:
*   This method searches for an event in the cache.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cache (Object): This Object is the internal cache that is being searched
*   eventKey (String): This is the event where an Object cache will be stored under
* Returns:
*   hasEventEntry (Boolean): This promise resolves to the boolean value of whether the event exists in the cache
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let hasEventEntry = (logger, cache, eventKey) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if the cache for %s exists ...', eventKey)
      return undefined
    })
    .then(() => readModule.readEventEntry(eventKey, cache))
    .then(value => {
      if (value === undefined) {
        logger.log('debug', '... The cache for %s exists.', eventKey)
        return false
      } else {
        logger.log('debug', '... The cache for %s does not exist.', eventKey)
        return true
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to determine if the cache for %s exists. Details:%s', eventKey, error.message))
    })
}

/*
* Description:
*   This method checks to see if the cache is empty.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInstSizeOfCache (Object): This is the metadata of the cache size.
* Returns:
*   isCacheEmpty (Boolean): This method determines whether the cache is empty or not.
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let isCacheEmpty = (logger, cacheInstSizeOfCache) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if the cache for is empty ...')
      return undefined
    })
    .then(() => cacheManagement.getCacheSize(cacheInstSizeOfCache))
    .then(sizeOfCache => {
      if (sizeOfCache > 0) {
        logger.log('debug', '... The cache is not empty')
        return false
      } else {
        logger.log('debug', '... The cache is empty')
        return true
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to determine if the cache empty or not. Details:%s', error.message))
    })
}

module.exports = {
  addEntryToArrayCache: addEntryToArrayCache,
  updateEntryToArrayCache: updateEntryToArrayCache,
  doesArrayCacheNeedFlush: doesArrayCacheNeedFlush,
  flushArrayCache: flushArrayCache,
  doesCacheNeedFlush: doesCacheNeedFlush,
  flushCache: flushCache,
  hasEventEntry: hasEventEntry,
  isCacheEmpty: isCacheEmpty
}
