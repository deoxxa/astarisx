
var utils = require('./utils');
var extend = utils.extend;

var model = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor();

      var dataContext = function(nextState, extendState, initialize) {
        var freezeFields = desc.freezeFields,
          fld,
          model = Object.create(desc.proto, desc.descriptor);

        if(nextState === void(0)){
          initialize = true;
        } else if(typeof nextState === 'boolean'){
          initialize = nextState;
          nextState = void(0);
        } else if(typeof extendState === 'boolean'){
          initialize = extendState;
          extendState = void(0);
        }
        nextState = extend(nextState, extendState);

        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        nextState = extend(nextState, model);

        if(initialize){
          for(var aliasFor in desc.aliases){
            if(desc.aliases.hasOwnProperty(aliasFor) && aliasFor in nextState){
              nextState[desc.aliases[aliasFor]] = nextState[aliasFor];
              delete nextState[aliasFor];
            }
          }

          Object.defineProperty(model, 'state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });

          nextState = extend(nextState, model);

          if('getInitialState' in desc.originalSpec){
            nextState = extend(nextState, desc.originalSpec.getInitialState.call(model));
          }
        }

        //freeze arrays and model instances and initialize if necessary
        for (fld = freezeFields.length - 1; fld >= 0; fld--) {
          if(freezeFields[fld].kind === 'array'){
            nextState[freezeFields[fld].fieldName] = nextState[freezeFields[fld].fieldName] || [];
            Object.freeze(nextState[freezeFields[fld].fieldName]);
          } else {
            throw new TypeError('kind:"instance" can only be specified in a ViewModel.');
          }
        };

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        model.__stateChangedHandler = (function(){
            return stateChangedHandler;
        })();

        return Object.freeze(model);
      };
      return dataContext;
    }
  }
};

module.exports = model;
