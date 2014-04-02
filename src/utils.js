
var utils = {
  getDescriptor: function(){
    var descriptor = {};
    var proto = this.prototype;
    var calcFlds = [];

    //var originalSpec = this.originalSpec || {};
    for(var key in this.originalSpec){
      if(this.originalSpec.hasOwnProperty(key)){
        if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
          //assume it is a descriptor
          if('calculated' in this.originalSpec[key]){
            //We want to preserve the calculated flag on originalSpec
            descriptor[key] = utils.extend(this.originalSpec[key]);
            descriptor[key].enumerable = this.originalSpec[key].calculated;
            delete descriptor[key].calculated;
            calcFlds.push(key);
          } else if(!('enumerable' in this.originalSpec[key])){
            //No need to preserve the pseudo flag on originalSpec
            if('pseudo' in this.originalSpec[key]){
              this.originalSpec[key].enumerable = !this.originalSpec[key].pseudo;
              delete this.originalSpec[key].pseudo;
            } else {
              //default enumerable to true
              this.originalSpec[key].enumerable = true;
            }
            descriptor[key] = this.originalSpec[key];
          } else {
            descriptor[key] = this.originalSpec[key];            
          }
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
      calculatedFields: calcFlds
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