const deleteEntryModule = require('../../../lib/cacheInterface/methods/deleteEntry.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the delete module', function () {
  let objectCache = {}
  let arrayCache = {}
  before(function () {
    arrayCache.testPrimeKey = ['testPrimeValue1', 'testPrimeValue2', 'testPrimeValue3']
    objectCache.testPrimeKey = {}
    objectCache.testPrimeKey['testSecondaryKey'] = 'testSecondaryValue'
  })
  it('Delete array entry in cache', function (done) {
    deleteEntryModule.removeEntryArray('testPrimeKey', arrayCache).should.become(['testPrimeValue1', 'testPrimeValue2', 'testPrimeValue3']).then(function () {
      Promise.resolve(arrayCache).should.become({})
    }).should.notify(done)
  })
  it('Delete object entry in cache', function (done) {
    deleteEntryModule.removeEntryObj('testPrimeKey', objectCache).should.become({'testSecondaryKey': 'testSecondaryValue'}).then(function () {
      Promise.resolve(objectCache).should.become({})
    }).should.notify(done)
  })
})
