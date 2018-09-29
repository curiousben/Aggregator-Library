let initializationModule = require('../../lib/utilities/initialize.js')
let InitializationError = require('../../lib/errors/initializationError.js')

const validConfig = {
  'setup': 'external',
  'storage': {
    'strategy': 'singleEvent',
    'policy': {
      'archiveBy': 'Object',
      'eventLimit': 10
    },
    'byteSizeWatermark': 1000000
  }
}

const invalidConfig = {
  'setup': 'external',
  'storage': {
    'strategy': 42,
    'policy': {
      'archiveBy': 'Array',
      'eventLimit': 10
    },
    'byteSizeWatermark': 1000000
  }
}

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the initialization promise for the Aggregator configuration', function () {
  it('Pass in a valid configuration file', function () {
    return initializationModule.initAggregator(validConfig).should.be.become(validConfig)
  })
  it('Pass in an invalid configuration file', function () {
    return initializationModule.initAggregator(invalidConfig).should.be.rejectedWith(InitializationError)
  })
})
