let AggregatorError = require('../../lib/errors/aggregatorError.js')
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

chai.should()

let aggregatorErrorThrow = () => {
  return new Promise(
    resolve => {
      throw new AggregatorError('Test AggregatorError')
    })
    .catch(error => {
      throw error
    })
}

describe('Testing the AggregatorError module', function () {
  it('Throw an AggregatorError', function () {
    return aggregatorErrorThrow().should.be.rejectedWith(AggregatorError, 'Test AggregatorError')
  })
})
