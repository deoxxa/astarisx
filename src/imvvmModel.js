
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = getDescriptor.call(this);
      
      var dataContext = function(nextState, prevState, withContext) {
        
        var freezeFields = desc.freezeFields;
        var model = Object.create(desc.proto, desc.descriptor);
        var argCount = arguments.length;
        var lastArgIsBool = typeof Array.prototype.slice.call(arguments, -1)[0] === 'boolean';
        var initialize = false;

        if(argCount === 0){
          //defaults
          nextState = {};
          prevState = {};
          withContext = false;
        } else if(argCount === 1){
          if(lastArgIsBool){
            withContext = nextState;
            nextState = {};
            prevState = {};
          } else {
            //assume this is a new Object and there is no prevState
            prevState = {};
            withContext = false;
            initialize = true;
          }
        } else if(argCount === 2){
          if(lastArgIsBool){
            //assume this is a new Object and there is no prevState
            withContext = prevState;
            prevState = {};
            initialize = true;
          } else {
            withContext = false;
          }
        }
        
        nextState = ('state' in nextState) ? nextState.state : nextState;
        prevState = ('state' in prevState) ? prevState.state : prevState;

        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize && ('getInitialState' in model)){
          nextState = extend(nextState, model.getInitialState.call(model));
        }

        if(withContext){
          //This will self distruct
          Object.defineProperty(model, 'context', {
            configurable: true,
            enumerable: false,
            set: function(context){
              this.setState = function(nextState, callback){ //callback may be useful for DB updates
                return stateChangedHandler.bind(context)
                  .call(context, extend(this.state, nextState), this.state, callback);
              }.bind(this);
              delete this.context;
            }
          });
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and model instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
            Object.freeze(model[freezeFields[i].fieldName]);
        };

        if(!withContext){
          Object.freeze(model);
        }

        return model;
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMModel;
