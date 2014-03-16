'use strict';

var IMVVM = IMVVM || {};

var IMVVMModelBase = function() {};
var IMVVMModelInterface = {
  raiseStateChanged: null,
  initialiseState: null
};

var uuid = function () {
  /*jshint bitwise:false */
  var i, random;
  var uuid = '';

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
      .toString(16);
  }

  return uuid;
};

var extend = function () {
  var newObj = {};
  for (var i = 0; i < arguments.length; i++) {
    var obj = arguments[i];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
};

var mixInto = function(constructor, methodBag) {
  var methodName;
  for (methodName in methodBag) {
    if (!methodBag.hasOwnProperty(methodName)) {
      continue;
    }
    constructor.prototype[methodName] = methodBag[methodName];
  }
};

var IMVVMModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var key, descriptor = {};
      for(key in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(key)){
          if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
            //assume it is a descriptor
            descriptor[key] = this.originalSpec[key];
          } else {
            this.prototype[key] = this.originalSpec[key];
          }
        }
      }

      return function(state, withContext) {  
        if(typeof state === 'boolean'){
          withContext = state;
          state = {};
        } else {
          state = state || {};
          //When creating an Object, withContext default is true
          withContext = withContext === void 0 ? true : withContext;
        }

        state = extend(state, this.originalSpec.initialiseState(state));

        var model = Object.create(this.prototype, descriptor);

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: state
        });
        
        if(withContext){
          //This will self distruct
          Object.defineProperty(model, 'context', {
            configurable: true,
            enumerable: true,
            set: function(context){
              this.raiseStateChanged = raiseStateChangeHandler(context);
              delete this.context;
            }
          });
        }
        return model;
      }.bind(this);
    }
  }
};

mixInto(IMVVMModelBase, IMVVMModel.Mixin);

var IMVVMCreateModel = {
  createModel: function(spec){
    var Constructor = function(){};
    Constructor.prototype = new IMVVMModelBase();

    Constructor.prototype.constructor = Constructor;

    var DescriptorConstructor = Constructor;

    var ConvenienceConstructor = function(raiseStateChangeHandler) {
      var descriptor = new DescriptorConstructor();
      return descriptor.construct.apply(ConvenienceConstructor, arguments);;
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

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in IMVVMModelInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }
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

IMVVM.createModel = IMVVMCreateModel.createModel;

