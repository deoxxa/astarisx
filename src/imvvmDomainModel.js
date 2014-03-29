
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMDomainModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;

      var dataContext = function(state, previousState) {
        state = state || {};
        
        if(!!previousState){
          Object.defineProperty(state, 'previousState', {
            configurable: false,
            enumerable: true,
            writable: false,
            value: previousState
          });
        } else {
          previousState = {};
        }


        //Do this after previousState is set so that it is included
        if(desc.originalSpec.getInitialState){
          state = extend(state, desc.originalSpec.getInitialState(state, previousState ? previousState.state: void 0));
        }

        desc.proto.DataContext = function(initState, callback){
          return desc.proto.setState(initState, callback, true);
        }

        if(!('init' in desc.proto)){
          desc.proto.init = function(){
            return this.DataContext();
          }
        }
        
        var model = Object.create(desc.proto, desc.descriptor); 

        //set this last
        //TODO - rework this, as __proto__ is deprecated
        state.__proto__ = model.__proto__;

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: state
        });
        return model;
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMDomainModel;
