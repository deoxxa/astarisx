var toString = Object.prototype.toString;
var utils = {
  
  extend: function () {
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
  },

  updateStatic: function () {
    var newObj = {};
    Object.defineProperty(newObj, '_onlyStatic', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: true
    });
    Object.defineProperty(newObj, '_staticUpdated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    });
    for (var i = 0; i < arguments.length; i++) {
      var obj = arguments[i];
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && key in arguments[0]) {
          if(key in arguments[0]){
            newObj[key] = obj[key];
            if(i > 0){
              newObj._staticUpdated = true;
            }
          } else {
            newObj._onlyStatic = false;
          }
        }
      }
    }
    return newObj;
  },

  mixInto: function(constructor, methodBag) {
    var methodName;
    for (methodName in methodBag) {
      if (!methodBag.hasOwnProperty(methodName)) {
        continue;
      }
      constructor.prototype[methodName] = methodBag[methodName];
    }
  },

  uuid: function () {
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
  },
  isObject: function(o) {
    return toString.call(o) === '[object Object]';
  },
  isArray: function (o) {
    return toString.call(o) === '[object Array]';
  },
  isModel: function (o) {
    return Object.getPrototypeOf(o).constructor.classType === "Model";
  },
  isViewModel: function (o) {
    return Object.getPrototypeOf(o).constructor.classType === "ViewModel";
  },
  isControllerViewModel: function (o) {
    return Object.getPrototypeOf(o).constructor.classType === "ControllerViewModel";
  },
  freeze: function(o) {
    if(utils.isObject(o)){
      Object.freeze(o);
      for (var k in o) {
        if(o.hasOwnProperty(k)){
          if(utils.isArray(o[k]) || utils.isObject(o[k])){
            Object.freeze(o[k]);
          }          
        }
      }
    } else if(utils.isArray(o)){
      for (var i = o.length - 1; i >= 0; i--) {
        if(utils.isArray(o[i]) || utils.isObject(o[i])){
          Object.freeze(o[i]);
        }
      };
    }
  },
  deepFreeze: function(o) {
    if(utils.isObject(o)){
      Object.freeze(o);
      for (var k in o) {
        if(o.hasOwnProperty(k)){
          if(utils.isArray(o[k]) || utils.isObject(o[k])){
            deepFreeze(Object.freeze(o[k]));
          }          
        }
      }
    } else if(utils.isArray(o)){
      for (var i = o.length - 1; i >= 0; i--) {
        if(utils.isArray(o[i]) || utils.isObject(o[i])){
          deepFreeze(Object.freeze(o[i]));
        }
      };
    }
  }  
};

module.exports = utils;