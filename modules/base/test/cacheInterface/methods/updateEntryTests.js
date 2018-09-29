const updateEntryModule = require('../../../lib/cacheInterface/methods/updateEntry.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the update module', function () {
  let objectCache = {}
  let arrayCache = {}

  before(function () {
    arrayCache.testPrimeKey = ['testPrimeValue1', 'testPrimeValue2']
  })

  it('Update array entry in cache', function (done) {
    updateEntryModule.addValueToArray(arrayCache, 'testPrimeKey', 'testPrimeValue3').should.become('testPrimeValue3').then(function () {
      Promise.resolve(arrayCache['testPrimeKey']).should.become(['testPrimeValue1', 'testPrimeValue2', 'testPrimeValue3'])
    }).should.notify(done)
  })

  it('Update object entry in cache', function (done) {
    updateEntryModule.addValueToObj(objectCache, 'testKey', 'testValue').should.become('testValue').then(function () {
      Promise.resolve(objectCache).should.become({testKey: 'testValue'})
    }).should.notify(done)
  })
})
