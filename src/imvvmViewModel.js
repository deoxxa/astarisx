
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      var dataContext = function(VMName, appState, initialize) {

        //nextState has already been extended with prevState in core
        var nextState = {};
        nextState[VMName] = {};
        if(VMName in appState){
          nextState = ('state' in appState[VMName]) ? appState[VMName].state : appState[VMName];
        }
        var freezeFields = desc.freezeFields;
        var viewModel = Object.create(desc.proto, desc.descriptor);
        var tempDesc,
          tempModel;
        
        // if(nextState.state){
        //   nextState = extend(nextState.state, nextState);
        // }
        
        Object.defineProperty(viewModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });
        
        if(initialize && ('getInitialState' in viewModel)){
          nextState = extend(nextState, viewModel.getInitialState.call(viewModel));          
        }

        Object.defineProperty(nextState, '$', {
          configurable: true,
          enumerable: false,
          writable: false,
          value: appState
        });

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and viewModel instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
          if(freezeFields[i].kind === 'instance'){
              if(viewModel[freezeFields[i].fieldName]){
                tempDesc = viewModel[freezeFields[i].fieldName].__getDescriptor();
                tempModel = Object.create(tempDesc.proto, tempDesc.descriptor);

                Object.defineProperty(tempModel, 'state', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: viewModel[freezeFields[i].fieldName].state
                });
                
                tempModel.__proto__.setState = function(nextState, callback){ //callback may be useful for DB updates
                    return tempDesc.stateChangedHandler
                      .call(this, extend(tempModel.state, nextState), tempModel.state, callback);
                }.bind(viewModel);                
                Object.freeze(viewModel[freezeFields[i].fieldName]);
              }

          } else {
            Object.freeze(viewModel[freezeFields[i].fieldName]);
          }
        };
        
        return Object.freeze(viewModel);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;
