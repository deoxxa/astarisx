
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
        //Need to have state prop in model before can extend model to get correct state
        //nextState = extend(model, nextState);
        
        //runs everytime to initialize calculated state but will not run the calc func
        //if the prop has already been initialized
        if(initialize && !!desc.originalSpec.getInitialState){
          nextState = extend(nextState, desc.originalSpec.getInitialState.call(model));
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

        Object.keys(model).forEach(function(key){
          if(Object.prototype.toString.call(this[key]) === '[object Object]' || 
            Object.prototype.toString.call(this[key]) === '[object Array]'){
            Object.freeze(this[key]);
          }
        }.bind(model));

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
