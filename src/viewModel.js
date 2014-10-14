var utils = require('./utils');
var extend = utils.extend;
var isObject = utils.isObject;
var freeze = utils.freeze;
var deepFreeze = utils.deepFreeze;

var ViewModel = {

  Mixin: {
    construct: function(stateChangeHandler){

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangeHandler;

      var ViewModelClass = function(nextState, initialize) {

        //nextState has already been extended with prevState in core
        nextState = nextState || {};
        nextState = ('state' in nextState ? nextState.state : nextState);

        var freezeFields = desc.freezeFields,
          fld,
          viewModel = Object.create(desc.proto, desc.descriptor),
          tempDesc,
          tempModel;

        Object.defineProperty(viewModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize){
          nextState = ('getInitialState' in desc.originalSpec) ?
            extend(nextState, desc.originalSpec.getInitialState.call(viewModel)) : nextState;

          Object.defineProperty(viewModel, 'state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });
        }

        //freeze arrays and viewModel instances
        if(freezeFields !== void(0)){
          for (fld = freezeFields.length - 1; fld >= 0; fld--) {
            if(freezeFields[fld].kind === 'instance'){
                if(viewModel[freezeFields[fld].fieldName]){
                  tempDesc = viewModel[freezeFields[fld].fieldName].constructor.originalSpec.__processedSpec__;
                  tempModel = Object.create(tempDesc.proto, tempDesc.descriptor);

                  Object.defineProperty(tempModel, '__stateChangeHandler', {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: (function(fld){
                      return viewModel[fld].__stateChangeHandler;
                    })(freezeFields[fld].fieldName)
                  });

                  Object.defineProperty(tempModel, 'state', {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: viewModel[freezeFields[fld].fieldName].state
                  });

                  Object.getPrototypeOf(tempModel).setState = function(state, callback){ //callback may be useful for DB updates
                    var clientFields = { dirty: true };
                    if(tempDesc.clientFields !== void(0)){
                      for (var cf = tempDesc.clientFields.length - 1; cf >= 0; cf--) {
                        clientFields[tempDesc.clientFields[cf]] = this[tempDesc.clientFields[cf]];
                      };
                    }
                    callback = callback ? callback.bind(this) : void(0);
                    this.__stateChangeHandler.call(viewModel, extend(this.state, clientFields, state), callback);
                  };

                  Object.freeze(viewModel[freezeFields[fld].fieldName]);
                }
            } else if(freezeFields[fld].kind === 'object' || freezeFields[fld].kind === 'pseudoObject'){
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
            } else {
              //Must be kind:'array*'
              //initialize array if necessary
              nextState[freezeFields[fld].fieldName] = nextState[freezeFields[fld].fieldName] || [];
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

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        return Object.freeze(viewModel);
      };

      desc.proto.dispose = function(){
        return ViewModelClass(void(0));
      };

      return ViewModelClass;
    }
  }
};

module.exports = ViewModel;
