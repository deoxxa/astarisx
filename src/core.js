var model = require('./model');
var viewModel = require('./viewModel');
var controllerViewModel = require('./controllerViewModel');
var mixin = require('./mixin');

var page = require('page');

var utils = require('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;
var uuid = utils.uuid;

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
      var tempDesc = {},
        validations = [];

      if('__processedSpec__' in this.originalSpec){
        return this.originalSpec.__processedSpec__;
      }

      // Mixin addons
      if('mixins' in this.originalSpec && proto.constructor.classType !== "Model"){
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
            //assume it is a descriptor and clone
            tempDesc[key] = extend(this.originalSpec[key]);
            if(!('enumerable' in tempDesc[key])){
              tempDesc[key].enumerable = true;
            }
            if(proto.constructor.classType === "ControllerViewModel" && ('viewModel' in tempDesc[key])) {
              //ensure that we don't use the reseved keys
              if(key !== '*' && key !== '_*'){
                viewModels[key] = tempDesc[key].viewModel;
              }
              delete tempDesc[key].viewModel;
              delete tempDesc[key].set;
            } else {
              if(proto.constructor.classType === "Model" && ('aliasFor' in tempDesc[key])){
                aliases[tempDesc[key].aliasFor] = key;
                delete tempDesc[key].aliasFor;
              }

              if(proto.constructor.classType === "Model" && ('validate' in tempDesc[key]) && 
                Object.prototype.toString.call(tempDesc[key].validate) === '[object Object]'){
                //delete setter. just in case
                delete tempDesc[key].validate.set;
                descriptor[key + 'Valid'] = tempDesc[key].validate;
                validations.push(tempDesc[key].validate.get);
                delete tempDesc[key].validate;
              }

              if('kind' in tempDesc[key]){
                if(tempDesc[key].kind === 'pseudo'){
                  tempDesc[key].enumerable = false;
                } else if ((proto.constructor.classType === "ViewModel" && tempDesc[key].kind === 'instance') ||
                  tempDesc[key].kind === 'array') { //'instance' || 'array'
                  autoFreeze.push({fieldName: key, kind: tempDesc[key].kind});
                  //if array then remove set. Can only update array via functions
                  if(tempDesc[key].kind === 'array'){
                    delete tempDesc[key].set;
                  }
                } else if (proto.constructor.classType === "ControllerViewModel" && tempDesc[key].kind === 'static') {
                  hasStatic = true;
                  statics[key] = void(0);
                } else if (proto.constructor.classType === "Model" && tempDesc[key].kind === 'uid') {
                  //Don't do anything as yet
                } else {
                  throw new TypeError('"'+tempDesc[key].kind +'" '+
                    'is not a valid "kind" value. Please review field "' + key + '".');
                }
                delete tempDesc[key].kind;
              }
            }
            descriptor[key] = tempDesc[key];
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

      //add allValid check
      if(proto.constructor.classType === "Model"){
        var validationsLen = validations.length;
        if(validationsLen > 0){
          descriptor.allValid = { 
            get: function(){
              var valid = true;
              for(var v = 0; v < validationsLen; v++){
                if(!!!validations[v].call(this)){
                  valid = false;
                  break;
                }
              }
              return valid;
            }
          }
        }
      }

      this.originalSpec.__processedSpec__ = {
        descriptor: descriptor,
        proto: proto,
        originalSpec: this.originalSpec || {},
        freezeFields: autoFreeze,
        aliases: aliases,
        statics: statics,
        hasStatic: hasStatic,
        viewModels: viewModels
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
  uuid: uuid,
  page: page
};
