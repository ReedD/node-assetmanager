'use strict';

var assetmanager = require('../index.js')
  , assert = require('assert');

describe('assetmanager', function () {

  describe('development', function () {

    var assets = assetmanager.process({
      assets: require('./assets.json'),
      debug: true
    });

    it('should return original arrays', function () {
      assert.equal(assets.main.css.length, 6);
      assert.equal(assets.main.js.length, 6);
      assert.equal(assets.secondary.css.length, 2);
    });

  });

  describe('production', function () {

    var assets = assetmanager.process({
      assets: require('./assets.json'),
      debug: false
    });

    it('should return arrays with keys', function () {
      assert.equal(assets.main.css.length, 2);
      assert.equal(assets.main.js.length, 2);
      assert.equal(assets.secondary.css.length, 1);
    });

    it('should append md5 for cachebusting', function () {
      assert.equal(assets.main.css[0], 'test/build/a.css?d0c53fe8');
      assert.equal(assets.main.js[0], 'test/build/a.js?fe27706c');
      assert.equal(assets.secondary.css[0], 'test/build/c.css?450b0629');
    });

  });

});
