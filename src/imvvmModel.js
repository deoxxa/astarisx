
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      var dataContext = function(nextState, prevState, withContext) {
        var model = Object.create(desc.proto, desc.descriptor);
        var argCount = arguments.length;
        var lastIsBoolean = typeof Array.prototype.slice.call(arguments, -1)[0] === 'boolean';

        if(argCount === 1){
          if(lastIsBoolean){
            withContext = nextState;
            nextState = {};
            prevState = {};
          } else {
            withContext = true;
          }
        } else if(argCount === 2 && lastIsBoolean){
            if(lastIsBoolean){
              withContext = prevState;
              prevState = {};              
            } else {
              nextState = extend(prevState, nextState);
            }
        } else if(argCount === 3){
          nextState = extend(prevState, nextState);
        } else {
          //defaults
          nextState = {};
          prevState = {};
          withContext = true;
        }
        //Initialize any props
        if(desc.originalSpec.getInitialState){
          nextState = extend(nextState, desc.originalSpec.getInitialState(nextState, prevState));
        }

        if(withContext){
          //This will self distruct
          Object.defineProperty(model, 'context', {
            configurable: true,
            enumerable: true,
            set: function(context){
              this.setState = function(nextState, callback){ //callback may be useful for DB updates
                return raiseStateChangeHandler.bind(context)
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