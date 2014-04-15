
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor(this);
      desc.stateChangedHandler = stateChangedHandler;
      desc.proto.__getDescriptor = function(){
        return desc;
      }

      var dataContext = function(nextState, initialize) {
        
        var freezeFields = desc.freezeFields,
          fld,
          model = Object.create(desc.proto, desc.descriptor);

        if(nextState === void(0)){
          initialize = true;
        }
        nextState = nextState || {};

        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        nextState = extend(nextState, model);
        
        if(initialize && ('getInitialState' in model)){
          if(!!nextState){
            for(var aliasFor in desc.aliases){
              if(desc.aliases.hasOwnProperty(aliasFor) && aliasFor in nextState){
                nextState[desc.aliases[aliasFor]] = nextState[aliasFor];
                delete nextState[aliasFor];
              }
            }
          }
          nextState = extend(nextState, model.getInitialState.call(model));
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and model instances
        for (fld = freezeFields.length - 1; fld >= 0; fld--) {
            Object.freeze(model[freezeFields[fld].fieldName]);
        };
        return Object.freeze(model);
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMModel;
