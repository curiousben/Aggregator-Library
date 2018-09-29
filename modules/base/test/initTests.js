const CacheModule = require('../aggregator.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing single event object cache methods', function () {
  let cacheObj = null
  const configSingleObjectJSON = {
    'setup': 'internal',
    'storage': {
      'strategy': 'singleEvent',
      'policy': {
        'archiveBy': 'Object',
        'eventLimit': 4
      },
      'byteSizeWatermark': 6000000
    }
  }
  beforeEach(function () {
    cacheObj = new CacheModule()
    cacheObj.on('ERROR', function (errorType, errorDesc, ArrCacheValue) {
      logger.error('Error encounterd: ' + errorDesc + ' value that caused the error: ' + ArrCacheValue)
    })
  })

  it('Inserting one event in the Cache', function (done) {
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (eventData === null) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
      })
  })

  it('Updating one event in the Cache', function (done) {
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (eventData === JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}})) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
          .then(() => cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey2': {'testKey': 'testValue'}, 'testSecondaryKey3': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
      })
  })

  it('Inserting one new event after a previous event has been encountered', function (done) {
    let flushResult = false
    let insertResult = false
    let finalFlushedCache = {
      'eventKey': {
        'objectCacheKey1': 'testData1',
        'objectCacheKey2': 'testData2',
        'objectCacheKey3': 'testData3'
      }
    }
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'FlushedObjectCacheInsert' && eventData === null) {
            insertResult = true
          }
          if (insertResult && flushResult) {
            done()
          }
        })

        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            flushResult = true
          }
          if (insertResult && insertResult) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey', 'objectCacheKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey', 'objectCacheKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey', 'objectCacheKey3'))
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey2', 'objectCacheKey'))
      })
  })

  it('Triggering the cache to flush from the event limit being reached', function (done) {
    let finalFlushedCache = {
      'eventKey': {
        'objectCacheKey1': 'testData1',
        'objectCacheKey2': 'testData2',
        'objectCacheKey3': 'testData3',
        'objectCacheKey4': 'testData4'
      }
    }

    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectCacheFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey', 'objectCacheKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey', 'objectCacheKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey', 'objectCacheKey3'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey', 'objectCacheKey4'))
      })
  })

  it('Manually flushing the cache after receiving data', function (done) {
    let finalFlushedCache = {
      'PrimaryKey': {
        'ObjectKey1': 'ObjestValue1',
        'ObjectKey2': 'ObjectValue2',
        'ObjectKey3': 'ObjectValue3'
      }
    }
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectCacheFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'ObjestValue1', 'PrimaryKey', 'ObjectKey1'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue2', 'PrimaryKey', 'ObjectKey2'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue3', 'PrimaryKey', 'ObjectKey3'))
          .then(() => cacheObj.flushCache(logger, 'cache', null))
      })
  })

  it('Manually flushing the an event cache after receiving data', function (done) {
    let finalFlushedCache = {
      'PrimaryKey': {
        'ObjectKey1': 'ObjestValue1',
        'ObjectKey2': 'ObjectValue2',
        'ObjectKey3': 'ObjectValue3'
      }
    }
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'ObjestValue1', 'PrimaryKey', 'ObjectKey1'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue2', 'PrimaryKey', 'ObjectKey2'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue3', 'PrimaryKey', 'ObjectKey3'))
          .then(() => cacheObj.flushCache(logger, 'event', 'PrimaryKey'))
      })
  })
})

