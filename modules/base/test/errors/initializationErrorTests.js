let InitializationError = require('../../lib/errors/initializationError.js')
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

chai.should()

let initializationErrorThrow = () => {
  return new Promise(
    resolve => {
      throw new InitializationError('Test InitializationError')
    })
    .catch(error => {
      throw error
    })
}

describe('Testing the InitializationError module', function () {
  it('Throw an InitializationError', function () {
    return initializationErrorThrow().should.be.rejectedWith(InitializationError, 'Test InitializationError')
  })
})
