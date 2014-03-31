
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMDomainModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;

      var DataContext = function(initState, callback){
        return desc.proto.setState(initState, callback, true);
      }

      var dataContext = function(nextState, prevState, disableUndo, initialize) {
        var initFunc;
        var calcFld;
        nextState = nextState || {};
        prevState = prevState || {};

        if(!('getInitialState' in desc.proto)){
          desc.proto.getInitialState = function(){
            return DataContext();
          }
        } else {
          initFunc = desc.proto.getInitialState;
          desc.proto.getInitialState = function(){
            return DataContext(initFunc.call(this));
          }
        }
        
        var model = Object.create(desc.proto, desc.descriptor);
        
        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });
        //Need to have state prop in model before can extend model to get correct state
        nextState = extend(nextState, model);

        //runs everytime to initialize calculated state but will not run the calc func
        //if the prop has already been initialized
        if(!!desc.originalSpec.getInitialCalculatedState){
          for (var i = desc.calculatedFields.length - 1; i >= 0; i--) {
            if(!(desc.calculatedFields[i] in nextState) || nextState[desc.calculatedFields[i]] === void(0)){
              calcFld = {}
              calcFld[desc.calculatedFields[i]] = desc.originalSpec.getInitialCalculatedState.
                call(model, nextState, prevState)[desc.calculatedFields[i]];
              if(calcFld[desc.calculatedFields[i]] !== void(0)){
                nextState = extend(nextState,calcFld);                
              }
            }
          };
        }

        if(!initialize){
          //runs everytime after initialized
          if(desc.originalSpec.validateState){
            nextState = extend(nextState,
              desc.originalSpec.validateState.call(model, nextState, prevState));
          }
          if(!disableUndo && !!Object.keys(prevState).length){          
            Object.defineProperty(nextState, 'previousState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: prevState
            });
          }
        }

        Object.defineProperty(nextState, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: extend(nextState)
        });

        for(var k in desc.descriptor){
          if(desc.descriptor.hasOwnProperty(k)){
            Object.defineProperty(nextState, k, desc.descriptor[k]);
          }
        }

        nextState.__proto__ = model.__proto__;
        return nextState;
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMDomainModel;
