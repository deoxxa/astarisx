var model = require('./model');
var viewModel = require('./viewModel');
var controllerViewModel = require('./controllerViewModel');
var mixin = require('./mixin');

var page = require('page');

var utils = require('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;

var ModelBase = function(){};
var ViewModelBase = function(){};
var ControllerViewModelBase = function(){};

var modelClassConstructor;
var viewModelClassConstructor;
var controllerViewModelClassConstructor;

mixInto(ModelBase, model.Mixin);
mixInto(ViewModelBase, viewModel.Mixin);
mixInto(ControllerViewModelBase, controllerViewModel.Mixin);

var AstarisxClass = {
  createClass: function(ctor, classType, spec){

    var Constructor = function(){};
    Constructor.prototype = new ctor();
    Constructor.prototype.constructor = Constructor;

    var DescriptorConstructor = Constructor;

    var ConvenienceConstructor = function(stateChangeHandler) {
      var descriptor = new DescriptorConstructor();
      return descriptor.construct.apply(ConvenienceConstructor, arguments);
    };

    ConvenienceConstructor.componentConstructor = Constructor;
    Constructor.ConvenienceConstructor = ConvenienceConstructor;

    ConvenienceConstructor.originalSpec = spec;

    // Expose the convience constructor on the prototype so that it can be
    // easily accessed on descriptors. E.g. <Foo />.type === Foo.type and for
    // static methods like <Foo />.type.staticMethod();
    // This should not be named constructor since this may not be the function
    // that created the descriptor, and it may not even be a constructor.
    ConvenienceConstructor.type = Constructor;
    Constructor.prototype.type = Constructor;

    ConvenienceConstructor.classType = classType;
    Constructor.prototype.classType = classType;

    ConvenienceConstructor.getDescriptor = function(){
      var descriptor = {},
        proto = this.prototype,
        viewModels = {},
        autoFreeze = [],
        aliases = {},
        statics = {},
        hasStatic = false,
        key,
        mixinSpec;

      if('__processedSpec__' in this.originalSpec){
        return this.originalSpec.__processedSpec__;
      }

      // Mixin addons
      if('mixins' in this.originalSpec && proto.constructor.classType === "ControllerViewModel"){
        for (var i = 0; i < this.originalSpec.mixins.length; i++) {
          mixinSpec = this.originalSpec.mixins[i];
          for (var name in mixinSpec) {
            var property = mixinSpec[name];
            if (!mixinSpec.hasOwnProperty(name)) {
              continue;
            }
            this.originalSpec[name] = property;
          }
        }
        delete this.originalSpec.mixins;
      }

      for(key in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(key)){
          if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
            //assume it is a descriptor
            this.originalSpec[key].enumerable = true;
            if('viewModel' in this.originalSpec[key] && proto.constructor.classType === "ControllerViewModel") {
              viewModels[key] = this.originalSpec[key].viewModel;
              delete this.originalSpec[key].viewModel;
              delete this.originalSpec[key].set;
            } else {
              if('aliasFor' in this.originalSpec[key] && proto.constructor.classType === "Model"){
                aliases[this.originalSpec[key].aliasFor] = key;
                delete this.originalSpec[key].aliasFor;
              }
              if('kind' in this.originalSpec[key]){
                if(this.originalSpec[key].kind === 'pseudo'){
                  this.originalSpec[key].enumerable = false;
                } else if ((this.originalSpec[key].kind === 'instance' && proto.constructor.classType === "ViewModel") ||
                  this.originalSpec[key].kind === 'array') { //'instance' || 'array'
                  autoFreeze.push({fieldName: key, kind: this.originalSpec[key].kind});
                } else if (this.originalSpec[key].kind === 'static' && proto.constructor.classType === "ControllerViewModel") {
                  hasStatic = true;
                  statics[key] = void(0);
                } else if (this.originalSpec[key].kind === 'uid' && proto.constructor.classType === "Model") {
                  //Don't do anything as yet
                } else {
                  throw new TypeError('"'+this.originalSpec[key].kind +'" '+
                    'is not a valid "kind" value. Please review field "' + key + '".');
                }
                delete this.originalSpec[key].kind;
              }
            }
            descriptor[key] = this.originalSpec[key];
          } else {
            if(key !== 'getInitialState' && key !== 'getWatchedState' &&
              key !== 'getRoutes' && key !== 'getDisplays' && key != 'getTransitions'){
              proto[key] = this.originalSpec[key];
            }
          }
        }
      }

      if(proto.constructor.classType === "ControllerViewModel"){
        this.originalSpec.getViewModels = function(){
          return viewModels;
        }
      }

      this.originalSpec.__processedSpec__ = {
        descriptor: descriptor,
        proto: proto,
        originalSpec: this.originalSpec || {},
        freezeFields: autoFreeze,
        aliases: aliases,
        statics: statics,
        hasStatic: hasStatic
      };
      return this.originalSpec.__processedSpec__;
    };
    return ConvenienceConstructor;
  },
};

modelClassConstructor = AstarisxClass.createClass.bind(this, ModelBase, 'Model');
viewModelClassConstructor = AstarisxClass.createClass.bind(this, ViewModelBase, 'ViewModel');
controllerViewModelClassConstructor = AstarisxClass.createClass.bind(this, ControllerViewModelBase, 'ControllerViewModel');

module.exports = {
  createModelClass: modelClassConstructor,
  createMClass: modelClassConstructor,
  createVMClass: viewModelClassConstructor,
  createViewModelClass: viewModelClassConstructor,
  createControllerViewModelClass: controllerViewModelClassConstructor,
  createCVMClass: controllerViewModelClassConstructor,
  mixin: mixin,
  extend: extend,
  page: page
};
