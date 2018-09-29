const arrayCacheInterfaceModule = require('../../lib/cacheInterface/arrayCache.js')
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

describe('Testing the Array Cache Interface module', function () {
  let that = this
  beforeEach(function () {
    that.cache = {}
    that.config = {
      'setup': 'internal',
      'storage': {
        'strategy': 'singleEvent',
        'policy': {
          'archiveBy': 'time',
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

  it('Checking if primary entry exists', function (done) {
    arrayCacheInterfaceModule.hasEventEntry(logger, that.cache, 'testPrimaryKey').should.become(false).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'test': 'test1'}))).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.hasEventEntry(logger, that.cache, 'testPrimaryKey').should.become(true)).should.notify(done)
  })

  it('Create an entry in the time cache', function (done) {
    arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'test': 'test1'})).should.be.fulfilled.then(function () {
      Promise.resolve(that.cache['testPrimaryKey']).should.become([Buffer.from(JSON.stringify({'test': 'test1'}))])
      Promise.resolve(that.properties.sizeOfCache['all']).should.become(16)
      Promise.resolve(that.properties.sizeOfCache['eventCaches']['testPrimaryKey']).should.become(16)
      Promise.resolve(that.properties.numberOfEvents['all']).should.become(1)
      Promise.resolve(that.properties.numberOfEvents['eventCaches']['testPrimaryKey']).should.become(1)
    }).should.notify(done)
  })

  it('Update the entry to time cache', function (done) {
    arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'test': 'test1'})).should.be.fulfilled
      .then(arrayCacheInterfaceModule.updateEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'test': 'test1'}))).should.be.fulfilled
      .then(function () {
        Promise.resolve(that.cache['testPrimaryKey']).should.become([Buffer.from(JSON.stringify({'test': 'test1'})), Buffer.from(JSON.stringify({'test': 'test1'}))])
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(32)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']['testPrimaryKey']).should.become(32)
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(2)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']['testPrimaryKey']).should.become(2)
      }).should.notify(done)
  })

  it('Checking to see if cache needs to be flushed', function (done) {
    arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'test': 'test1'})).should.be.fulfilled
      .then(function () {
        Promise.resolve().then(() => arrayCacheInterfaceModule.doesArrayCacheNeedFlush(logger, that, 'testPrimaryKey')).should.become(false)
      }).then(() => arrayCacheInterfaceModule.updateEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'test': 'test1'}))).should.be.fulfilled.then(function () {
        Promise.resolve().then(() => arrayCacheInterfaceModule.doesArrayCacheNeedFlush(logger, that, 'testPrimaryKey')).should.become(true)
      }).should.notify(done)
  })

  it('Checking to see if whole cache needs to be flushed', function (done) {
    arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.doesCacheNeedFlush(logger, that)).should.become(false).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.doesCacheNeedFlush(logger, that)).should.become(true).should.notify(done)
  })

  it('Flushing the time cache', function (done) {
    arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'test1': 'test1'})).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'test2': 'test2'}))).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.flushArrayCache(logger, that, 'testPrimaryKey')).should.become({'testPrimaryKey': [JSON.stringify({'test1': 'test1'}), JSON.stringify({'test2': 'test2'})]})
      .then(function () {
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(0)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(0)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey')
      }).should.notify(done)
  })

  it('Flush whole cache', function (done) {
    arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'testKey1': 'testValue1'})).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'testKey2': 'testValue2'}))).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey1', JSON.stringify({'testKey1': 'testValue1'}))).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey1', JSON.stringify({'testKey2': 'testValue2'}))).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.flushCache(logger, that)).should.become({'testPrimaryKey': [JSON.stringify({'testKey1': 'testValue1'}), JSON.stringify({'testKey2': 'testValue2'})], 'testPrimaryKey1': [JSON.stringify({'testKey1': 'testValue1'}), JSON.stringify({'testKey2': 'testValue2'})]})
      .then(function () {
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(0)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(0)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey1')
      }).should.notify(done)
  })

  it('Check empty cache detection is valid', function (done) {
    arrayCacheInterfaceModule.isCacheEmpty(logger, that.properties.sizeOfCache).should.become(true).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.addEntryToArrayCache(logger, that, 'testPrimaryKey', JSON.stringify({'testKey2': 'testValue2'}))).should.be.fulfilled
      .then(() => arrayCacheInterfaceModule.isCacheEmpty(logger, that.properties.sizeOfCache)).should.become(false).should.be.fulfilled.should.notify(done)
  })
})
