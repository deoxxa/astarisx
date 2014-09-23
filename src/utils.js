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
  }
  
};

module.exports = utils;