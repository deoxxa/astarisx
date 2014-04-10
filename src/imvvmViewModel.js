
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      var dataContext = function(VMName, appState, prevState, subscribers) {

        //nextState has already been extended with prevState in core
        var nextState = {};
        var freezeFields = desc.freezeFields;
        var viewModel = Object.create(desc.proto, desc.descriptor);
        var tempDesc,
          tempModel;
        //var prevState = extend(appState);

        var hasLinks = ('linkTo' in desc.proto);

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
          if('state' in appState[VMName]){
            console.log("SOME STATE HERE!!!!");
          }
          nextState = ('state' in appState[VMName] ? appState[VMName].state : appState[VMName]);
          
          Object.defineProperty(viewModel, 'state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });

          if(subscribers){
            subscribers.forEach(function(subscriber){
              appState[subscriber].state[appState[subscriber].linkTo[VMName]] = viewModel;
              if('onWatchedStateChanged' in appState[subscriber]){

                if(hasLinks){
                  for(var k in desc.proto.linkTo){
                    if(desc.proto.linkTo.hasOwnProperty(k)){
                      nextState[desc.proto.linkTo[k]] = appState[k];
                    }
                  }
                }


                var tmp = appState[subscriber].onWatchedStateChanged(extend(nextState), prevState, VMName);
                var tmp2 =  extend(appState[subscriber].state, tmp);
                for(var updKey in tmp2){
                  if(tmp2.hasOwnProperty(updKey)){
                    appState[subscriber].state[updKey] = tmp2[updKey];    
                  }
                }
                
                // extend(appState[subscriber].state,
                //   appState[subscriber].onWatchedStateChanged(nextState, prevState, VMName));
              }
            });            
          }

          if(hasLinks){
            for(var k in desc.proto.linkTo){
              if(desc.proto.linkTo.hasOwnProperty(k)){
                nextState[desc.proto.linkTo[k]] = appState[k];
              }
            }
          }
        }

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });


        // appState.frank = 'test';


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
