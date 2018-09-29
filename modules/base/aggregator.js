/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

/*
* Module design:
*   This module will be responsible for initializing the correct cache and subsequent methods for interacting
*   with the cache that this microservice is responsible for. The object that will be returned will be the
*   cache (for the internal or external) and methods for interacting with.
*
* Interface:
*   This interface has a response structure that all calls will adhere to. This will removes the responsiblity of the interface having to know how to react to an overfilled cache, misconfiguration, or common responses.
*   This follows a simliar design model of how a microservice should interact with an external endpoint.
*   The following will the be the data structure that is returned after a request is made to the internal data structure:
*     Event:
*       'ERROR':
*         Variable:
*           (1) - 'TypeOfEventFailure'
*           (2) - 'Status'
*           (3) - 'ErrorMessage'
*           (4) - 'Message'
*       'FLUSH':
*         Variable:
*           (1) - 'FlushType'
*           (2) - 'Status'
*           (3) - 'ResponsePayload'
*       'INSERT':
*         Variable:
*           (1) - 'InsertType'
*           (2) - 'Status'
*           (3) - 'ResponsePayload'
*/

const internalCache = require('./lib/cacheStructure/internal/init.js')
const externalCache = require('./lib/cacheStructure/external/init.js')
const arrayCacheInterface = require('./lib/cacheInterface/arrayCache.js')
const objectCacheInterface = require('./lib/cacheInterface/objectCache.js')
const AggregatorError = require('./lib/errors/aggregatorError.js')
const InitializationError = require('./lib/errors/initializationError.js')
const cacheUtilities = require('./lib/utilities/initialize.js')
const EventEmitter = require('events')
const util = require('util')

