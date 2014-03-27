'use strict';

var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      var dataContext = function(state, withContext, oldState) {
        var model = Object.create(desc.proto, desc.descriptor);
        var argCount = arguments.length;
        var lastIsBoolean = typeof Array.prototype.slice.call(arguments, -1)[0] === 'boolean';
        if(argCount === 1){
          if(lastIsBoolean){
            withContext = state;
            state = {};
          } else {
            //state = state || {};
            withContext = true;
          }
        } else if(argCount === 2){
          if(!lastIsBoolean){
            oldState = withContext;
            withContext = true;
          }
        } else if(argCount === 3){
          if(lastIsBoolean){
            var temp = withContext;
            withContext = oldState;
            oldState = temp;
          } 
        } else {
          state = {};
          withContext = true;
        }
        
        if(desc.originalSpec.getInitialState){
          state = extend(state, desc.originalSpec.getInitialState(state, oldState));
        }

        if(withContext){
          //This will self distruct
          Object.defineProperty(model, 'context', {
            configurable: true,
            enumerable: true,
            set: function(context){
              this.setState = raiseStateChangeHandler(context);
              delete this.context;
            }
          });
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: state
        });
        if(!withContext){
          Object.freeze(model);
        }
        return model;
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMModel;
