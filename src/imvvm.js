'use strict'

var base = require('./imvvmModelBase');
var mixin = require('./imvvmMixin');

var IMVVM = {
    createModel: base.createModel,
    createViewModel: base.createViewModel,
    createAppViewModel: base.createAppViewModel,
    imvvmMixin: mixin
};

module.exports = IMVVM;