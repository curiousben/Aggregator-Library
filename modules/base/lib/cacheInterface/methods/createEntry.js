/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

/*
* Module design:
*   This module will be responsible for adding values into the internal cache.
*/

'use strict'

/*
* Description:
*   This method adds a key-value pair to the existing cache. This will overwrite any thing previously there to ensure itonly adds
* Args:
*   key (String): This String is the key that the value will be associated with
*   value (String): This String is the value that the key will be mapped to
*   cache (Object): This Object is the internal cache that will be added to
* Returns:
*   value (Promise): This Promise resolves to the value that was passed in so the add entry to
*     Object Promise is transparent so other processes can use the same value.
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*     Decrease memory footprint that the cache will take up when adding Strings
*/

let createCacheEntry = (cache, key, entry) => {
  return new Promise(
    resolve => {
      cache[key] = entry
      resolve(entry)
    }
  )
}

// Module for raw create methods for caching
module.exports = {
  createCacheEntry: createCacheEntry
}
