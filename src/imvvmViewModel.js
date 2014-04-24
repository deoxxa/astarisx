
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      var dataContext = function(nextVMState) {

        //nextState has already been extended with prevState in core
        var nextState = {},
          freezeFields = desc.freezeFields,
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

        if(nextVMState === void(0)){
          nextState = ('getInitialState' in viewModel) ?
            extend(nextState, viewModel.getInitialState.call(viewModel)) : nextState;
            delete viewModel.__proto__.getInitialState;
        } else {
          nextState = ('state' in nextVMState ? nextVMState.state : nextVMState);
        }

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and viewModel instances
        for (fld = freezeFields.length - 1; fld >= 0; fld--) {
          if(freezeFields[fld].kind === 'instance'){
              if(viewModel[freezeFields[fld].fieldName]){
                tempDesc = viewModel[freezeFields[fld].fieldName].constructor.originalSpec.__processedSpec__;
                tempModel = Object.create(tempDesc.proto, tempDesc.descriptor);
                delete tempModel.__proto__.getInitialState;
                
                Object.defineProperty(tempModel, 'state', {
                  configurable: true,
                  enumerable: false,
                  writable: true,
                  value: viewModel[freezeFields[fld].fieldName].state
                });

                tempModel.__proto__.setState = function(someState, callback){ //callback may be useful for DB updates
                    return tempDesc.stateChangedHandler.call(this,
                      extend(tempModel.state, someState), tempModel.state, callback);
                }.bind(viewModel);

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
