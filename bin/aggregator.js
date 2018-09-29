/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

const redisMQ = require('redisMQ')
const Aggregator = require('../index.js')
const redisMQConfig = '/opt/aggregator/config/redisMQ.config'
const loggerConfig = '/opt/aggregator/config/logger.config'
const aggregatorConfig = '/opt/aggregator/config/aggregator.config'
const util = require('util')

// Example payload
/*
 * This Microservice stores messages in cache and
 * when an event is received that fulfills the caches
 * requirements then the cache flushes its contents
 *
*/

let aggCache = new Aggregator()
let aggPublisher = null
let aggSubscriber = null

// Starting the subscriber
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'WemoService')
  .then(newPublisher => {
    aggPublisher = newPublisher
  })
  .then(() => redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'BLEFilter'))
  .then(newSubscriber => {
    aggSubscriber = newSubscriber
  })
  .then(() => redisMQ.utils.loadJSON(aggregatorConfig))
  .then(configJSON => aggCache.initCache(aggSubscriber.logger, configJSON))
  .then(() => {
    aggCache.on('INSERT', function (cacheEventType, cacheEventStatus, cacheData) {
      if (cacheEventType === 'ObjectCacheUpdate' && cacheEventStatus === 'OK') {
        let metaTag = JSON.parse(cacheData)['metaTag']
        aggSubscriber.acknowledge(metaTag)
        aggSubscriber.logger.debug(util.format('The message %s has been acked', cacheData))
      }
      if (cacheEventType === 'ObjectCacheInsert' && cacheEventStatus === 'OK') {
        aggSubscriber.logger.debug(util.format('The message %s has been placed in the cache', cacheData))
      }
    })

    aggCache.on('ERROR', function (errorEventType, errorDesc, cacheData) {
      let metaTag = JSON.parse(cacheData)['metaTag']
      aggSubscriber.errorHandler(errorDesc, metaTag, null)
      aggSubscriber.logger.error(util.format('Aggreator cache encountered an %s error , details %s', errorDesc))
    })

    // Need a way to Nack this message so the flush might need to the send the message through
    aggCache.on('FLUSH', function (cacheEventType, cacheEventStatus, cacheData) {
      if (cacheEventType === 'ObjectCacheFlush' && cacheEventStatus === 'OK') {
        Promise.resolve()
          .then(() => {
            Object.keys(cacheData).forEach(bleUUID => {
              aggPublisher.sendDirect(null, bleUUID)
                .then(results => {
                  for (const [key, value] of Object.entries(cacheData[bleUUID])) {
                    aggSubscriber.logger.debug(util.format("Acknowledging the BLE sensor data from the node '%s'", key))
                    aggSubscriber.acknowledge(JSON.parse(value)['metaTag'])
                  }
                })
                .catch(error => {
                  throw error
                })
            })
          })
          .catch(error => {
            throw error
          })
      }
    })

    // Need a way to Nack this message so the flush might need to the send the message through
    aggSubscriber.on('Error', err => {
      aggSubscriber.logger.error(util.format('Failed to consume message, details: %s', err))
    })

    aggSubscriber.on('MessageReady', (metaTag, payload) => {
      Promise.resolve()
        .then(() => aggCache.processRecord(aggSubscriber.logger, JSON.stringify({'payload': payload, 'metaTag': metaTag}), payload['UUID'], payload['node']))
        .catch(error => {
          aggSubscriber.errorHandler(error, metaTag, payload)
          throw error
        })
        .catch(error => {
          aggSubscriber.logger.error(util.format('Failed to process event for Aggregation. Details: %s: %s', error.name, error.message))
        })
    })

    aggSubscriber.startConsuming()
      .catch(error => {
        throw error
      })
  }).catch(err => {
    if (aggSubscriber === null || aggSubscriber.logger === undefined) {
      console.error(util.format('----Error: Module error has occured %s: %s', err.name, err.message))
      // Possible that logs could get squashed when using process.exit(1) please look into this
      process.exit(1)
    } else {
      aggSubscriber.logger.error(util.format('Module error has occured %s: %s', err.name, err.message))
      // Possible that logs could get squashed when using process.exit(1) please look into this
      process.exit(1)
    }
  })
