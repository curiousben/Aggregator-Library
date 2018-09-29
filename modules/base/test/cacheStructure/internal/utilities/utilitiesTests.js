const internalStructureUtils = require('../../../../lib/cacheStructure/internal/utilities/utilities.js')
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

describe('Testing the Internal Cache init module', function () {
  let that = this
  let cacheConfig = null
  beforeEach(function () {
    cacheConfig = null
    let rawCacheConfig = {
      'cache': {
        'setup': 'internal',
        'storage': {
          'strategy': 'singleEvent or multiEvent',
          'policy': {
            'archiveBy': 'secondaryEvent',
            'eventLimit': 10
          },
          'eventTrigger': {
            'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
            'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
          },
          'byteSizeWatermark': 10000000
        },
        'flushStrategy': 'single'
      }
    }
    cacheConfig = rawCacheConfig['cache']
  })

  it('Checking the validation of cache configurations', function (done) {
    internalStructureUtils.validateCacheProps(logger, cacheConfig).should.not.be.rejected.should.be.fulfilled.should.notify(done)
  })

  it('Checking the validation of cache configurations with bad data path', function (done) {
    Promise.resolve(cacheConfig['storage']['eventTrigger']['secondaryEvent'] = []).should.be.fulfilled
      .then(() => internalStructureUtils.validateCacheProps(logger, cacheConfig).should.be.rejectedWith(Error, /The data path encountered for the cache's secondary event Data storage event trigger was empty, this is not allowed./)).should.notify(done)
  })

  it('Checking the validation of cache configurations with less than 5MB of memory space', function (done) {
    Promise.resolve().then(cacheConfig['storage']['byteSizeWatermark'] = 4999999).should.be.fulfilled
      .then(() => internalStructureUtils.validateCacheProps(logger, cacheConfig).should.be.rejectedWith(Error, /It is recommended to have at least 5MB of space for cached data./)).should.notify(done)
  })

  it('Checking the loading of cache configurations', function (done) {
    internalStructureUtils.loadCacheAndProps(logger, that, cacheConfig).should.be.fulfilled
      .then(function () {
        Promise.resolve(that.cache).should.become({})
        Promise.resolve(that.config).should.become(cacheConfig)
        Promise.resolve(that.properties.sizeOfCache).should.become({'all': 0, 'eventCaches': {}})
        Promise.resolve(that.properties.numberOfEvents).should.become({'all': 0, 'eventCaches': {}})
      }).should.notify(done)
  })
})
