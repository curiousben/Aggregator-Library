const createEntryModule = require('../../../lib/cacheInterface/methods/createEntry.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the createEntry module', function () {
  let cache = null
  before(function () {
    cache = {}
  })
  it('Create entry in cache', function (done) {
    createEntryModule.createCacheEntry(cache, 'testKey', 'testValue').should.be.fulfilled.then(function () {
      Promise.resolve(cache).should.become({'testKey': 'testValue'})
    }).should.notify(done)
  })
})
