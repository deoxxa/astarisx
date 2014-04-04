
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = getDescriptor.call(this);
      desc.proto.setState = stateChangedHandler;
      
      var dataContext = function(nextState, dependencies, prevState, initialize) {
        
        //nextState has already been extended with prevState in core
        nextState = extend(nextState, dependencies);
        prevState = prevState || {};
        prevState = ('state' in prevState) ? prevState.state : prevState;
        
        var freezeFields = desc.freezeFields;
        var viewModel = Object.create(desc.proto, desc.descriptor);

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
          if(freezeFields[i].kind === 'instance' &&
              ('context' in viewModel[freezeFields[i].fieldName])){
            viewModel[freezeFields[i].fieldName].context = viewModel; 
          }
          Object.freeze(viewModel[freezeFields[i].fieldName]);
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
