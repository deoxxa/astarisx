
var utils = require('./utils');
var extend = utils.extend;

var IMVVMViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      var dataContext = function(nextState, initialize) {

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
        for (fld = freezeFields.length - 1; fld >= 0; fld--) {
          if(freezeFields[fld].kind === 'instance'){
              if(viewModel[freezeFields[fld].fieldName]){
                tempDesc = viewModel[freezeFields[fld].fieldName].constructor.originalSpec.__processedSpec__;
                tempModel = Object.create(tempDesc.proto, tempDesc.descriptor);

                tempModel.__stateChangedHandler = (function(fld){
                  return viewModel[fld].__stateChangedHandler;
                })(freezeFields[fld].fieldName);

                Object.defineProperty(tempModel, 'state', {
                  configurable: true,
                  enumerable: false,
                  writable: true,
                  value: viewModel[freezeFields[fld].fieldName].state
                });

                tempModel.__proto__.setState = function(state, callback){ //callback may be useful for DB updates
                  this.__stateChangedHandler.call(viewModel, extend(this.state, state), callback);
                };

                Object.freeze(viewModel[freezeFields[fld].fieldName]);
              }

          } else {
            nextState[freezeFields[fld].fieldName] = nextState[freezeFields[fld].fieldName] || [];
            Object.freeze(nextState[freezeFields[fld].fieldName]);
          }
        };

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        return Object.freeze(viewModel);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;
