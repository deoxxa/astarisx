
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor(this);
      //desc.proto.__stateChangedHandler = stateChangedHandler;
      desc.stateChangedHandler = stateChangedHandler;
      desc.proto.__getDescriptor = function(){
        return desc;
      }
      var dataContext = function(nextState) {
        
        var freezeFields = desc.freezeFields;
        var model = Object.create(desc.proto, desc.descriptor);
        var initialize = false;

        nextState = nextState || {};
        if('state' in nextState){
          nextState = nextState.state;
        } else {
          initialize = true;
        }

        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize && ('getInitialState' in model)){
          nextState = extend(nextState, model.getInitialState.call(model));
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and model instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
            Object.freeze(model[freezeFields[i].fieldName]);
        };

        return Object.freeze(model);
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMModel;
