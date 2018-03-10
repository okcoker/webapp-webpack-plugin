const path = require('path');
const assert = require('assert');
const childCompiler = require('./compiler');
const util = require('./util');

function WebappWebpackPlugin (options) {
  if (typeof options === 'string') {
    options = {logo: options};
  }
  assert(typeof options === 'object', 'WebappWebpackPlugin options are required');
  assert(options.logo, 'An input file is required');
  this.options = options;
  this.options.prefix = this.options.prefix || 'assets-[hash]/';
  this.options.favicons = this.options.favicons || {};
  this.options.inject = (this.options.inject !== undefined) ? this.options.inject : true;
}

WebappWebpackPlugin.prototype.apply = function (compiler) {
  if (!this.options.favicons.appName) {
    this.options.favicons.appName = this.guessAppName(compiler.context);
  }

  if (!this.options.favicons.appDescription) {
    this.options.favicons.appDescription = this.guessDescription(compiler.context);
  }

  if (!this.options.favicons.version) {
    this.options.favicons.version = this.guessVersion(compiler.context);
  }

  if (!this.options.favicons.developerName) {
    this.options.favicons.developerName = this.guessDeveloperName(compiler.context);
  }

  if (!this.options.favicons.developerURL) {
    this.options.favicons.developerURL = this.guessDeveloperURL(compiler.context);
  }

  util.tap(compiler, 'make', 'WebappWebpackPlugin', async (compilation, callback) => {
    try {
      // Generate favicons
      const result = await childCompiler.compileTemplate(this.options, compiler.context, compilation);
      if (this.options.inject) {
        // Hook into the html-webpack-plugin processing and add the html
        util.tap(compilation, 'html-webpack-plugin-before-html-processing', 'WebappWebpackPlugin', (htmlPluginData, callback) => {
          if (htmlPluginData.plugin.options.favicons !== false) {
            htmlPluginData.html = htmlPluginData.html.replace(/(<\/head>)/i, result.sort().join('') + '$&');
          }
          callback(null, htmlPluginData);
        });
      }
      callback();
    } catch (err) {
      callback(err);
    }
  });
};

/**
 * Tries to find the package.json and caches its contents
 */
WebappWebpackPlugin.prototype.findPackageJson = function (context) {
  this.pkg = this.pkg
    || util.readJSON(path.resolve(context, 'package.json'))
    || util.readJSON(path.resolve(context, '../package.json'))
    || {};

  return this.pkg;
}

/**
 * Tries to guess the name from the package.json
 */
WebappWebpackPlugin.prototype.guessAppName = function (context) {
  return this.findPackageJson(context).name;
}

/**
 * Tries to guess the description from the package.json
 */
WebappWebpackPlugin.prototype.guessDescription = function (context) {
  return this.findPackageJson(context).description;
}

/**
 * Tries to guess the version from the package.json
 */
WebappWebpackPlugin.prototype.guessVersion = function (context) {
  return this.findPackageJson(context).version;
}

/**
 * Tries to guess the author name from the package.json
 */
WebappWebpackPlugin.prototype.guessDeveloperName = function (context) {
  return util.getAuthor(this.findPackageJson(context)).name;
}

/**
 * Tries to guess the author URL from the package.json
 */
WebappWebpackPlugin.prototype.guessDeveloperURL = function (context) {
  return util.getAuthor(this.findPackageJson(context)).url;
}

module.exports = WebappWebpackPlugin;