let describe = require('mocha').describe
let it = require('mocha').it
let assert = require('assert')
// include tested module
let testModule = require('../../server/test_module')

describe('Test Module', () => {
  describe('#test()', () => {
    it('should not be null', () => {
      assert.notEqual(null, testModule)
    })
    it('should return "Hello from test module \\o/"', () => {
      assert.equal('Hello from test module \\o/', testModule())
    })
  })
})
