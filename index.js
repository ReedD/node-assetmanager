/**
 * AssetManager
 * http://www.dadoune.com/
 *
 * Copyright (c) 2014 Reed Dadoune
 * Licensed under the MIT license.
 **/

'use strict';

var glob = require('glob'),
	fs = require('fs'),
	_ = require('underscore');

// Asset holder variable
var assets = {};

exports.process = function (options) {
	// Glob options
	var globOptions = {sync: true};

	options = _.extend({
		assets: {},
		debug: true,
		webroot: false
	}, options);

	/**
	 * Filter out assets that are not files
	 *
	 * @param files
	 */
	var filterFiles = function (files) {
		return _.filter(files, function (file) {
			return fs.statSync(file).isFile();
		});
	};

	/**
	 * Get assets from pattern. Pattern could be
	 *  - an array
	 *  - a string
	 *  - external resource
	 *
	 * @param pattern
	 */
	var getAssets = function (pattern) {
		var files = [];
		if (_.isArray(pattern)) {
			_.each(pattern, function (path) {
				files = files.concat(getAssets(path));
			});
		} else if (_.isString(pattern)) {
			var regex = new RegExp('^(http://|https://|//)');
			if (regex.test(pattern)) {
				// Source is external
				files.push(pattern);
			} else {
				glob(pattern, globOptions, function (er, matches) {
					files = filterFiles(matches);
				});
			}
		}

		return files;
	};

	/**
	 * Strip server path from from file path so
	 * that the file path is relative to the webroot
	 *
	 * @param  array files
	 * @return array files clean filenames
	 */
	var stripServerPath = function(files) {
		var regex = new RegExp('^' + options.webroot);
		_.each(files, function (value, key) {
			files[key] = value.replace(regex, '');
		});
		return files;
	};

	// Core logic to format assets
	_.each(options.assets, function (group, groupName) {
		assets[groupName] = {};
		_.each(group, function (files, fileType) {
			assets[groupName][fileType] = [];
			_.each(files, function (value, key) {
				if (!options.debug) {
					// Production
					assets[groupName][fileType].push(key);
				} else {
					// Development
					assets[groupName][fileType] = assets[groupName][fileType].concat(getAssets(value));
				}
			});
			if (options.webroot) {
				// Strip the webroot foldername from the filepath
				assets[groupName][fileType] = stripServerPath(assets[groupName][fileType]);
			}
		});
	});

	return assets;
};

exports.assets = assets;
