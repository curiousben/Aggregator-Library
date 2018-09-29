const readEntryModule = require('../../../lib/cacheInterface/methods/readEntry.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the read module', function () {
  let primaryCache = {}
  let secondaryCache = {}
  before(function () {
    primaryCache.testPrimaryKey = 'testPrimaryValue'
    secondaryCache.testPrimaryKey = {}
    secondaryCache.testPrimaryKey.testSecondaryKey = 'testSecondaryValue'
  })
  it('Read primary entry in cache', function () {
    return readEntryModule.readEventEntry('testPrimaryKey', primaryCache).should.become('testPrimaryValue')
  })
  it('Read secondary entry in cache', function () {
    return readEntryModule.readObjectEntry('testPrimaryKey', 'testSecondaryKey', secondaryCache).should.become('testSecondaryValue')
  })
})
