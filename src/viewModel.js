var utils = require('./utils');
var extend = utils.extend;
var isObject = utils.isObject;
var isModel = utils.isModel;
var isArray = utils.isArray;
var freeze = utils.freeze;
var deepFreeze = utils.deepFreeze;

var ViewModel = {

  Mixin: {
    construct: function(stateChangeHandler){

      var desc = this.getDescriptor();
      desc.proto.setState = stateChangeHandler;

      var ViewModelClass = function(nextState, initialize) {

        //nextState has already been extended with prevState in core
        nextState = nextState || {};
        nextState = ('$state' in nextState ? nextState.$state : nextState);

        var freezeFields = desc.freezeFields,
          fld,
          viewModel = Object.create(desc.proto, desc.descriptor),
          tempSpec,
          tempDesc,
          tempModel;

        Object.defineProperty(viewModel, '$state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize){
          nextState = ('getInitialState' in desc.originalSpec) ?
            extend(nextState, desc.originalSpec.getInitialState.call(viewModel)) : nextState;

          Object.defineProperty(viewModel, '$state', {
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
              if(isModel(viewModel[freezeFields[fld].fieldName])){
                tempSpec = viewModel[freezeFields[fld].fieldName].constructor.getDescriptor();
                tempModel = Object.create(tempSpec.proto, tempSpec.descriptor);

                Object.defineProperty(tempModel, '_$stateChangeHandler', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: (function(fld){
                    return viewModel[fld]._$stateChangeHandler;
                  })(freezeFields[fld].fieldName)
                });
                
                Object.defineProperty(tempModel, '$state', {
                  configurable: true,
                  enumerable: false,
                  writable: true,
                  value: viewModel[freezeFields[fld].fieldName].$state
                });

                Object.getPrototypeOf(tempModel).setState = function(state, appState, callback){ //callback may be useful for DB updates
                  var clientFields = {};
                  if(typeof appState === 'function'){
                    callback = appState;
                    appState = void(0);
                  } else if(typeof state === 'function'){
                    callback = state;
                    state = void(0);
                    appState = void(0);
                  }

                  if(state !== void(0) && !!Object.keys(state).length){
                     clientFields.$dirty = true;
                  } else {
                    clientFields.$dirty = tempModel.$dirty;
                  }

                  if(tempSpec.clientFields !== void(0)){
                    for (var cf = tempSpec.clientFields.length - 1; cf >= 0; cf--) {
                      clientFields[tempSpec.clientFields[cf]] = this[tempSpec.clientFields[cf]];
                    };
                  }
                  callback = callback ? callback.bind(this) : void(0);
                  this._$stateChangeHandler.call(viewModel, extend(this.$state, clientFields, state), appState, callback);
                };

                if(!!tempSpec.freezeFields && !!tempSpec.freezeFields.length){
                  for (var i = tempSpec.freezeFields.length - 1; i >= 0; i--) {
                    if(tempSpec.freezeFields[i].kind === 'instance' 
                      && isModel(viewModel[freezeFields[fld].fieldName][tempSpec.freezeFields[i].fieldName])){
                      var tempSpec2 = viewModel[freezeFields[fld].fieldName][tempSpec.freezeFields[i].fieldName].constructor.getDescriptor();
                      var tempModel2 = Object.create(tempSpec2.proto, tempSpec2.descriptor);
                      
                      Object.defineProperty(tempModel2, '_$stateChangeHandler', {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: tempModel._$stateChangeHandler
                      });

                      Object.defineProperty(tempModel2, '$state', {
                        configurable: true,
                        enumerable: false,
                        writable: true,
                        value: tempModel[tempSpec.freezeFields[i].fieldName].$state
                      });

                      Object.getPrototypeOf(tempModel2).setState = (function(fldName){
                        return function(state, appState, callback){ //callback may be useful for DB updates
                          var clientFields2 = {};
                          var thisState = {};
                          fldName = ('$owner' in this.$state) ? this.$state.$owner : fldName;

                          if(typeof appState === 'function'){
                            callback = appState;
                            appState = void(0);
                          } else if(typeof state === 'function'){
                            callback = state;
                            state = void(0);
                            appState = void(0);
                          }

                          if(state !== void(0) && !!Object.keys(state).length){
                            clientFields2.$dirty = true;
                          } else {
                            clientFields2.$dirty = tempModel2.$dirty;
                          }

                          if(tempSpec2.clientFields !== void(0)){
                            for (var cf = tempSpec2.clientFields.length - 1; cf >= 0; cf--) {
                              clientFields2[tempSpec2.clientFields[cf]] = this[tempSpec2.clientFields[cf]];
                            };
                          }
                          thisState[fldName] = extend(this.$state, clientFields2, state);
                          callback = callback ? callback.bind(this) : void(0);
                          tempModel._$stateChangeHandler.call(viewModel, extend(tempModel, thisState, {$dirty: true}), appState, callback);
                        };
                      })(tempSpec.freezeFields[i].fieldName);
                      Object.freeze(viewModel[freezeFields[fld].fieldName][tempSpec.freezeFields[i].fieldName]);
                    }
                  };
                }
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

        Object.defineProperty(viewModel, '$state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });
        
        return Object.freeze(viewModel);
      };

      desc.proto.__dispose = function(){
        return ViewModelClass(void(0));
      };

      return ViewModelClass;
    }
  }
};

module.exports = ViewModel;