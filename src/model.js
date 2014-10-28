
var utils = require('./utils');
var extend = utils.extend;
var isObject = utils.isObject;
var isArray = utils.isArray;
var freeze = utils.freeze;
var deepFreeze = utils.deepFreeze;

var Model = {
  Mixin: {
    construct: function(stateChangeHandler){

      var desc = this.getDescriptor();

      var ModelClass = function(nextState, extendState) {
        var freezeFields = desc.freezeFields,
          fld,
          model = Object.create(desc.proto, desc.descriptor);

        nextState = extend(nextState, extendState);

        // Object.defineProperty(model, '_state', {
        //   configurable: true,
        //   enumerable: false,
        //   writable: true,
        //   value: nextState
        // });

        // nextState = extend(nextState, model);

        if(desc.aliases !== void(0)){
          for(var aliasFor in desc.aliases){
            if(desc.aliases.hasOwnProperty(aliasFor) && (aliasFor in nextState)){
              nextState[desc.aliases[aliasFor]] = nextState[aliasFor];
              delete nextState[aliasFor];
            }
          }
        }

        Object.defineProperty(model, '_state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        // nextState = extend(nextState, model);

        if('getInitialState' in desc.originalSpec){
          nextState = extend(nextState, desc.originalSpec.getInitialState.call(model));
        }

        //freeze arrays and model objects and initialize if necessary
        if(freezeFields !== void(0)){
          for (fld = freezeFields.length - 1; fld >= 0; fld--) {
            if(freezeFields[fld].kind === 'object' || freezeFields[fld].kind === 'pseudoObject'){
              //Only freeze root object
              if(isObject(nextState[freezeFields[fld].fieldName])){
                Object.freeze(nextState[freezeFields[fld].fieldName]);
              }
            } else if(freezeFields[fld].kind === 'object:freeze' || freezeFields[fld].kind === 'pseudoObject:freeze'){
              //shallow freeze all objects and arrays one level down
              freeze(nextState[freezeFields[fld].fieldName]);
            } else if(freezeFields[fld].kind === 'object:deepFreeze' || freezeFields[fld].kind === 'pseudoObject:deepFreeze'){
              //freeze all objects and arrays traversing arrays for objects and arrays
              deepFreeze(nextState[freezeFields[fld].fieldName]);
            } else if(freezeFields[fld].kind !== 'instance'){
              //Must be kind:'array*'
              //initialize array if necessary
              if(!isArray(nextState[freezeFields[fld].fieldName])){
                nextState[freezeFields[fld].fieldName] = [];
              }
              if(freezeFields[fld].kind === 'array:freeze' || freezeFields[fld].kind === 'pseudoArray:freeze'){
                //shallow freeze all objects and arrays in array
                freeze(nextState[freezeFields[fld].fieldName]);
              } else if(freezeFields[fld].kind === 'array:deepFreeze' || freezeFields[fld].kind === 'pseudoArray:deepFreeze'){
                //freeze all objects and arrays in array traversing arrays and objects for arrays and objects
                deepFreeze(nextState[freezeFields[fld].fieldName]);
              } else {
                //freezeFields[fld].kind === 'array' || freezeFields[fld].kind === 'pseudoArray'
                Object.freeze(nextState[freezeFields[fld].fieldName]);
              }
            }
          };
        }

        Object.defineProperty(model, '_state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        if(stateChangeHandler){
          Object.defineProperty(model, '__stateChangeHandler', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: (function(){
              return stateChangeHandler;
            })()
          });
        }

        return Object.freeze(model);
      };
      return ModelClass;
    }
  }
};

module.exports = Model;