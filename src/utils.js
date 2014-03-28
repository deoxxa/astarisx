
var utils = {
  getDescriptor: function(){
    var descriptor = {};
    var proto = this.prototype;
    //var originalSpec = this.originalSpec || {};
    for(var key in this.originalSpec){
      if(this.originalSpec.hasOwnProperty(key)){
        if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
          //assume it is a descriptor
          if(!('enumerable' in this.originalSpec[key])){
            //default enumerable to true
            this.originalSpec[key].enumerable = true;
          }
          descriptor[key] = this.originalSpec[key];
        } else {
          proto[key] = this.originalSpec[key];
        }
      }
    }
    proto.extend = utils.extend;
    return { 
      descriptor: descriptor,
      proto: proto,
      originalSpec: this.originalSpec || {}
    }
  },
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
  mixInto: function(constructor, methodBag) {
    var methodName;
    for (methodName in methodBag) {
      if (!methodBag.hasOwnProperty(methodName)) {
        continue;
      }
      constructor.prototype[methodName] = methodBag[methodName];
    }
  }
};

module.exports = utils;