const internalStructure = require('../../../lib/cacheStructure/internal/init.js')
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

  it('Initializing the Internal Cache structure', function (done) {
    internalStructure.init(logger, that, cacheConfig).should.not.be.rejected.should.be.fulfilled
      .then(function () {
        Promise.resolve(that.cache).should.become({})
        Promise.resolve(that.config).should.become(cacheConfig)
        Promise.resolve(that.properties.sizeOfCache).should.become({'all': 0, 'eventCaches': {}})
        Promise.resolve(that.properties.numberOfEvents).should.become({'all': 0, 'eventCaches': {}})
      }).should.notify(done)
  })

  it('Checking Initializing the Internal Cache structure with misconfiguration', function (done) {
    Promise.resolve().then(cacheConfig['storage']['byteSizeWatermark'] = 4999999).should.be.fulfilled
      .then(() => internalStructure.init(logger, that, cacheConfig).should.be.rejectedWith(Error, /... Encountered an Error when creating the cache structure./)).should.notify(done)
  })
})
