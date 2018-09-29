/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module houses the utility buffer functions that allows
*     interactions with buffer entites
*/

/*
* Description:
*   This method returns a JSON Object of the data that was
* Args:
*   buffer (Buffer): This Buffer is a String Buffer that has been passed in
* Returns:
*   JSONObj (Object): This Object is an object created from the buffered String
*     that had been passed in.
* Throws:
*   SyntaxError (Exception): This Exception is thrown if the contents of the buffer are
*     not in proper JSON format
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let getStringFromBuffer = (buffer) => {
  return new Promise(
    resolve => {
      resolve(buffer.toString())
    }
  )
}

/*
* Description:
*   This method returns the byte length of a string.
* Args:
*   string (String): This String is the string that the byte length will be returned
* Returns:
*   length (Integer): This Integer is the byte length of the string passed in.
* Throws:
*   Exception (Exception): This Exception is thrown if the contents of the buffer are invalid
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let getSizeOfBufferFromString = (string) => {
  return new Promise(
    resolve => {
      resolve(Buffer.byteLength(string, 'utf8'))
    }
  )
}

/*
* Description:
*   This promise resolves to the amount of space the the Buffered cache is taking up
* Args:
*   buffer (buffer): This is a buffer that is passed in that will be evaluated
* Returns:
*   sizeOfbuffer (Integer): This promise will resolve to a size or length of the
*     buffer that is passed in.
* Throws:
*   N/A
* Notes:
*   This can also accepted the types String, Integer, Object, and Array in addition
*     to the Buffer type.
* TODO:
*   [#1]:
*/
let getSizeOfBufferFromBuffer = (buffer) => {
  return new Promise(
    resolve => {
      resolve(Buffer.byteLength(buffer))
    }
  )
}

/*
* Description:
*   This promise resolves to a buffer of the data that was passed in to the function
* Args:
*   data (String): This is data that has been passed in will need to be a String
* Returns:
*   bufferOfData (Buffer): This will be a buffer that was created from the data
* Throws:
*   TypeError (Error): This error will be thrown if the data type is not either an
*     Buffer, String, Array, Object, or ArrayBuffer.
* Notes:
*   It might be possible to cast everything that is passed into this fuction as
*     either Buffer, String, Array, Object, or ArrayBuffer but this will add
*     overhead it might be better to get it before it even is passed in
* TODO:
*   [#1]:
*/
let createBufferFromString = (data) => {
  return new Promise(
    resolve => {
      resolve(Buffer.from(data))
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  getStringFromBuffer: getStringFromBuffer,
  getSizeOfBufferFromString: getSizeOfBufferFromString,
  getSizeOfBufferFromBuffer: getSizeOfBufferFromBuffer,
  createBufferFromString: createBufferFromString
}
