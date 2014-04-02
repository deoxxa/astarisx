
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMDomainModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;

      var dataContext = function(nextState, prevState, disableUndo, initialize) {
        var model = Object.create(desc.proto, desc.descriptor);

        nextState = nextState || {};
        
        if(!disableUndo && !!prevState){
          //if(!disableUndo && !!Object.keys(prevState).length){       
          Object.defineProperty(model, 'previousState', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: prevState
          });
          //}
        }
        prevState = prevState || {};

        if(initialize && ('getInitialState' in desc.proto)){
          //Add state prop so that it can be referenced from within getInitialState
          Object.defineProperty(model, 'state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });
          nextState = extend(nextState, desc.proto.getInitialState.call(model));
        }
        //attach the nextState props to model if the don't exist
        var keys = Object.keys(nextState);
        for (var i = keys.length - 1; i >= 0; i--) {
          if(!(keys[i] in model)){
            model[keys[i]] = nextState[keys[i]];
          }
        };



        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });
        return model;
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMDomainModel;
