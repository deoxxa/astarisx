
var utils = {
  getDescriptor: function(){
    var descriptor = {};
    var proto = this.prototype;
    var autoFreeze = [];

    //var originalSpec = this.originalSpec || {};
    for(var key in this.originalSpec){
      if(this.originalSpec.hasOwnProperty(key)){
        if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
          //assume it is a descriptor
          //set enumerable to true
          this.originalSpec[key].enumerable = true;
          if('kind' in this.originalSpec[key]){
            //No need to preserve the 'pseudo' fields
            if(this.originalSpec[key].kind === 'pseudo'){
              this.originalSpec[key].enumerable = false;
            } else { //then it must be 'instance' || 'array'
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
    return { 
      descriptor: descriptor,
      proto: proto,
      originalSpec: this.originalSpec || {},
      freezeFields: autoFreeze
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