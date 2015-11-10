'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend schema
 */
module.exports = _.extend(
    require('./models/tweets'),
    require('./models/experiments'),
    require('./models/participants'),
    require('./models/results')
);
