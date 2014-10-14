var model = require('./model');
var viewModel = require('./viewModel');
var controllerViewModel = require('./controllerViewModel');
var mixin = require('./mixin');

var page = require('page');

var utils = require('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;
var createMergedResultFunction = utils.createMergedResultFunction;
var createChainedFunction = utils.createChainedFunction;
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
        autoFreeze,
        aliases,
        statics,
        clientFields,
        hasStatic = false,
        key,
        mixinSpec,
        tempDesc = {},
        validations;

      if('__processedSpec__' in this.originalSpec){
        return this.originalSpec.__processedSpec__;
      }
      var tempFieldsSpec = {};
      var tempMergeMethodsSpec = {}, tempMethodsSpec = {};
      // Mixin addons into the originalSpec
      if('mixins' in this.originalSpec){
        for (var i = 0; i < this.originalSpec.mixins.length; i++) {
          mixinSpec = this.originalSpec.mixins[i];
          for (var prop in mixinSpec) {
            if (!mixinSpec.hasOwnProperty(prop)) {
              continue;
            }
            
            //If field is getter or setter and is not defined in originalSpec
            //then add it to tempFieldsSpec. originalSpec wins otherwise last prop wins.
            if(('get' in mixinSpec[prop] || 'set' in mixinSpec[prop]) && !(prop in this.originalSpec)){
              tempFieldsSpec[prop] = mixinSpec[prop];
            } else {
              //must be a function.
              //functions starting with get return Objects. The output will be merged
              //otherwise the function is chained
              if(prop.substring(0, 3) === 'get'){
                tempMergeMethodsSpec[prop] = tempMergeMethodsSpec[prop] || [];
                tempMergeMethodsSpec[prop].push(mixinSpec[prop]);
              } else {
                tempMethodsSpec[prop] = tempMethodsSpec[prop] || [];
                tempMethodsSpec[prop].push(mixinSpec[prop]);
              }
            }
          }
        }
        for(var mergeMethod in tempMergeMethodsSpec){
          if(tempMergeMethodsSpec.hasOwnProperty(mergeMethod)){
            if(tempMergeMethodsSpec[mergeMethod].length === 1 && !(mergeMethod in this.originalSpec)){
              this.originalSpec[mergeMethod] = tempMergeMethodsSpec[mergeMethod][0];
            } else {
              if(mergeMethod in this.originalSpec){
                tempMergeMethodsSpec[mergeMethod].push(this.originalSpec[mergeMethod]);
              }
              this.originalSpec[mergeMethod] = createMergedResultFunction(tempMergeMethodsSpec[mergeMethod]);
            }
          }
        }
        for(var method in tempMethodsSpec){
          if(tempMethodsSpec.hasOwnProperty(method)){
            if(tempMethodsSpec[method].length === 1 && !(method in this.originalSpec)){
              //If there is only 1 method then just attach to originalSpec
              //This is used when the function returns something as the
              //createChainedFunction ignores the return value. So methods
              //that return a value must be unique;
              this.originalSpec[method] = tempMethodsSpec[method][0];
            } else {
              if(method in this.originalSpec){
                tempMethodsSpec[method].push(this.originalSpec[method]);
              }
              this.originalSpec[method] = createChainedFunction(tempMethodsSpec[method]);
            }
          }
        }
        //Then merge temp fields into originalSpec
        this.originalSpec = extend(this.originalSpec, tempFieldsSpec);
        delete this.originalSpec.mixins;
      }

      
      for(key in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(key)){
          if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
            //assume it is a descriptor and clone
            tempDesc[key] = extend(this.originalSpec[key]);
            if(!('enumerable' in tempDesc[key])){
              if(proto.constructor.classType === "Model" && key[0] === "_"){
                tempDesc[key].enumerable = false;
                clientFields = clientFields || [];
                clientFields.push(key);
                //place into statics list
              } else {
                tempDesc[key].enumerable = true;
              }
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
                aliases = aliases || {};
                aliases[tempDesc[key].aliasFor] = key;
                delete tempDesc[key].aliasFor;
              }

              if(proto.constructor.classType === "Model" && ('validate' in tempDesc[key]) && 
                Object.prototype.toString.call(tempDesc[key].validate) === '[object Object]'){
                //delete setter. just in case
                delete tempDesc[key].validate.set;
                descriptor[key + 'Valid'] = tempDesc[key].validate;
                validations = validations || [];
                validations.push(tempDesc[key].validate.get);
                delete tempDesc[key].validate;
              }

              if('kind' in tempDesc[key]){
                if(tempDesc[key].kind === 'pseudo'){
                  tempDesc[key].enumerable = false;
                } else if ((proto.constructor.classType === "ViewModel" && tempDesc[key].kind === 'instance') ||
                  tempDesc[key].kind === 'object' ||
                  tempDesc[key].kind === 'object:freeze' ||
                  tempDesc[key].kind === 'object:deepFreeze' ||
                  tempDesc[key].kind === 'array' ||
                  tempDesc[key].kind === 'array:freeze' ||
                  tempDesc[key].kind === 'array:deepFreeze') {
                  autoFreeze = autoFreeze || [];
                  autoFreeze.push({fieldName: key, kind: tempDesc[key].kind});
                  //There's no need for set statments for these kinds. Can only update via functions & setState.
                  //If the object needs to be updated then it should be a Model                  
                  delete tempDesc[key].set;
                } else if (proto.constructor.classType === "ControllerViewModel" && tempDesc[key].kind === 'static') {
                  statics = statics || {};
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

      if(proto.constructor.classType === "Model"){      
        //add allValid check
        if(validations !== void(0)){
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

        //add dirty field to models
        descriptor.dirty = {
          get: function() {
            return this.state.dirty === void(0) ? false : this.state.dirty;
          }
        };

        proto.clientFields = function(){
          return clientFields || [];
        };

      }

      this.originalSpec.__processedSpec__ = {
        descriptor: descriptor,
        proto: proto,
        originalSpec: this.originalSpec || {},
        freezeFields: autoFreeze,
        aliases: aliases,
        statics: statics,
        clientFields: clientFields,
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
