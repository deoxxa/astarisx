
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMDomainModel = {
  Mixin: {
    construct: function(stateChangedHandler){
      
      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      var dataContext = function(nextState, prevState, enableUndo, initialize) {
        
        var freezeFields = desc.freezeFields;
        var domainModel = Object.create(desc.proto, desc.descriptor);
        
        if(nextState === void(0) && ('getInitialState' in domainModel)){
          //Add state prop so that it can be referenced from within getInitialState
          nextState = domainModel.getInitialState.call(domainModel);
        } else if('state' in nextState){
          delete nextState.state;
        
        //Need to have 'state' prop in domainModel before can extend domainModel to get correct state
        Object.defineProperty(domainModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });
        nextState = extend(nextState, domainModel);
      }
       //Need to have 'state' prop in domainModel before can extend domainModel to get correct state
        Object.defineProperty(domainModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });
        
        if(!!enableUndo && !!prevState){
          Object.defineProperty(domainModel, 'previousState', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: prevState
          });
        }

        //freeze arrays and domainModel instances
        for (var fld = freezeFields.length - 1; fld >= 0; fld--) {
            Object.freeze(domainModel[freezeFields[fld].fieldName]);
        };

        return domainModel;
      };
      
      return dataContext;
    }
  }
};

module.exports = IMVVMDomainModel;
