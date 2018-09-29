// https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87
'use strict'

/*
* Description:
*   This class is a custom error class that signals that the aggregator initialization process ran into an error.
* Args:
*   message (String): The error message that is passed in.
* Returns:
*   AggregatorInitializationError (Obj): An AggregatorInitializationError object.
*/

class AggregatorInitializationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AggregatorInitializationError'
  }
}
module.exports = AggregatorInitializationError
