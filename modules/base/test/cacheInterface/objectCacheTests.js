const secondaryCacheInterfaceModule = require('../../lib/cacheInterface/objectCache.js')
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

describe('Testing the Object Cache Interface module', function () {
  let that = this
  beforeEach(function () {
    that.cache = {}
    that.config = {
      'setup': 'internal',
      'storage': {
        'strategy': 'singleEvent',
        'policy': {
          'archiveBy': 'secondary',
          'eventLimit': 2
        },
        'eventTrigger': {
          'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
          'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
        },
        'byteSizeWatermark': 46
      },
      'flushStrategy': 'single'
    }
    that.properties = {}
    that.properties.sizeOfCache = {
      'all': 0,
      'eventCaches': {}
    }
    that.properties.numberOfEvents = {
      'all': 0,
      'eventCaches': {}
    }
  })

  it('Checking if event for Object cache exists', function (done) {
    secondaryCacheInterfaceModule.hasEventEntry(logger, that.cache, 'testPrimaryKey').should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.hasEventEntry(logger, that.cache, 'testPrimaryKey')).should.become(true).should.notify(done)
  })

  it('Checking if Object cache entry exists', function (done) {
    secondaryCacheInterfaceModule.hasObjectEntry(logger, that.cache, 'testPrimaryKey', 'testSecondaryKey').should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.hasObjectEntry(logger, that.cache, 'testPrimaryKey', 'testSecondaryKey')).should.become(true).should.notify(done)
  })

  it('Create an entry in the Object cache', function (done) {
    secondaryCacheInterfaceModule.hasObjectEntry(logger, that.cache, 'testPrimaryKey', 'testSecondaryKey').should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(function () {
        Promise.resolve(that.cache['testPrimaryKey']['testSecondaryKey']).should.become(Buffer.from(JSON.stringify({'testKey': 'testValue'})))
        Promise.resolve(secondaryCacheInterfaceModule.hasObjectEntry(logger, that.cache, 'testPrimaryKey', 'testSecondaryKey')).should.become(true)
      }).should.notify(done)
  })

  it('Update an entry in the Object cache', function (done) {
    secondaryCacheInterfaceModule.hasObjectEntry(logger, that.cache, 'testPrimaryKey', 'testSecondaryKey').should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.hasObjectEntry(logger, that.cache, 'testPrimaryKey', 'testSecondaryKey')).should.become(true).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.updateEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKeyThatisLargerByThanThePrevious': 'testValueThatisLargerByThanThePrevious'}))).should.become(JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(function () {
        Promise.resolve(that.cache['testPrimaryKey']['testSecondaryKey']).should.become(Buffer.from(JSON.stringify({'testKeyThatisLargerByThanThePrevious': 'testValueThatisLargerByThanThePrevious'})))
      }).should.notify(done)
  })

  it('Checking if event cache needs to be flushed', function (done) {
    secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.doesObjectCacheNeedFlush(logger, that, 'testPrimaryKey', 'testSecondaryKey1')).should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.doesObjectCacheNeedFlush(logger, that, 'testPrimaryKey', 'testSecondaryKey1')).should.become(true).should.notify(done)
  })

  it('Checking if whole cache needs to be flushed', function (done) {
    secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.doesCacheNeedFlush(logger, that)).should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.doesCacheNeedFlush(logger, that)).should.become(true).should.notify(done)
  })

  it('Flush Object cache', function (done) {
    secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey1', 'testSecondaryValue').should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey2', 'testSecondaryValue')).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.flushObjectCache(logger, that, 'testPrimaryKey')).should.become({'testPrimaryKey': {'testSecondaryKey1': 'testSecondaryValue', 'testSecondaryKey2': 'testSecondaryValue'}})
      .then(function () {
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(0)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(0)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey')
      }).should.notify(done)
  })

  it('Flush whole cache', function (done) {
    secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey1', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey1', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.flushCache(logger, that)).should.become({'testPrimaryKey': {'testSecondaryKey1': JSON.stringify({'testKey': 'testValue'}), 'testSecondaryKey2': JSON.stringify({'testKey': 'testValue'})}, 'testPrimaryKey1': {'testSecondaryKey1': JSON.stringify({'testKey': 'testValue'}), 'testSecondaryKey2': JSON.stringify({'testKey': 'testValue'})}})
      .then(function () {
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(0)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(0)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey1')
      }).should.notify(done)
  })

  it('Checking to see if cache is empty', function (done) {
    secondaryCacheInterfaceModule.isCacheEmpty(logger, that.properties.sizeOfCache).should.become(true).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.isCacheEmpty(logger, that.properties.sizeOfCache)).should.become(false).should.be.fulfilled.should.notify(done)
  })
})
