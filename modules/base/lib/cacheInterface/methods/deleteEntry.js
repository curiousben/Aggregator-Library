/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

/*
* Module design:
*   This module will be responsible for deleting entrys from the internal cache.
*/

'use strict'

/*
* Description:
*   This method deltes a key-value pair from the existing cache
* Args:
*   key (String): This String is the key that the entry will be associated with
*   cache (Object): This Object is the internal cache that is being added to
* Returns:
*   cache (Object): This Object is the cache after the entry has been deleted
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*     Decrease memory footprint that the cache will take up when adding Strings
*/

let removeEntryObj = (mainEvent, cache) => {
  return new Promise(
    resolve => {
      let cacheData = cache[mainEvent]
      delete cache[mainEvent]
      resolve(cacheData)
    }
  )
}

/*
* Description:
*   This method empties out the whole array cache.
* Args:
*   cache (Array): This Array is the internal cache that has to be emptied
* Returns:
*   cache (Array): This Array is the internal cache that has been emptied
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let removeEntryArray = (mainEvent, cache) => {
  return new Promise(
    resolve => {
      let cacheData = cache[mainEvent]
      delete cache[mainEvent]
      resolve(cacheData)
    }
  )
}

// Module for raw delete methods for caching
module.exports = {
  removeEntryObj: removeEntryObj,
  removeEntryArray: removeEntryArray
}
