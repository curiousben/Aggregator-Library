/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

/*
* Module design:
*   This module will be responsible for updating entrys into the internal cache. NOTE: this
*     modeule only has methods that can manipulate
*/

'use strict'

/*
* Description:
*   This method updates a key-value pair and returns the new cache Object
* Args:
*   key (String): This String is the key that the entry will be associated with
*   entry (String): This String is the value that the key will be mapped to
*   cache (Object): This Object is the internal cache that is being updated
* Returns:
*   cache (Object): This Object is the cache after the entry has been updated
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let addValueToObj = (cache, key, value) => {
  return new Promise(
    resolve => {
      cache[key] = value
      resolve(value)
    }
  )
}

/*
* Description:
*   This method updates a key-value pair and returns the new cache Object
* Args:
*   key (String): This String is the key that the entry will be associated with
*   entry (String): This String is the value that the key will be mapped to
*   cache (Object): This Object is the internal cache that is being updated
* Returns:
*   cache (Object): This Object is the cache after the entry has been updated
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let addValueToArray = (cache, key, value) => {
  return new Promise(
    resolve => {
      let cacheArray = cache[key]
      cacheArray.push(value)
      resolve(value)
    }
  )
}

// Module for raw update methods for caching
module.exports = {
  addValueToObj: addValueToObj,
  addValueToArray: addValueToArray
}
