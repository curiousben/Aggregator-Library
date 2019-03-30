'use strict'

/*
*
*/

// Imported libraries
const Aggregator = require('aggregator')

// 'Private' variables
const _utilities = Symbol('utilities')
const _logger = Symbol('logger')
const _aggregator = Symbol('aggregator')

class CallbackClass {

  /**
   * This method initializes the Client object and sets the logger
   * @param {Object} logger - The Winston logger that is passed into the module
   * @param {Object} utilities - Utility promises that can give the callback promise
   *  the power to publish/acknowledge/CallbackErrorClasses
   */
  constructor (logger, utilities) {

    // Defining the local instance of a logger
    this[_logger] = logger

    // Defining the configuration of the Publisher
    this[_utilities] = utilities
  }

  /**
   * This method checks to see of the file exists and can be read
   * @returns {Promise<void>}
   */
  async initialize(){

    this[_logger].info("Initializing the Aggregator ...")
    const configFile = new this[_utilities].FileReader('/opt/MQClient/config/aggregator.config')
    const aggregatorConfig = await configFile.read()
    const aggregator = new Aggregator(this[_logger], aggregatorConfig)
    await aggregator.initCache()

    // Setting up the event listeners on the Aggregator
    aggregator.on('INSERT', async (cacheEventType, cacheEventStatus, cacheData) => {
      if (cacheEventType === 'ObjectCacheUpdate' && cacheEventStatus === 'OK') {
        const msgObj = JSON.parse(cacheData)
        this[_utilities].ack(msgObj)
        this[_logger].debug(util.format('The message %s has been acked', cacheData))
      }
      if (cacheEventType === 'ObjectCacheInsert' && cacheEventStatus === 'OK') {
        this[_logger].debug(util.format('The message %s has been placed in the cache', cacheData))
      }
    })

    aggregator.on('ERROR', async (errorEventType, errorDesc, cacheData) => {
      try {
        const msgObj = JSON.parse(cacheData)
        await this[_utilities].ack(msgObj)
        this[_logger].error(`Aggregator cache encountered an '${errorEventType}' error. details '${errorDesc}'`)
      } catch (e) {
        this[_logger].error(`An error was encountered in the Aggregator cache while handling an error. Details '${e}'`)
      }
    })

    // Need a way to Nack this message so the flush might need to the send the message through
    aggregator.on('FLUSH', async (cacheEventType, cacheEventStatus, cacheData) => {
      try {
        if (cacheEventType === 'ObjectCacheFlush' && cacheEventStatus === 'OK') {

          // Sends the BlueTooth UUID to the next hop
          await Promise.all(Object.keys(cacheData).map(blueUUID => {
            const cacheDataMsg = {}
            cacheDataMsg.content = blueUUID

            return this[_utilities].publish(cacheDataMsg)
          }))

          // Clears out the cache by acknowledging all of the accumulated messages in the cache
          await Promise.all(Object.entries(cacheData).map( bleUUID => {
            return Object.entries(cacheData[bleUUID]).map(bleMsg => {
              return this[_utilities].ack(bleMsg)
            })
          }).reduce((finalArr, subArr) => {
            return finalArr.concat(subArr)
          }))
        }
      } catch (e) {
        this[_logger].error(`An error was encountered with the publishing of BLE UUIDs and acknowledging the previous messages. Details: '${e}'`)
      }

    })

    this[_logger].info("... Done Initializing the Aggregator")
    this[_aggregator] = aggregator

  }

  /**
  *
  * @param {Object} msg
  * @returns {Object} result.msg
  * @returns {String} result.binding
  */
  async transform(msg) {

    // Grab the UUID and node from the message payload
    const uuid = msg.content.UUID
    const node = msg.content.node

    // Check if the those values exist
    if (uuid === undefined || node === undefined) {
      throw new this[_utilities].CallbackError('InvalidDataStructure', 'The UUID or the node in the data payload was undefined')
    }

    // Process the message in the Aggregator
    try {
      this[_logger].debug(`The message '${JSON.stringify(msg, null, 2)}' will now be processed by the Aggregator`)
      this[_aggregator].processRecord(this[_logger], JSON.stringify(msg), uuid, node)
    } catch (error) {
      const errDesc = `Failed to process event for Aggregation. Details: '${error.name}': '${error.message}'`
      this[_logger].error(errDesc)
      throw new this[_utilities].CallbackError('AggregatorProcessError', errDesc)
    }
    return 'ok'
  }
}

exports.CallbackClass = CallbackClass