describe('Testing multi event object cache methods', function () {
  let cacheObj = null
  const configMultiObjectJSON = {
    'setup': 'internal',
    'storage': {
      'strategy': 'multiEvent',
      'policy': {
        'archiveBy': 'Object',
        'eventLimit': 5
      },
      'byteSizeWatermark': 6000000
    }
  }
  beforeEach(function () {
    cacheObj = new CacheModule()
    cacheObj.on('ERROR', function (errorType, errorDesc, ArrCacheValue) {
      logger.error('Error encounterd: ' + errorDesc + ' value that caused the error: ' + ArrCacheValue)
    })
  })

  it('Inserting one event in the Cache', function (done) {
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (eventData === null) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
      })
  })

  it('Updating one event in the Cache', function (done) {
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (eventData === JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}})) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
          .then(() => cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey2': {'testKey': 'testValue'}, 'testSecondaryKey3': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
      })
  })

  it('Inserting one new event after a previous event has been encountered', function (done) {
    let count = 0
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectCacheCreate' && eventData === null) {
            count++
          }
          if (count === 2) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
          .then(() => cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey2', 'ObjectKey'))
      })
  })

  it('Triggering the cache to flush from the event limit being reached', function (done) {
    let finalFlushedCache = {
      'eventKey1': {
        'objectCacheKey1': 'testData1',
        'objectCacheKey2': 'testData2',
        'objectCacheKey3': 'testData3',
        'objectCacheKey4': 'testData4',
        'objectCacheKey5': 'testData5'
      }
    }
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1', 'objectCacheKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1', 'objectCacheKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey2', 'objectCacheKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1', 'objectCacheKey3'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey2', 'objectCacheKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1', 'objectCacheKey4'))
          .then(() => cacheObj.processRecord(logger, 'testData5', 'eventKey1', 'objectCacheKey5'))
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey3', 'objectCacheKey1'))
      })
  })

  it('Manually flushing the whole cache after receiving data', function (done) {
    let finalFlushedCache = {
      'PrimaryKey1': {
        'ObjectKey1': 'ObjestValue1',
        'ObjectKey2': 'ObjectValue2',
        'ObjectKey3': 'ObjectValue3'
      },
      'PrimaryKey2': {
        'ObjectKey1': 'ObjectValue1',
        'ObjectKey2': 'ObjectValue2'
      }
    }
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectCacheFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'ObjestValue1', 'PrimaryKey1', 'ObjectKey1'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue2', 'PrimaryKey1', 'ObjectKey2'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue3', 'PrimaryKey1', 'ObjectKey3'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue1', 'PrimaryKey2', 'ObjectKey1'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue2', 'PrimaryKey2', 'ObjectKey2'))
          .then(() => cacheObj.flushCache(logger, 'cache', null))
      })
  })

  it('Manually flushing the an event cache after receiving data', function (done) {
    let finalFlushedCache = {
      'PrimaryKey1': {
        'ObjectKey1': 'ObjestValue1',
        'ObjectKey2': 'ObjectValue2',
        'ObjectKey3': 'ObjectValue3'
      }
    }
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'ObjestValue1', 'PrimaryKey1', 'ObjectKey1'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue2', 'PrimaryKey1', 'ObjectKey2'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue3', 'PrimaryKey1', 'ObjectKey3'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue1', 'PrimaryKey2', 'ObjectKey1'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue2', 'PrimaryKey2', 'ObjectKey2'))
          .then(() => cacheObj.flushCache(logger, 'event', 'PrimaryKey1'))
      })
  })
})

describe('Testing single event array cache methods', function () {
  let cacheObj = null

  const configSingleArrayJSON = {
    'setup': 'internal',
    'storage': {
      'strategy': 'singleEvent',
      'policy': {
        'archiveBy': 'Array',
        'eventLimit': 7
      },
      'byteSizeWatermark': 6000000
    }
  }

  beforeEach(function () {
    cacheObj = new CacheModule()
    cacheObj.on('ERROR', function (errorType, errorDesc, ArrCacheValue) {
      logger.error('Error encounterd: ' + errorDesc + ' value that caused the error: ' + ArrCacheValue)
    })
  })

  it('Inserting one event in the Cache', function (done) {
    cacheObj.initCache(logger, configSingleArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayCacheCreate' && eventResult === 'OK' && eventData === null) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
      })
  })

  it('Updating one event in the Cache', function (done) {
    let eventCount = 0
    cacheObj.initCache(logger, configSingleArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          eventCount++
          if (cacheEvent === 'ArrayCacheUpdate' && eventResult === 'OK' && eventData === null && eventCount === 2) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
          .then(() => cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey2': {'testKey': 'testValue'}, 'testSecondaryKey3': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
      })
  })

  it('Inserting one new event after a previous event has been encountered', function (done) {
    let finalFlushedCache = {
      'eventKey1': [
        'testData1',
        'testData2',
        'testData3',
        'testData4',
        'testData5'
      ]
    }
    cacheObj.initCache(logger, configSingleArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData5', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey2'))
      })
  })

  it('Triggering the cache to flush from the event limit being reached', function (done) {
    let finalFlushedCache = {
      'eventKey1': [
        'testData1',
        'testData2',
        'testData3',
        'testData4',
        'testData5',
        'testData6',
        'testData7'
      ]
    }
    cacheObj.initCache(logger, configSingleArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData5', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData6', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData7', 'eventKey1'))
      })
  })

  it('Manually flushing the cache after receiving data', function (done) {
    let finalFlushedCache = {
      'eventKey1': [
        'testData1',
        'testData2',
        'testData3',
        'testData4',
        'testData5'
      ]
    }
    cacheObj.initCache(logger, configSingleArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayCacheFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData5', 'eventKey1'))
          .then(() => cacheObj.flushCache(logger, 'cache', null))
      })
  })

  it('Manually flushing the an event cache after receiving data', function (done) {
    let finalFlushedCache = {
      'eventKey1': [
        'testData1',
        'testData2',
        'testData3',
        'testData4',
        'testData5'
      ]
    }
    cacheObj.initCache(logger, configSingleArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData5', 'eventKey1'))
          .then(() => cacheObj.flushCache(logger, 'event', 'eventKey1'))
      })
  })
})

