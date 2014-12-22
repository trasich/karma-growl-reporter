var util = require('util');
var growly = require('growly');
var path = require('path');

var MSG_SUCCESS = '%d tests passed in %s.';
var MSG_FAILURE = '%d/%d tests failed in %s.';
var MSG_ERROR = '';
var SPEC_FAILURE = '%s %s FAILED' + '\n';

var OPTIONS = {
  success: {
    dispname: 'Success',
    title: 'PASSED - %s',
    icon: path.join(__dirname, 'images/success.png')
  },
  failed: {
    dispname: 'Failure',
    title: 'FAILED - %s',
    icon: path.join(__dirname, 'images/failed.png')
  },
  error: {
    dispname: 'Aborted',
    title: 'ERROR - %s',
    icon: path.join(__dirname, 'images/error.png')
  }
};


var GrowlReporterCustom = function (helper, logger, config, baseReporterDecorator, formatError) {
  baseReporterDecorator(this, formatError);
  var log = logger.create('reporter.growl.custom');

  var optionsFor = function(type, browser) {
    var prefix = config && config.prefix ? config.prefix : '';
    return helper.merge(OPTIONS[type], {title: prefix + util.format(OPTIONS[type].title, browser)});
  };

  growly.register('Karma', '', [], function(error) {
    var warning = 'No running version of GNTP found.\n' +
	                'Make sure the Growl service is installed and running.\n' +
                  'For more information see https://github.com/theabraham/growly.';
    if (error) {
      log.warn(warning);
    }
  });

  this.adapters = [];



  this.onBrowserComplete = function (browser) {
    var results = browser.lastResult;
    var time = helper.formatTimeInterval(results.totalTime);

    //if (results.disconnected || results.error) {
    //  return growly.notify(MSG_ERROR, optionsFor('error', browser.name));
    //}

    if (results.failed) {
      return growly.notify(util.format(MSG_FAILURE, results.failed, results.total, time),
          optionsFor('failed', browser.name));
    }

    growly.notify(util.format(MSG_SUCCESS, results.success, time), optionsFor('success',
        browser.name));
  };

  this.specFailure = function (browser, result) {
      var specName = result.description;
      var fullSpecName = result.suite.join(' ') + ' ' + result.description;
      var error = '';
      result.log.forEach(function (log) {
          error += log;
      });
      return growly.notify(util.format(SPEC_FAILURE, error, fullSpecName),
        optionsFor('failed', browser.name));
  };

};

GrowlReporterCustom.$inject = ['helper', 'logger', 'config.growlReporter', 'baseReporterDecorator', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
  'reporter:growl-custom': ['type', GrowlReporterCustom]
};