function cacheInterface () {
  EventEmitter.call(this)

  let storageStrategy = null
  let storagePolicyArchiveBy = null
  let cache = {}

  /*
  * Description:
  *   This promise places the record in an Array cache that can accept only one event
  *     and emits the results of this action.
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

  let singleArrayCache = (logger, cacheInst, eventKey, ArrCacheValue) => {
    return Promise.resolve()
      .then(() => arrayCacheInterface.isCacheEmpty(logger, cacheInst.properties.sizeOfCache))
      .then(isCacheEmpty => {
        if (isCacheEmpty) {
          return arrayCacheInterface.addEntryToArrayCache(logger, cacheInst, eventKey, ArrCacheValue)
            .then(() => {
              this.emit('INSERT', 'ArrayCacheCreate', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        } else {
          return arrayCacheInterface.hasEventEntry(logger, cacheInst.cache, eventKey)
            .then(hasEventEntry => {
              if (hasEventEntry) {
                return arrayCacheInterface.updateEntryToArrayCache(logger, cacheInst, eventKey, ArrCacheValue)
                  .then(() => {
                    this.emit('INSERT', 'ArrayCacheUpdate', 'OK', null)
                  })
                  .catch(error => {
                    throw error
                  })
              } else {
                return arrayCacheInterface.flushCache(logger, cacheInst, eventKey)
                  .then(finalCache => {
                    this.emit('FLUSH', 'ArrayEventFlush', 'OK', finalCache)
                  })
                  .then(() => arrayCacheInterface.addEntryToArrayCache(logger, cacheInst, eventKey, ArrCacheValue))
                  .then(() => {
                    this.emit('INSERT', 'ArrayCacheCreate', 'OK', null)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .then(() => arrayCacheInterface.doesCacheNeedFlush(logger, cacheInst))
      .then(doesCacheNeedFlush => {
        if (doesCacheNeedFlush) {
          return arrayCacheInterface.flushCache(logger, cacheInst)
            .then(cacheObj => {
              this.emit('FLUSH', 'ArrayCacheFlush', 'OK', cacheObj)
            })
            .catch(error => {
              throw error
            })
        } else {
          return arrayCacheInterface.doesArrayCacheNeedFlush(logger, cacheInst, eventKey)
            .then(doesCacheTimeNeedFlush => {
              if (doesCacheTimeNeedFlush) {
                return arrayCacheInterface.flushArrayCache(logger, cacheInst, eventKey)
                  .then(finalCache => {
                    this.emit('FLUSH', 'ArrayEventFlush', 'OK', finalCache)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .catch(error => {
        this.emit('ERROR', 'SingleEventArrayCache', util.format('Failed to process the data event for the cache %s. Details: %s', eventKey, error.message), ArrCacheValue)
      })
  }

  /*
  * Description:
  *   This promise places the record in an Array cache that can accept multiple events
  *     and emits the results of this action.
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

  let multiArrayCache = (logger, cacheInst, eventKey, ArrCacheValue) => {
    return Promise.resolve()
      .then(() => arrayCacheInterface.hasEventEntry(logger, cacheInst.cache, eventKey))
      .then(hasEventEntry => {
        if (hasEventEntry) {
          return arrayCacheInterface.updateEntryToArrayCache(logger, cacheInst, eventKey, ArrCacheValue)
            .then(() => {
              this.emit('INSERT', 'ArrayCacheUpdate', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        } else {
          return arrayCacheInterface.addEntryToArrayCache(logger, cacheInst, eventKey, ArrCacheValue)
            .then(() => {
              this.emit('INSERT', 'ArrayCacheCreate', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        }
      })
      .then(() => arrayCacheInterface.doesCacheNeedFlush(logger, cacheInst))
      .then(doesCacheNeedFlush => {
        if (doesCacheNeedFlush) {
          return arrayCacheInterface.flushCache(logger, cacheInst)
            .then(cacheObj => {
              this.emit('FLUSH', 'ArrayCacheFlush', 'OK', cacheObj)
            })
            .catch(error => {
              throw error
            })
        } else {
          return arrayCacheInterface.doesArrayCacheNeedFlush(logger, cacheInst, eventKey)
            .then(doesCacheTimeNeedFlush => {
              if (doesCacheTimeNeedFlush) {
                return arrayCacheInterface.flushArrayCache(logger, cacheInst, eventKey)
                  .then(finalCache => {
                    this.emit('FLUSH', 'ArrayEventFlush', 'OK', finalCache)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .catch(error => {
        this.emit('ERROR', 'MultiEventArrayCache', util.format('Failed to process the data event for the cache %s. Details: %s', eventKey, error.message), ArrCacheValue)
      })
  }

  /*
  * Description:
  *   This promise places the record in an Object cache that can accept only one event
  *     and emits the results of this action.
  * Args:
  *   logger (Object): The Winston logger that logs the actions of this interface method.
  *   cacheInst (Object): This Object is the cache instance.
  *   eventKey (String): This is the event where an Object cache will be stored under.
  *   objCacheKey (String): This is the key where the data will be stored in the Object cache.
  *   objCacheValue (String): This is the actual data that is being stored in the Object cache.
  * Returns:
  *   N/A
  * Throws:
  *   Error (Error): Any run-time error that is thrown will be thrown to be caught by the parent Promise.
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  let singleObjectCache = (logger, cacheInst, eventKey, objCacheKey, objCacheValue) => {
    return Promise.resolve()
      .then(() => objectCacheInterface.isCacheEmpty(logger, cacheInst.properties.sizeOfCache))
      .then(isCacheEmpty => {
        if (isCacheEmpty) {
          // Cache is empty so add the new objCacheValue
          return objectCacheInterface.addEntryToObjectCache(logger, cacheInst, eventKey, objCacheKey, objCacheValue)
            .then(() => {
              this.emit('INSERT', 'ObjectCacheInsert', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        } else {
          return objectCacheInterface.hasObjectEntry(logger, cacheInst.cache, eventKey, objCacheKey)
            .then(hasObjectEntry => {
              if (hasObjectEntry) {
                // Cache is not empty so add and has data for the object cache
                return objectCacheInterface.updateEntryToObjectCache(logger, cacheInst, eventKey, objCacheKey, objCacheValue)
                  .then(oldRecord => {
                    this.emit('INSERT', 'ObjectCacheUpdate', 'OK', oldRecord)
                  })
                  .catch(error => {
                    throw error
                  })
              } else {
                return objectCacheInterface.hasEventEntry(logger, cacheInst.cache, eventKey)
                  .then(hasEventEntry => {
                    if (hasEventEntry) {
                      // Doesn't have object cache primary Event but has the primary event so implies another secondary event just add
                      return objectCacheInterface.addEntryToObjectCache(logger, cacheInst, eventKey, objCacheKey, objCacheValue)
                        .then(() => {
                          this.emit('INSERT', 'ObjectCacheInsert', 'OK', null)
                        })
                        .catch(error => {
                          throw error
                        })
                    } else {
                      // Doesn't have secondary Event and doesn't have the primary event so this implies another primary
                      // event has been encountered flush entire cache since there will always be only one event.
                      return objectCacheInterface.flushCache(logger, cacheInst)
                        .then(finalCache => {
                          this.emit('FLUSH', 'ObjectEventFlush', 'OK', finalCache)
                        })
                        .then(() => objectCacheInterface.addEntryToObjectCache(logger, cacheInst, eventKey, objCacheKey, objCacheValue))
                        .then(() => {
                          // This is in the event that a new event has been encountered but the data for the new must be inserted
                          this.emit('INSERT', 'FlushedObjectCacheInsert', 'OK', null)
                        })
                        .catch(error => {
                          throw error
                        })
                    }
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .then(() => objectCacheInterface.doesCacheNeedFlush(logger, cacheInst))
      .then(doesCacheNeedFlush => {
        if (doesCacheNeedFlush) {
          return objectCacheInterface.flushCache(logger, cacheInst)
            .then(cacheObj => {
              this.emit('FLUSH', 'CacheFlush', 'OK', cacheObj)
            })
            .catch(error => {
              // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
              throw error
            })
        } else {
          return objectCacheInterface.doesObjectCacheNeedFlush(logger, cacheInst, eventKey, objCacheKey)
            .then(doesObjectCacheNeedFlush => {
              if (doesObjectCacheNeedFlush) {
                return objectCacheInterface.flushObjectCache(logger, cacheInst, eventKey)
                  .then(finalCache => {
                    this.emit('FLUSH', 'ObjectCacheFlush', 'OK', finalCache)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .catch(error => {
        this.emit('ERROR', 'SingleEventObjectCache', util.format('Failed to process the data event for the cache %s. Details: %s', eventKey, error.message), objCacheValue)
      })
  }

  /*
  * Description:
  *   This promise places the record in an Object cache that can accept multiple events
  *     and emits the results of this action.
  * Args:
  *   logger (Object): The Winston logger that logs the actions of this interface method.
  *   cacheInst (Object): This Object is the cache instance
  *   eventKey (String): This is the event where an Object cache will be stored under
  *   objCacheKey (String): This is the key where the data will be stored in the Object cache
  *   objCacheValue (String): This is the actual data that is being stored in the Object cache
  * Returns:
  *   N/A
  * Throws:
  *   Error (Error): Any run-time generic error will be thrown if the process fails to emit the error
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  let multiObjectCache = (logger, cacheInst, eventKey, objCacheKey, objCacheValue) => {
    return Promise.resolve()
      .then(() => objectCacheInterface.hasObjectEntry(logger, cacheInst.cache, eventKey, objCacheKey))
      .then(hasObjectEntry => {
        if (hasObjectEntry) { // New Event has been encountered add the event and the data to the cache
          return objectCacheInterface.updateEntryToObjectCache(logger, cacheInst, eventKey, objCacheKey, objCacheValue)
            .then(oldRecord => {
              this.emit('INSERT', 'ObjectCacheUpdate', 'OK', oldRecord)
            })
            .catch(error => {
              throw error
            })
        } else { // This event entry has already been encountered and the new data will be added
          return objectCacheInterface.addEntryToObjectCache(logger, cacheInst, eventKey, objCacheKey, objCacheValue)
            .then(() => {
              this.emit('INSERT', 'ObjectCacheCreate', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        }
      })
      .then(() => objectCacheInterface.doesCacheNeedFlush(logger, cacheInst))
      .then(doesCacheNeedFlush => {
        if (doesCacheNeedFlush) {
          return objectCacheInterface.flushCache(logger, cacheInst)
            .then(cacheObj => {
              this.emit('FLUSH', 'ObjectCacheFlush', 'OK', cacheObj)
            })
            .catch(error => {
              // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
              throw error
            })
        } else {
          return objectCacheInterface.doesObjectCacheNeedFlush(logger, cacheInst, eventKey, objCacheKey)
            .then(doesObjectCacheNeedFlush => {
              if (doesObjectCacheNeedFlush) {
                return objectCacheInterface.flushObjectCache(logger, cacheInst, eventKey)
                  .then(finalCache => {
                    this.emit('FLUSH', 'ObjectEventFlush', 'OK', finalCache)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .catch(error => {
        this.emit('ERROR', 'MultiEventObjectCache', util.format('Failed to process the data event for the cache %s. Details: %s', eventKey, error.message), objCacheValue)
      })
  }

  /*
  * Description:
  *   This function is responsible for initializing the cache object.
  * Args:
  *   logger (Object): The Winston logger that logs the actions of this interface method.
  *   rawConfigJSON (Object): This Object is an the configuration is the raw configuration that is loaded from the file
  * Returns:
  *   N/A
  * Throws:
  *   InitializationError (Error): This error is thrown if the initialization fails.
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  this.initCache = (logger, rawConfigJSON) => {
    return new Promise(
      resolve => {
        logger.log('debug', 'Starting to initialize a Cache client ...')
        resolve()
      })
      .then(() => cacheUtilities.initAggregator(rawConfigJSON))
      .then(configJSON => {
        let cacheType = configJSON['setup']
        if (cacheType === 'internal') {
          logger.log('info', '... The type of cache is internal ...')
          return (Promise.resolve()
            .then(() => internalCache.init(logger, cache, configJSON))
            .catch(error => {
              throw error
            }))
        } else if (cacheType === 'external') {
          logger.log('info', '... The type of cache is external ...')
          return (Promise.resolve()
            .then(() => externalCache.init(logger, cache, configJSON))
            .catch(error => {
              throw error
            }))
        } else {
          throw new Error(util.format('The cache type is invalid expecting \'internal\' or \'external\' but received: %s', cacheType))
        }
      })
      .then(() => {
        storageStrategy = cache.config['storage']['strategy']
        storagePolicyArchiveBy = cache.config['storage']['policy']['archiveBy']
        logger.log('debug', '... Successfully created a Cache client.')
        return undefined
      })
      .catch(error => {
        throw new InitializationError(util.format('... Failed to initialize the Aggregator cache. Details: %s', error.stack))
      })
  }

  /*
  * Description:
  *
  * Args:
  *   logger (Object): The Winston logger that logs the actions of this interface method.
  *   cacheValue (String): This is the value that is being inserted into the cache.
  *   eventKey (String): This is the event where the cache is stored.
  *   objCacheKey (String): This is the key where the data will be stored in the Object cache
  * Returns:
  *   N/A: While the promise doesn't resolve to any real value an event will be emitted.
  * Throws:
  *   AggregatorError (Error): Any uncaught errors will be wrapped in this error class.
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  this.processRecord = (logger, cacheValue, eventKey, objCacheKey) => {
    if (storageStrategy === 'singleEvent') {
      if (storagePolicyArchiveBy === 'Array') {
        return Promise.resolve()
          .then(() => singleArrayCache(logger, cache, eventKey, cacheValue))
          .catch(error => {
            throw new AggregatorError(util.format('Failed to process a record for the single event cache %s. Details: %s', eventKey, error.message))
          })
      } else {
        return Promise.resolve()
          .then(() => singleObjectCache(logger, cache, eventKey, objCacheKey, cacheValue))
          .catch(error => {
            throw new AggregatorError(util.format('Failed to process a record for the single event cache %s. Details: %s', eventKey, error.message))
          })
      }
    } else if (storageStrategy === 'multiEvent') {
      if (storagePolicyArchiveBy === 'Array') {
        return Promise.resolve()
          .then(() => multiArrayCache(logger, cache, eventKey, cacheValue))
          .catch(error => {
            throw new AggregatorError(util.format('Failed to process a record for the multiple event cache %s. Details: %s', eventKey, error.message))
          })
      } else {
        return Promise.resolve()
          .then(() => multiObjectCache(logger, cache, eventKey, objCacheKey, cacheValue))
          .catch(error => {
            throw new AggregatorError(util.format('Failed to process a record for the multiple event cache %s. Details: %s', eventKey, error.message))
          })
      }
    } else {
      throw new InitializationError('Failed to process cacheValue please intialize the client first.')
    }
  }

  /*
  * Description:
  *   This method is responsible for flushing the cache based on the type of flush
  * Args:
  *   logger (Object): The Winston logger that logs the actions of this interface method.
  *   typeOfFlush (String): This determines how much of the cache is flushed.
  *   eventKey (String): This is the event where the cache is stored.
  * Returns:
  *   N/A: While the promise doesn't resolve to any real value an event will be emitted.
  * Throws:
  *   AggregatorError (Error): Any uncaught errors will be wrapped in this error class.
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  this.flushCache = (logger, typeOfFlush, eventKey) => {
    if (typeOfFlush === 'event') {
      if (storagePolicyArchiveBy === 'Array') {
        return Promise.resolve()
          .then(() => arrayCacheInterface.flushArrayCache(logger, cache, eventKey))
          .then(finalCache => {
            this.emit('FLUSH', 'ArrayEventFlush', 'OK', finalCache)
          })
          .catch(error => {
            throw new AggregatorError(util.format('Failed to flush event cache for %s. Details: %s', eventKey, error.message))
          })
      } else {
        return Promise.resolve()
          .then(() => objectCacheInterface.flushObjectCache(logger, cache, eventKey))
          .then(finalCache => {
            this.emit('FLUSH', 'ObjectEventFlush', 'OK', finalCache)
          })
          .catch(error => {
            throw new AggregatorError(util.format('Failed to flush event cache for %s. Details: %s', eventKey, error.message))
          })
      }
    } else if (typeOfFlush === 'cache') {
      if (storagePolicyArchiveBy === 'Array') {
        return Promise.resolve()
          .then(() => arrayCacheInterface.flushCache(logger, cache))
          .then(finalCache => {
            this.emit('FLUSH', 'ArrayCacheFlush', 'OK', finalCache)
          })
          .catch(error => {
            throw new AggregatorError(util.format('Failed to flush the array based cache. Details: %s', error.message))
          })
      } else {
        return Promise.resolve()
          .then(() => objectCacheInterface.flushCache(logger, cache))
          .then(finalCache => {
            this.emit('FLUSH', 'ObjectCacheFlush', 'OK', finalCache)
          })
          .catch(error => {
            throw new AggregatorError(util.format('Failed to flush the object Cache Interface. Details: %s', error.message))
          })
      }
    } else {
      throw new Error(util.format('Failed to manually flush cache. Unknown type of flush. Received %s', typeOfFlush))
    }
  }
}
util.inherits(cacheInterface, EventEmitter)

module.exports = cacheInterface
