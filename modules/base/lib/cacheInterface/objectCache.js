/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module has methods that can interface with an internal Object cache.
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
*   This method is used to add event data in the Object cache.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
*   eventKey (String): This is the event where an Object cache will be stored under
*   objCacheKey (String): This is the key where the data will be stored in the Object cache
*   objCacheValue (String): This is the actual data that is being stored in the Object cache
* Returns:
*   N/A
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let addEntryToObjectCache = (logger, cacheInst, eventKey, objCacheKey, objCacheValue) => {
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to add the data for the %s to the %s cache ...', objCacheKey, eventKey)
      return undefined
    })
    .then(() => readModule.readEventEntry(eventKey, cacheInst.cache))
    .then(value => {
      if (value === undefined) {
        return createModule.createCacheEntry(cacheInst.cache, eventKey, {})
      } else {
        return undefined
      }
    })
    .then(() => bufferManagement.createBufferFromString(objCacheValue))
    .then(buffer => createModule.createCacheEntry(cacheInst.cache[eventKey], objCacheKey, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromBuffer(buffer))
    .then(bufferSize => cacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, eventKey))
    .then(() => cacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, eventKey))
    .then(() => {
      logger.log('debug', '... Successfully added the %s data to the %s cache', objCacheKey, eventKey)
      return undefined
    })
    .catch(error => {
      throw new Error(util.format('... Failed to add %s data ot the %s cache. Details:%s', objCacheKey, eventKey, error.message))
    }))
}

/*
* Description:
*   This method updates Object cache entries in an exit event in an internal cache
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
*   eventKey (String): This is the event where an Object cache will be stored under
*   objCacheKey (String): This is the key where the data will be stored in the Object cache
*   objCacheValue (String): This is the actual data that is being stored in the Object cache
* Returns:
*   oldRecord (Buffer): This is a Buffer of the previously stored data
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
* Design:
*   1.  Retrieve Record at event key
*   2.  Decrease event count by 1
*   3.  Decrease cache size by retrieved record size
*   4.  Create buffer from retrieved Record
*   5.  Insert record at event location in the cache
*   6.  Increase event count by 1
*   7.  Increase cache size by new record size
*   8.  Return retrieve record
*/

let updateEntryToObjectCache = (logger, cacheInst, eventKey, objCacheKey, objCacheValue) => {
  let oldRecordBuffer = null
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to update the %s data for the %s cache ...', objCacheKey, eventKey)
      return undefined
    })
    .then(() => readModule.readObjectEntry(eventKey, objCacheKey, cacheInst.cache))
    .then(oldCacheEntry => {
      oldRecordBuffer = oldCacheEntry
      return oldCacheEntry
    })
    .then(oldCacheEntry => bufferManagement.getSizeOfBufferFromBuffer(oldCacheEntry))
    .then(bufferSize => cacheManagement.decreaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, eventKey, objCacheKey))
    .then(() => cacheManagement.decreaseEventSize(cacheInst.properties.numberOfEvents, eventKey, objCacheKey))
    .then(() => bufferManagement.createBufferFromString(objCacheValue))
    .then(buffer => updateModule.addValueToObj(cacheInst.cache[eventKey], objCacheKey, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromBuffer(buffer))
    .then(bufferSize => cacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, eventKey, objCacheKey))
    .then(() => cacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, eventKey, objCacheKey))
    .then(() => bufferManagement.getStringFromBuffer(oldRecordBuffer))
    .then(oldRecord => {
      logger.log('debug', '... Successfully updated the %s data to the %s cache', objCacheKey, eventKey)
      return oldRecord
    })
    .catch(error => {
      throw new Error(util.format('... Failed to update the %s data to the %s cache. Details:%s', objCacheKey, eventKey, error.message))
    }))
}

