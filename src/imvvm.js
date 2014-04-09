
var model = require('./imvvmModel');
var viewModel = require('./imvvmViewModel');
var domainModel = require('./imvvmDomainModel');
var mixin = require('./mixin');

var utils = require('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;

var ModelBase = function(){};
var ViewModelBase = function(){};
var DomainModelBase = function(){};

mixInto(ModelBase, model.Mixin);
mixInto(ViewModelBase, viewModel.Mixin);
mixInto(DomainModelBase, domainModel.Mixin);

var IMVVMClass = {
  createClass: function(ctor, classType, spec){

    var Constructor = function(){};
    Constructor.prototype = new ctor();      
    Constructor.prototype.constructor = Constructor;

    var DescriptorConstructor = Constructor;

    var ConvenienceConstructor = function(stateChangedHandler) {
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
      var descriptor = {};
      var proto = this.prototype;
      //var uid;
      var autoFreeze = [];

      if('__processedObject__' in this.originalSpec){
        return this.originalSpec.__processedObject__;
      }

      for(var key in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(key)){
          if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
            //assume it is a descriptor
            this.originalSpec[key].enumerable = true;
            if('kind' in this.originalSpec[key]){
              if(this.originalSpec[key].kind === 'pseudo'){
                this.originalSpec[key].enumerable = false;
              // } else if(this.originalSpec[key].kind === 'uid'){
              //   uid = key;
              } else { //'instance' || 'array'
                autoFreeze.push({fieldName: key, kind: this.originalSpec[key].kind});
              }
              delete this.originalSpec[key].kind;
            }
            descriptor[key] = this.originalSpec[key];
          } else {
            proto[key] = this.originalSpec[key];
          }
        }
      }
      if(!('extend' in proto)){
        proto.extend = utils.extend;      
      }

      this.originalSpec.__processedObject__ = { 
        descriptor: descriptor,
        proto: proto,
        originalSpec: this.originalSpec || {},
        freezeFields: autoFreeze,
        // uid: uid
      };

      return this.originalSpec.__processedObject__;
    };

/*    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in IMVVMInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }
*/

    /*
    if (__DEV__) {
      // In DEV the convenience constructor generates a proxy to another
      // instance around it to warn about access to properties on the
      // descriptor.
      DescriptorConstructor = createDescriptorProxy(Constructor);
    }*/

    return ConvenienceConstructor;
  },
};

var IMVVM = {
  createModel: IMVVMClass.createClass.bind(this, ModelBase, 'Model'),
  createViewModel: IMVVMClass.createClass.bind(this, ViewModelBase, 'ViewModel'),
  createDomainModel: IMVVMClass.createClass.bind(this, DomainModelBase, 'DomainModel'),
  mixin: mixin
};

module.exports = IMVVM;
