
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
        var lastArgIsBool = typeof Array.prototype.slice.call(arguments, -1)[0] === 'boolean';

        if(argCount === 0){
          //defaults
          nextState = {};
          prevState = {};
          withContext = true;
        } else if(argCount === 1){
          if(lastArgIsBool){
            withContext = nextState;
            nextState = {};
            prevState = {};
          } else {
            //assume prevState is same as nextState
            prevState = nextState;
            withContext = true;
          }
        } else if(argCount === 2){
          if(lastArgIsBool){
            withContext = prevState;
            prevState = nextState;              
          } else {
            withContext = true;
          }
        }

        //Initialize any props
        if(desc.originalSpec.getInitialState){
          nextState = extend(nextState, desc.originalSpec.getInitialState.call(model, nextState, ('state' in prevState) ? prevState.state : prevState));
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