/*
* Description:
*   This is methods determines whether or not the Object cache needs to be flushed.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
*   eventKey (String): This is the event where an Object cache will be stored under
*   objCacheKey (String): This is the key where the data will be stored in the Object cache
* Returns:
*   doesObjectCacheNeedFlush (Boolean): This Boolean is determined by whether or not the Object cache needs to be flushed
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let doesObjectCacheNeedFlush = (logger, cacheInst, eventKey, objCacheKey) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if data for %s for the %s cache needs to be flushed ...', objCacheKey, eventKey)
      return undefined
    })
    .then(() => cacheManagement.getEventSize(cacheInst.properties.numberOfEvents, eventKey))
    .then(eventSize => {
      if (eventSize >= cacheInst.config['storage']['policy']['eventLimit']) {
        logger.log('debug', '... The data for %s for the %s cache needs to be flushed.', objCacheKey, eventKey)
        return true
      } else {
        logger.log('debug', '... The data for %s for the %s cache does not need to be flushed.', objCacheKey, eventKey)
        return false
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to determine if data for %s for the %s cache needs to be flushed. Details:%s', objCacheKey, eventKey, error.message))
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
        logger.log('debug', '... The cache needs to be flushed ...')
        return true
      } else {
        logger.log('debug', '... The cache does not need to be flushed ...')
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
*     with the event threshold. If the event threshold is reached or is greater than the threshold the Object
*     cache is flushed.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cacheInst (Object): This Object is the cache instance
*   eventKey (String): This is the event where an Object cache will be stored under
* Returns:
*   (Boolean): This Boolean is determined if the Object cache needs to be flushed.
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let flushObjectCache = (logger, cacheInst, eventKey) => {
  let eventCacheObj = {}
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to flush the %s cache ...', eventKey)
      return undefined
    })
    .then(() => cacheManagement.resetEventSize(cacheInst.properties.numberOfEvents, eventKey))
    .then(() => cacheManagement.resetBufferSize(cacheInst.properties.sizeOfCache, eventKey))
    .then(() => deleteModule.removeEntryObj(eventKey, cacheInst.cache))
    .then(rawCacheObj => {
      let promiseArray = []
      for (const [key, value] of Object.entries(rawCacheObj)) {
        promiseArray.push(new Promise(
          resolve => {
            resolve(bufferManagement.getStringFromBuffer(value))
          })
          .then(stringValue => {
            eventCacheObj[key] = stringValue
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
      finalCache[eventKey] = eventCacheObj
      logger.log('debug', '... Successfully flushed the %s cache', eventKey)
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
            resolve(flushObjectCache(logger, cacheInst, key))
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
*   This method searches for an entry in the object cache.
* Args:
*   logger (Object): The Winston logger that logs the actions of this interface method.
*   cache (Object): This Object is the internal cache that is being searched
*   eventKey (String): This is the event where an Object cache will be stored under
*   objCacheKey (String): This is the key where the data will be stored in the Object cache
* Returns:
*   hasObjectEntry (Boolean): This promise resolves to the boolean value of whether the objCacheKey
*     exists in the Object cache.
* Throws:
*   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
* Notes:
*   To work around a for loop that searchs the whole Object we suppose the value exists and change the boolean
*     statement if it is false.
* TODO:
*   [#1]:
*/

let hasObjectEntry = (logger, cache, eventKey, objCacheKey) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to check to see if there is data for %s for the cache %s', objCacheKey, eventKey)
      return undefined
    })
    .then(() => readModule.readEventEntry(eventKey, cache))
    .then(value => {
      if (value !== undefined) {
        return readModule.readObjectEntry(eventKey, objCacheKey, cache)
          .then(subValue => {
            if (subValue === undefined) {
              logger.log('debug', '... There is no data for %s for the %s cache', objCacheKey, eventKey)
              return false
            } else {
              logger.log('debug', '... There is data for %s for the %s cache', objCacheKey, eventKey)
              return true
            }
          })
          .catch(error => {
            throw error
          })
      } else {
        logger.log('debug', '... There was no cache object for %s', eventKey)
        return false
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to check to see if there was data for %s for the cache %s. Details:%s', objCacheKey, eventKey, error.message))
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
        logger.log('debug', '... The cache for %s does not exist.', eventKey)
        return false
      } else {
        logger.log('debug', '... The cache for %s exists.', eventKey)
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
  addEntryToObjectCache: addEntryToObjectCache,
  updateEntryToObjectCache: updateEntryToObjectCache,
  doesObjectCacheNeedFlush: doesObjectCacheNeedFlush,
  flushObjectCache: flushObjectCache,
  hasObjectEntry: hasObjectEntry,
  hasEventEntry: hasEventEntry,
  doesCacheNeedFlush: doesCacheNeedFlush,
  flushCache: flushCache,
  isCacheEmpty: isCacheEmpty
}