describe('Testing multi event array cache methods', function () {
  let cacheObj = null

  const configMultiArrayJSON = {
    'setup': 'internal',
    'storage': {
      'strategy': 'multiEvent',
      'policy': {
        'archiveBy': 'Array',
        'eventLimit': 5
      },
      'byteSizeWatermark': 6000000
    }
  }

  beforeEach(function () {
    cacheObj = new CacheModule()
    cacheObj.on('ERROR', function (errorType, errorDesc, ArrCacheValue) {
      logger.error('Error encounterd: ' + errorDesc + ' value that caused the error: ' + ArrCacheValue)
    })
  })

  it('Inserting one event into the Array Cache', function (done) {
    cacheObj.initCache(logger, configMultiArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayCacheCreate' && eventResult === 'OK' && eventData === null) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
      })
  })

  it('Updating one event in the Cache', function (done) {
    let eventCount = 0
    cacheObj.initCache(logger, configMultiArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayCacheUpdate') {
            eventCount++
          }
          if (eventCount === 2) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey'))
          .then(() => cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey2': {'testKey': 'testValue'}, 'testSecondaryKey3': {'testKey': 'testValue'}}}), 'PrimaryKey'))
          .then(() => cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey4': {'testKey': 'testValue'}, 'testSecondaryKey3': {'testKey': 'testValue'}}}), 'PrimaryKey'))
      })
  })

  it('Inserting one new event after a previous event has been encountered', function (done) {
    let eventCount = 0
    cacheObj.initCache(logger, configMultiArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayCacheCreate') {
            eventCount++
          }
          if (eventCount === 2) {
            eventCount = 0
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey2'))
      })
  })

  it('Triggering the cache to flush from the event limit being reached', function (done) {
    let finalFlushedCache = {
      'eventKey1': [
        'testData1',
        'testData2',
        'testData3',
        'testData4',
        'testData5'
      ]
    }
    cacheObj.initCache(logger, configMultiArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData5', 'eventKey1'))
      })
  })

  it('Manually flushing the cache after receiving data', function (done) {
    let finalFlushedCache = {
      'eventKey1': [
        'testData1',
        'testData2',
        'testData3',
        'testData4'
      ],
      'eventKey2': [
        'testData1',
        'testData2',
        'testData3',
        'testData4'
      ]
    }
    cacheObj.initCache(logger, configMultiArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayCacheFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey2'))
          .then(() => cacheObj.flushCache(logger, 'cache', 'eventKey1'))
      })
  })

  it('Manually flushing the an event cache after receiving data', function (done) {
    let finalFlushedCache = {
      'eventKey2': [
        'testData1',
        'testData2',
        'testData3',
        'testData4'
      ]
    }
    cacheObj.initCache(logger, configMultiArrayJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ArrayEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1'))
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey2'))
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey2'))
          .then(() => cacheObj.flushCache(logger, 'event', 'eventKey2'))
      })
  })
})
