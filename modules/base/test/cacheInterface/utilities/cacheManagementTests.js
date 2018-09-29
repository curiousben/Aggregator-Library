const cacheManagement = require('../../../lib/cacheInterface/utilities/cacheManagement.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the cache management module', function () {
  let cache = {}

  before(function () {
    cache.properties = {}
    cache.properties.sizeOfCache = {
      'all': 0,
      'eventCaches': {}
    }
    cache.properties.numberOfEvents = {
      'all': 0,
      'eventCaches': {}
    }
  })

  it('Increase Event Size', function (done) {
    cacheManagement.increaseEventSize(cache.properties.numberOfEvents, 'testPrimaryKey', 'testSecondaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.numberOfEvents['all']).should.become(1)
      Promise.resolve(cache.properties.numberOfEvents['eventCaches']['testPrimaryKey']).should.become(1)
    }).should.notify(done)
  })

  it('Increase Buffer Size', function (done) {
    cacheManagement.increaseBufferSize(cache.properties.sizeOfCache, 42, 'testPrimaryKey', 'testSecondaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.sizeOfCache['all']).should.become(42)
      Promise.resolve(cache.properties.sizeOfCache['eventCaches']['testPrimaryKey']).should.become(42)
    }).should.notify(done)
  })

  it('Retreive Event Size', function () {
    return cacheManagement.getEventSize(cache.properties.numberOfEvents, 'testPrimaryKey').should.become(1)
  })

  it('Retreive Buffer Size', function () {
    return cacheManagement.getCacheSize(cache.properties.sizeOfCache).should.become(42)
  })

  it('Reset Event Size', function (done) {
    cacheManagement.resetEventSize(cache.properties.numberOfEvents, 'testPrimaryKey', 'testSecondaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.numberOfEvents['all']).should.become(0)
      Promise.resolve(cache.properties.numberOfEvents['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
    }).should.notify(done)
  })

  it('Reset Buffer Size', function (done) {
    cacheManagement.resetBufferSize(cache.properties.sizeOfCache, 'testPrimaryKey', 'testSecondaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.sizeOfCache['all']).should.become(0)
      Promise.resolve(cache.properties.sizeOfCache['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
    }).should.notify(done)
  })

  it('Descrease Event Size', function (done) {
    cacheManagement.increaseEventSize(cache.properties.numberOfEvents, 'testPrimaryKey').should.be.fulfilled
      .then(() => cacheManagement.decreaseEventSize(cache.properties.numberOfEvents, 'testPrimaryKey', 'testSecondaryKey')).should.be.fulfilled
      .then(function () {
        Promise.resolve(cache.properties.numberOfEvents['all']).should.become(0)
        Promise.resolve(cache.properties.numberOfEvents['eventCaches']['testPrimaryKey']).should.become(0)
      }).should.notify(done)
  })

  it('Decrease Buffer Size', function (done) {
    cacheManagement.increaseBufferSize(cache.properties.sizeOfCache, 42, 'testPrimaryKey').should.be.fulfilled
      .then(() => cacheManagement.decreaseBufferSize(cache.properties.sizeOfCache, 20, 'testPrimaryKey')).should.be.fulfilled
      .then(function () {
        Promise.resolve(cache.properties.sizeOfCache['all']).should.become(22)
        Promise.resolve(cache.properties.sizeOfCache['eventCaches']['testPrimaryKey']).should.become(22)
      }).should.notify(done)
  })
})
