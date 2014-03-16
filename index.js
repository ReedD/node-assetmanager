/**
 * AssetManager
 * http://www.dadoune.com/
 *
 * Copyright (c) 2014 Reed Dadoune
 * Licensed under the MIT license.
 **/

'use strict';

var glob = require('glob'),
	_ = require('underscore');

// Asset holder variable
var assets = {
	css: [],
	js: []
};

exports.init = function (options) {
	// Glob options
	var globOptions = {sync: true};

	options = _.extend({
		css: {},
		js: {},
		debug: true,
		webroot: false
	}, options);

	// Get CSS
	_.each(options.css, function (value, key) {
		if (!options.debug) {
			assets.css.push(key);
			return;
		}
		if (_.isArray(value)) {
			_.each(value, function (path) {
				glob(path, globOptions, function (er, files) {
					assets.css = assets.css.concat(files);
				});
			});
		} else if (_.isString(value)) {
			glob(value, globOptions, function (er, files) {
				assets.css = assets.css.concat(files);
			});
		}
	});
	// Get JavaScript
	_.each(options.js, function (value, key) {
		if (!options.debug) {
			assets.js.push(key);
			return;
		}
		if (_.isArray(value)) {
			_.each(value, function (path) {
				glob(path, globOptions, function (er, files) {
					assets.js = assets.js.concat(files);
				});
			});
		} else if (_.isString(value)) {
			glob(value, globOptions, function (er, files) {
				assets.js = assets.js.concat(files);
			});
			var regex = new RegExp('^(http://|https://|//)');
			if (value.match(regex).length > 0) {
				// Source is external
				assets.js.push(value);
			}
		}
	});

	if (options.webroot) {
		// Strip the webroot foldername from the filepath
		var regex = new RegExp('^' + options.webroot);
		_.each(assets.css, function (value, key) {
			assets.css[key] = value.replace(regex, '');
		});
		_.each(assets.js, function (value, key) {
			assets.js[key] = value.replace(regex, '');
		});
	}
};

exports.assets = assets;
