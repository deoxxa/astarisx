
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;
      var count = 0;
      var dataContext = function(nextState, dependencies, prevState, initialize) {
        var initFunc;
        var calcFld;
        console.log('COUNT - ' + ++count);
        //nextState has already been extended with prevState in core
        nextState = extend(nextState, dependencies);
        prevState = prevState || {};
        prevState = ('state' in prevState) ? prevState.state : prevState;

        // if(!('getInitialState' in desc.proto)){
        //   desc.proto.getInitialState = function(){
        //     return dataContext();//.apply(this, arguments);
        //   }
        // } else {
        
        var model = Object.create(desc.proto, desc.descriptor);

        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });
        //Need to have state prop in model before can extend model to get correct state
        nextState = extend(nextState, model);

        if(initialize){
          if(desc.proto.getInitialState){
            nextState = extend(nextState, desc.proto.getInitialState());          
          }
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
        }

        //runs everytime
        if(desc.originalSpec.getValidState){
          nextState = extend(nextState,
            desc.originalSpec.getValidState.call(model, nextState, prevState));
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        Object.keys(model).forEach(function(key){
          if(Object.prototype.toString.call(this[key]) === '[object Object]' &&
            ('context' in this[key])){
            this[key].context = this; 
            Object.freeze(this[key]);
          } else if(Object.prototype.toString.call(this[key]) === '[object Array]'){
            Object.freeze(this[key]);
          }
        }.bind(model));

        //Add dependencies to model
        for(var dep in dependencies){
          if(dependencies.hasOwnProperty(dep) && dep[0] !== '_'){
            Object.defineProperty(model, dep, {
              configurable: false,
              enumerable: false,
              writable: false,
              value: dependencies[dep]
            });
          }
        }

        // Object.defineProperty(model, 'dependencies', {
        //   configurable: false,
        //   enumerable: false,
        //   writable: false,
        //   value: dependencies
        // });

        Object.freeze(nextState);
        return Object.freeze(model);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;
