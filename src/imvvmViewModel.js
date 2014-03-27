'use strict';

var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;

      var dataContext = function(state, dependencies, oldState) {

        state = state || {};
        state = extend(state, dependencies);

        if(desc.originalSpec.getInitialState){
          state = extend(state, desc.originalSpec.getInitialState(state, oldState));
        }
      
        desc.proto.DataContext = dataContext;

        if(!('init' in desc.proto)){
          desc.proto.init = function(){
            return this.DataContext();
          }
        }
        
        var model = Object.create(desc.proto, desc.descriptor);

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: state
        });

        Object.keys(model).map(function(key){
          if(Object.prototype.toString.call(this[key]) === '[object Object]' &&
            ('context' in this[key])){
            this[key].context = this; 
            Object.freeze(this[key]);
          }
          if(Object.prototype.toString.call(this[key]) === '[object Array]'){
            Object.freeze(this[key]);
          }
        }.bind(model));

        state.__proto__ = model.__proto__;
        return Object.freeze(state);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;
