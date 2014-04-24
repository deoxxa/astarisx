
var utils = require('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMDomainModel = {
  Mixin: {
    construct: function(stateChangedHandler){
      
      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      desc.proto.undo = function(){
        this.setState(this.previousState, !!this.previousState ? this : void(0));
      };

      desc.proto.redo = function(){
        if(this.canRedo){
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
            Object.defineProperty(domainModel, 'canUndo', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            Object.defineProperty(domainModel, 'canUndo', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: false
            });
          }
          if(!!redoState && 'state' in redoState){
            Object.defineProperty(domainModel, 'nextState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: redoState
            });
            Object.defineProperty(domainModel, 'canRedo', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            Object.defineProperty(domainModel, 'canRedo', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: false
            });
          }
        }

        if(nextState === void(0)){
          //Add state prop so that it can be referenced from within getInitialState
          nextState = ('getInitialState' in domainModel) ? domainModel.getInitialState.call(domainModel) : {};
          delete domainModel.__proto__.getInitialState;
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

        //freeze arrays and model instances and initialize if necessary
        for (fld = freezeFields.length - 1; fld >= 0; fld--) {
          if(freezeFields[fld].kind === 'array'){
            nextState[freezeFields[fld].fieldName] = nextState[freezeFields[fld].fieldName] || [];
            Object.freeze(nextState[freezeFields[fld].fieldName]);
          } else {
            throw new TypeError('kind:"instance" can only be specified in a ViewModel.');
          }
        };

        Object.defineProperty(domainModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        return domainModel;
      };
      
      return dataContext;
    }
  }
};

module.exports = IMVVMDomainModel;
