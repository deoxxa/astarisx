
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;
      
      var dataContext = function(nextState, dependencies, initialize) {
        
        //nextState has already been extended with prevState in core
        nextState = extend(nextState, dependencies);
        
        var freezeFields = desc.freezeFields;
        var viewModel = Object.create(desc.proto, desc.descriptor);
        var tempDesc = {};
        var propNames, tempModel;


        Object.defineProperty(viewModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize && ('getInitialState' in viewModel)){
          nextState = extend(nextState, viewModel.getInitialState.call(viewModel));          
        }

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and viewModel instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
          if(freezeFields[i].kind === 'instance'){
              propNames = Object.getOwnPropertyNames(viewModel[freezeFields[i].fieldName]);
              for (var j = propNames.length - 1; j >= 0; j--) {
                tempDesc[propNames[j]] = Object.getOwnPropertyDescriptor(viewModel[freezeFields[i].fieldName], propNames[j]);
              };

              tempModel = Object.create(viewModel[freezeFields[i].fieldName].__proto__, tempDesc);
              Object.defineProperty(tempModel, 'state', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: viewModel[freezeFields[i].fieldName].state
                });
              tempModel.__proto__.setState = function(nextState, callback){ //callback may be useful for DB updates
                  return this.__stateChangedHandler.bind(viewModel)
                    .call(viewModel, extend(this.state, nextState), this.state, callback);
              }.bind(tempModel);

              viewModel[freezeFields[i].fieldName] = Object.freeze(tempModel);

          } else {
            Object.freeze(viewModel[freezeFields[i].fieldName]);            
          }
        };

        //Add dependencies to viewModel
        for(var dep in dependencies){
          if(dependencies.hasOwnProperty(dep) && dep[0] !== '_'){
            Object.defineProperty(viewModel, dep, {
              configurable: false,
              enumerable: false,
              writable: false,
              value: dependencies[dep]
            });
          }
        }

        Object.freeze(nextState);
        return Object.freeze(viewModel);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;
