/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

/*
* Module design:
*   This module will be responsible for adding entrys into the internal cache.
*/

'use strict'

/*
* Description:
*   This method searches for an entry in the cache that is the primary event.
* Args:
*   key (String): This String is the key that the entry could be located in
*   cache (Object): This Object is the internal cache that is being searched
* Returns:
*   result (Promise): This promise resolves to the value located at the Primary
*     place in the object.
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let readEventEntry = (key, cache) => {
  return new Promise(
    resolve => {
      resolve(cache[key])
    }
  )
}

/*
* Description:
*   This method searches for an entry in the cache that is an object
* Args:
*   key (String): This String is the key that represents the event in the cache
*   subkey (String): This String is the key that represents the key in an object cache.
*   cache (Object): This Object is the internal cache that is being searched
* Returns:
*   result (Promise): This promise resolves to the value located at the Primary
*     place in the object.
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let readObjectEntry = (key, subKey, cache) => {
  return new Promise(
    resolve => {
      resolve(cache[key][subKey])
    }
  )
}

// Module for raw read methods for caching
module.exports = {
  readObjectEntry: readObjectEntry,
  readEventEntry: readEventEntry
}
