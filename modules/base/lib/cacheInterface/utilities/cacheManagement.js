/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module houses the utility functions that allows interactions
*     with the structure of the cache
*/

/*
* Description:
*   This method decrease the event size by one. This is under the assumption that the 'mainEvent' has recieved only one event
* Args:
*   cacheNumberOfEvents (Object): This Object is the meta data for the cache.
*   mainEvent (String): This String is the name of the event that needs to have its event decreased by one
* Returns:
*   N/A: This promise resolves to the nothing
* Throws:
*   N/A: Any rejections will happen at run time since the methods used here are very generic
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let decreaseEventSize = (cacheNumberOfEvents, mainEvent) => {
  return new Promise(
    resolve => {
      cacheNumberOfEvents['eventCaches'][mainEvent] -= 1
      cacheNumberOfEvents['all'] -= 1
      resolve()
    }
  )
}

/*
* Description:
*   This method decreases the reported size of the buffer by the size of the new record that is being processed.
* Args:
*   cacheSizeOfCache (Object): This Object has the reported meta data about the size of the buffer.
*   bufferSize (bufferSize): This number represents the size of the buffer that will be reduced from the cache
*   mainEvent (mainEvent): This String is the name of the event that will have the size of it's data be subtracted from the reported size of the cache.
* Returns:
*   N/A: This promise doesn't return anything upon completion
* Throws:
*   N/A: Any rejections will happen at run time since the methods used here are very generic
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let decreaseBufferSize = (cacheSizeOfCache, bufferSize, mainEvent) => {
  return new Promise(
    resolve => {
      cacheSizeOfCache['eventCaches'][mainEvent] -= bufferSize
      cacheSizeOfCache['all'] -= bufferSize
      resolve()
    }
  )
}

/*
* Description:
*   This method increases the event size of the buffer by one record.
* Args:
*   cacheSizeOfCache (Object): This Object has the reported meta data about the size of the buffer.
*   mainEvent (mainEvent): This String is the name of the event that needs to have its event increased by one
* Returns:
*   N/A: This promise doesn't return anything upon completion
* Throws:
*   N/A: Any rejections will happen at run time since the methods used here are very generic
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let increaseEventSize = (cacheNumberOfEvents, mainEvent) => {
  return new Promise(
    resolve => {
      if (mainEvent in cacheNumberOfEvents['eventCaches']) {
        cacheNumberOfEvents['eventCaches'][mainEvent] += 1
      } else {
        cacheNumberOfEvents['eventCaches'][mainEvent] = 1
      }
      cacheNumberOfEvents['all'] += 1
      resolve()
    }
  )
}

/*
* Description:
*   This method increases the reported size of the buffer by the size of the new record that is being processed.
* Args:
*   cacheSizeOfCache (Object): This Object has the reported meta data about the size of the buffer.
*   bufferSize (bufferSize): This number represents the size of the buffer that will be reduced from the cache
*   mainEvent (mainEvent): This String is the name of the event that will have the size of it's data be added to the reported size of the cache.
* Returns:
*   N/A: This promise doesn't return anything upon completion
* Throws:
*   N/A: Any rejections will happen at run time since the methods used here are very generic
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let increaseBufferSize = (cacheSizeOfCache, bufferSize, mainEvent) => {
  return new Promise(
    resolve => {
      if (mainEvent in cacheSizeOfCache['eventCaches']) {
        cacheSizeOfCache['eventCaches'][mainEvent] += bufferSize
      } else {
        cacheSizeOfCache['eventCaches'][mainEvent] = bufferSize
      }
      cacheSizeOfCache['all'] += bufferSize
      resolve()
    }
  )
}

/*
* Description:
*   This method resets the event size of a particular event.
* Args:
*   cacheSizeOfCache (Object): This Object has the reported meta data about the size of the buffer.
*   mainEvent (mainEvent): This String is the name of the event that needs to have its event size reset.
* Returns:
*   N/A: This promise doesn't return anything upon completion
* Throws:
*   N/A: Any rejections will happen at run time since the methods used here are very generic
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let resetEventSize = (cacheNumberOfEvents, mainEvent) => {
  return new Promise(
    resolve => {
      cacheNumberOfEvents['all'] -= cacheNumberOfEvents['eventCaches'][mainEvent]
      delete cacheNumberOfEvents['eventCaches'][mainEvent]
      resolve()
    }
  )
}

/*
* Description:
*   This method resets the reported size of the buffers in the cache.
* Args:
*   cacheSizeOfCache (Object): This Object has the reported meta data about the size of the buffer.
*   mainEvent (mainEvent): This String is the name of the event that will have it's cache reset.
* Returns:
*   N/A: This promise doesn't return anything upon completion
* Throws:
*   N/A: Any rejections will happen at run time since the methods used here are very generic
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let resetBufferSize = (cacheSizeOfCache, mainEvent) => {
  return new Promise(
    resolve => {
      cacheSizeOfCache['all'] -= cacheSizeOfCache['eventCaches'][mainEvent]
      delete cacheSizeOfCache['eventCaches'][mainEvent]
      resolve()
    }
  )
}

/*
* Description:
*   This method retrieves the event size of an event in the cache.
* Args:
*   cacheNumberOfEvents (Object): This Object has the reported meta data about the event size of the buffer.
*   mainEvent (mainEvent): This String is the event that will have it's size retrieved
* Returns:
*   N/A: This promise doesn't return anything upon completion
* Throws:
*   N/A: Any rejections will happen at run time since the methods used here are very generic
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let getEventSize = (cacheNumberOfEvents, mainEvent) => {
  return new Promise(
    resolve => {
      resolve(cacheNumberOfEvents['eventCaches'][mainEvent])
    }
  )
}

/*
* Description:
*   This method retrieves the reported size of the cache.
* Args:
*   cacheSizeOfCache (Object): This Object has the reported meta data about the size of the buffer.
* Returns:
*   N/A: This promise doesn't return anything upon completion
* Throws:
*   N/A: Any rejections will happen at run time since the methods used here are very generic
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let getCacheSize = (cacheSizeOfCache) => {
  return new Promise(
    resolve => {
      resolve(cacheSizeOfCache['all'])
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  getEventSize: getEventSize,
  getCacheSize: getCacheSize,
  decreaseEventSize: decreaseEventSize,
  increaseEventSize: increaseEventSize,
  decreaseBufferSize: decreaseBufferSize,
  increaseBufferSize: increaseBufferSize,
  resetEventSize: resetEventSize,
  resetBufferSize: resetBufferSize
}
