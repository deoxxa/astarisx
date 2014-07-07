
var utils = require('./utils');
var extend = utils.extend;

var DomainViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var prevAdhocUndo = false;
      var previousPageNotFound = false;
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
      var DomainViewModelClass = function(nextState, prevState, redoState, enableUndo,
        routingEnabled, pushStateChanged, internal) {

        var freezeFields = desc.freezeFields,
          domainViewModel = Object.create(desc.proto, desc.descriptor),
          fld,
          init = nextState === void(0),
          adhocUndo,
          forceReplace,
          pushState,
          pageNotFound;

        pushStateChanged = routingEnabled ? pushStateChanged : false;

        if(!init){
          if(routingEnabled){

            forceReplace = nextState.forceReplace === void(0) ? false :
              nextState.forceReplace;

            pushState = nextState.pushState === void(0) ? true :
              nextState.pushState;

            pageNotFound = nextState.pageNotFound === void(0) ? false :
              nextState.pageNotFound;

            Object.defineProperty(domainViewModel, 'pageNotFound', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: pageNotFound
            });
            Object.defineProperty(domainViewModel, 'forceReplace', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: forceReplace
            });
            Object.defineProperty(domainViewModel, 'pushState', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: pushState
            });
            if(!('path' in domainViewModel) && ('path' in nextState)){
              Object.defineProperty(domainViewModel, 'path', {
                configurable: false,
                enumerable: true,
                writable: false,
                value: nextState.path
              });
            }
          }

          if(nextState.enableUndo === void(0)){
              adhocUndo = false;
          } else {
            enableUndo = nextState.enableUndo;
            adhocUndo = nextState.enableUndo;
            if(!nextState.enableUndo){
              routingEnabled = false;
            }
          }
        }

        //need routingEnabled flag because it depends on prevState
        if(enableUndo || routingEnabled){
          if(!!prevState && (!pushStateChanged || adhocUndo || pageNotFound) &&
            !previousAdhoc && internal){
            previousAdhoc = adhocUndo;
            previousPageNotFound = pageNotFound;
            Object.defineProperty(domainViewModel, 'previousState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: prevState
            });
            Object.defineProperty(domainViewModel, 'canRevert', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            Object.defineProperty(domainViewModel, 'canRevert', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: false
            });
          }
          if(!!redoState && ('state' in redoState) && !previousAdhoc &&
            !previousPageNotFound){
            Object.defineProperty(domainViewModel, 'nextState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: redoState
            });
            Object.defineProperty(domainViewModel, 'canAdvance', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            previousAdhoc = adhocUndo;
            previousPageNotFound = pageNotFound;
            Object.defineProperty(domainViewModel, 'canAdvance', {
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
            desc.originalSpec.getInitialState.call(domainViewModel) : {};
          if('path' in nextState){
            Object.defineProperty(domainViewModel, 'path', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: nextState.path
            });
          }

        } else if('state' in nextState){
          delete nextState.state;

          //Need to have 'state' prop in domainViewModel before can extend domainViewModel to get correct state
          Object.defineProperty(domainViewModel, 'state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });
          nextState = extend(nextState, domainViewModel);
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

        Object.defineProperty(domainViewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });
        
        return domainViewModel;
      };
      return DomainViewModelClass;
    }
  }
};

module.exports = DomainViewModel;
