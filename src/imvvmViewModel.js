
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;

      var dataContext = function(nextState, dependencies, prevState) {

        prevState = prevState || {};
        //nextState has already been extended with prevState in core
        nextState = extend(nextState, dependencies);

        desc.proto.DataContext = dataContext;

        if(!('init' in desc.proto)){
          desc.proto.init = function(){
            return this.DataContext();
          }
        }
        
        var model = Object.create(desc.proto, desc.descriptor);

        if(desc.originalSpec.getInitialState){
          nextState = extend(nextState, desc.originalSpec.getInitialState.call(model, nextState, prevState));
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        Object.keys(model).forEach(function(key){
          if(Object.prototype.toString.call(this[key]) === '[object Object]' &&
            ('context' in this[key])){
            this[key].context = this; 
            Object.freeze(this[key]);
          }
          if(Object.prototype.toString.call(this[key]) === '[object Array]'){
            Object.freeze(this[key]);
          }
        }.bind(model));

        nextState.__proto__ = model.__proto__;
        return Object.freeze(nextState);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;
