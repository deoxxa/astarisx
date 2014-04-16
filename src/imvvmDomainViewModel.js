
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMDomainModel = {
  Mixin: {
    construct: function(stateChangedHandler){
      
      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      desc.proto.undo = function(){
        this.setState(this.previousState, this);
      };

      desc.proto.redo = function(){
        if(this.nextState && !!Object.keys(this.nextState).length){
          this.setState(this.nextState, this.nextState.nextState);      
        }
      };

      var dataContext = function(nextState, prevState, redoState, enableUndo, initialize) {
        
        var freezeFields = desc.freezeFields,
          domainModel = Object.create(desc.proto, desc.descriptor),
          fld;
        
        if(!!enableUndo){
          if(!!prevState){
            Object.defineProperty(domainModel, 'previousState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: prevState
            });
          }
          if(!!redoState){
            Object.defineProperty(domainModel, 'nextState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: redoState
            });            
          }
        }

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
        
        //freeze arrays and domainModel instances
        for (fld = freezeFields.length - 1; fld >= 0; fld--) {
            Object.freeze(domainModel[freezeFields[fld].fieldName]);
        };

        return domainModel;
      };
      
      return dataContext;
    }
  }
};

module.exports = IMVVMDomainModel;
