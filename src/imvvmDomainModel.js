
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMDomainModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;

      var dataContext = function(nextState, previousState, disableUndo, initialize) {
        nextState = nextState || {};
        previousState = previousState || {};

        if(!('DataContext' in desc.proto)){
          desc.proto.DataContext = function(initState, callback){
            return desc.proto.setState(initState, callback, true);
          }
        }

        if(!('init' in desc.proto)){
          desc.proto.init = function(){
            return this.DataContext();
          }
        }
        
        var model = Object.create(desc.proto, desc.descriptor);

        if(desc.originalSpec.getInitialState){          //NEED to check -vv
          nextState = extend(nextState, desc.originalSpec.getInitialState.call(model, nextState, previousState));
        }

        if(!initialize && !disableUndo){          
          Object.defineProperty(model, 'previousState', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: previousState
          });
        }

        //TODO - rework this, as __proto__ is deprecated
        nextState.__proto__ = model.__proto__;

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });
        return model;
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMDomainModel;
