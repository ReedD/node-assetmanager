/**
 * AssetManager
 * http://www.dadoune.com/
 *
 * Copyright (c) 2014 Reed Dadoune
 * Licensed under the MIT license.
 **/

'use strict';

var grunt = require('grunt'),
	crypto = require('crypto'),
	_ = require('lodash');

/**
 * Checks that `resource` is an external URL.
 *
 * @param resource
 */
function isExternal(resource) {
	return new RegExp('^(?:https?:)//').test(resource);
}

// Asset holder variable
var assets = {};

exports.process = function (options) {

  assets = {};

	options = _.extend({
		assets: {},
		debug: true,
		webroot: false
	}, options);

	/**
	 * Get assets from pattern. Pattern could be
	 *  - an array
	 *  - a string
	 *  - external resource
	 *
	 * @param patterns
	 */
	var getAssets = function (patterns) {
		// External restources have to be 1:1 dest to src, both strings
		// Check for external first, otherwise expand the pattern
		if (!_.isArray(patterns)) {
			if (isExternal(patterns)) {
				return [patterns];
			}

			patterns = [patterns];
		}

		return grunt.file.expand({filter: 'isFile'}, patterns);
	};

	/**
	 * Strip server path from from file path so
	 * that the file path is relative to the webroot
	 *
	 * @param  array files
	 * @return array files clean filenames
	 */
	var stripServerPath = function(files) {
		var regex;
		if (options.webroot instanceof RegExp) {
			regex = options.webroot;
		} else {
			regex = new RegExp('^' + options.webroot);
		}
		_.each(files, function (value, key) {
			files[key] = value.replace(regex, '');
		});
		return files;
	};

	/**
	 * Computes an MD5 digest of given files.
	 *
	 * @param  array files
	 * @return MD5 hash (hex-encoded)
	 */
	function md5(files) {
		var hash = crypto.createHash('md5');
		_.each(files, function(file) {
			if (!isExternal(file))
				hash.update(grunt.file.read(file), 'utf-8');
		});
    	return hash.digest('hex');
	};

	// Core logic to format assets
	_.each(options.assets, function (group, groupName) {
		assets[groupName] = {};
		_.each(group, function (files, fileType) {
			assets[groupName][fileType] = [];
			if ('src' in files || 'dest' in files) {
				assets[groupName][fileType] = ((options.debug) ? getAssets(files.src) : files.dest);
			} else {
				_.each(files, function (files, key) {
					if (!options.debug) {
						// Production
						var fingerprint = isExternal(key) ? '' :
							'?' + md5(getAssets(files)).substring(0, 8);
						assets[groupName][fileType].push(key + fingerprint);
					} else {
						// Development
						assets[groupName][fileType] = assets[groupName][fileType].concat(getAssets(files));
					}
				});
			}
			if (options.webroot) {
				// Strip the webroot foldername from the filepath
				assets[groupName][fileType] = stripServerPath(assets[groupName][fileType]);
			}
		});
	});

  exports.assets = assets;

	return assets;
};

exports.assets = assets;
