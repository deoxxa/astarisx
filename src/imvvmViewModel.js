
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      var dataContext = function(VMName, appState) {

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

        if(appState[VMName] === void(0)){
          if('getInitialState' in viewModel){
            nextState = extend(nextState, viewModel.getInitialState.call(viewModel));          
          }
        } else {
          nextState = ('state' in appState[VMName] ? appState[VMName].state : appState[VMName]);
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
                tempDesc = viewModel[freezeFields[fld].fieldName].__getDescriptor();
                tempModel = Object.create(tempDesc.proto, tempDesc.descriptor);

                Object.defineProperty(tempModel, 'state', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: viewModel[freezeFields[fld].fieldName].state
                });

                tempModel.__proto__.setState = function(someState, callback){ //callback may be useful for DB updates
                    return tempDesc.stateChangedHandler.call(this,
                      extend(tempModel.state, someState), tempModel.state, callback);
                }.bind(viewModel);

                Object.freeze(viewModel[freezeFields[fld].fieldName]);
              }

          } else {
            Object.freeze(viewModel[freezeFields[fld].fieldName]);
          }
        };
        
        return Object.freeze(viewModel);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;
