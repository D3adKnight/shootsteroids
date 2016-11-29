var describe = require('mocha').describe
var it = require('mocha').it
var assert = require('assert')

describe('Array on client', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1, 2, 3].indexOf(4))
    })
    it('should return index when the value is present', function () {
      assert.equal(0, [1, 2, 3].indexOf(1))
    })
  })
})
