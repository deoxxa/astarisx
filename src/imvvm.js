'use strict'

var base = require('./imvvmBase');
var mixin = require('./mixin');

var IMVVM = {
    createModel: base.createModel,
    createViewModel: base.createViewModel,
    createAppViewModel: base.createAppViewModel,
    mixin: mixin
};

module.exports = IMVVM;