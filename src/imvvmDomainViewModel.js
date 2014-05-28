
var utils = require('./utils');
var extend = utils.extend;

var IMVVMDomainViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var prevAdhocUndo = false;
      var desc = this.getDescriptor();
      desc.proto.setState = stateChangedHandler;

      desc.proto.revert = function(){
        this.setState(this.previousState, !!this.previousState ? this : void(0));
      };

      desc.proto.advance = function(){
        if(this.canAdvance){
          this.setState(this.nextState, this.nextState.nextState);
        }
      };
      var dataContext = function(nextState, prevState, redoState, enableUndo,
        routingEnabled, pushStateChanged, internal) {

        var freezeFields = desc.freezeFields,
          domainModel = Object.create(desc.proto, desc.descriptor),
          fld,
          init = nextState === void(0),
          adhocUndo,
          forceReplace,
          pushState,
          pageNotFound;

        pushStateChanged = routingEnabled ? pushStateChanged : false;
        
        if(!init && routingEnabled){
          adhocUndo = nextState.enableUndo === void(0) ? false :
            nextState.enableUndo;

          forceReplace = nextState.forceReplace === void(0) ? false :
            nextState.forceReplace;

          pushState = nextState.pushState === void(0) ? true :
            nextState.pushState;

          pageNotFound = nextState.pageNotFound === void(0) ? false :
            nextState.pageNotFound;

          Object.defineProperty(domainModel, 'pageNotFound', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: pageNotFound
          });
          Object.defineProperty(domainModel, 'forceReplace', {
            configurable: false,
            enumerable: true,
            writable: false,
            value: forceReplace
          });
          Object.defineProperty(domainModel, 'pushState', {
            configurable: false,
            enumerable: true,
            writable: false,
            value: pushState
          });
          if(!('path' in domainModel) && ('path' in nextState)){
            Object.defineProperty(domainModel, 'path', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: nextState.path
            });
          }
        }

        //need routingEnabled flag because it depends on prevState
        if(enableUndo || routingEnabled){
          if(!!prevState && (!pushStateChanged || adhocUndo) &&
            !previousAdhoc && internal){
            previousAdhoc = adhocUndo;
            Object.defineProperty(domainModel, 'previousState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: prevState
            });
            Object.defineProperty(domainModel, 'canRevert', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            Object.defineProperty(domainModel, 'canRevert', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: false
            });
          }
          if(!!redoState && ('state' in redoState) && !previousAdhoc){
            Object.defineProperty(domainModel, 'nextState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: redoState
            });
            Object.defineProperty(domainModel, 'canAdvance', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            previousAdhoc = adhocUndo;
            Object.defineProperty(domainModel, 'canAdvance', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: false
            });
          }
        }

        if(init){
          //Add state prop so that it can be referenced from within getInitialState
          nextState = ('getInitialState' in desc.originalSpec) ?
            desc.originalSpec.getInitialState.call(domainModel) : {};
          if('path' in nextState){
            Object.defineProperty(domainModel, 'path', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: nextState.path
            });
          }

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

module.exports = IMVVMDomainViewModel;
