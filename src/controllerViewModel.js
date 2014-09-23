
var utils = require('./utils');
var extend = utils.extend;

var ControllerViewModel = {

  Mixin: {
    construct: function(stateChangeHandler, viewStateChangeHandler){

      var prevAdhocUndo = false;
      var previousPageNotFound = false;
      var desc = this.getDescriptor();
      desc.proto.setState = stateChangeHandler;

      desc.proto.revert = function(){
        this.setState(this.previousState, !!this.previousState ? this : void(0));
      };

      desc.proto.advance = function(){
        if(this.canAdvance){
          this.setState(this.nextState, this.nextState.nextState);
        }
      };

      desc.proto.initializeDataContext = function(obj /* or ...string */){

        var args = Array.prototype.slice.call(arguments, 0);
        var objArg = {};
        var arg, ctx, contexts, ctxArgs;

        if(obj === void(0)){
          objArg = { '*':[] };
        } else {
          if(Object.prototype.toString.call(obj) === '[object Object]'){
            for(arg in obj){
              if(obj.hasOwnProperty(arg)){
                if(Object.prototype.toString.call(obj[arg]) === '[object Array]'){
                  objArg[arg] = obj[arg];
                } else {
                  objArg[arg] = obj[arg] === void(0) ? [] : [obj[arg]];
                }
              };
            }
          } else {
            //they must be strings
            args.forEach(function(arg){
              //set to empty array to pass to apply
              objArg[arg] = [];
            });
          }
        }

        //determine processing scope
        contexts = '*' in objArg ? desc.viewModels : objArg;
        for(ctx in contexts){
          if(contexts.hasOwnProperty(ctx)){
            if((ctx in this) && 'dataContextWillInitialize' in this[ctx].constructor.originalSpec){
              //build args
              ctxArgs = objArg[ctx] || [];
              //append '*' args
              ctxArgs = ctxArgs.concat(objArg['*'] || objArg['_*'] || []);
              this[ctx].constructor.originalSpec.dataContextWillInitialize.apply(this[ctx], ctxArgs);
              // delete this[ctx].constructor.originalSpec.dataContextWillInitialize;
              // delete this[ctx].__proto__.dataContextWillInitialize;
            }
          }
        }
      };

      var ControllerViewModelClass = function(nextState, prevState, redoState, enableUndo,
        routingEnabled, pushStateChanged, internal, remember) {

        var freezeFields = desc.freezeFields,
          controllerViewModel = Object.create(desc.proto, desc.descriptor),
          fld,
          init = nextState === void(0),
          adhocUndo,
          pageNotFound;

        pushStateChanged = routingEnabled ? pushStateChanged : false;

        if(!init){
          if(routingEnabled){

            pageNotFound = nextState.pageNotFound === void(0) ? false : nextState.pageNotFound;

            Object.defineProperty(controllerViewModel, 'pageNotFound', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: pageNotFound
            });
            Object.defineProperty(controllerViewModel, 'forceReplace', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: nextState.forceReplace === void(0) ? false : nextState.forceReplace
            });
            Object.defineProperty(controllerViewModel, 'pushState', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: nextState.pushState === void(0) ? true : nextState.pushState
            });
            if(!('path' in controllerViewModel) && ('path' in nextState)){
              Object.defineProperty(controllerViewModel, 'path', {
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
            !previousAdhoc && internal && remember){
            previousAdhoc = adhocUndo;
            previousPageNotFound = pageNotFound;
            Object.defineProperty(controllerViewModel, 'previousState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: prevState
            });
            Object.defineProperty(controllerViewModel, 'canRevert', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            Object.defineProperty(controllerViewModel, 'canRevert', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: false
            });
          }
          if(!!redoState && ('state' in redoState) && !previousAdhoc &&
            !previousPageNotFound){
            Object.defineProperty(controllerViewModel, 'nextState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: redoState
            });
            Object.defineProperty(controllerViewModel, 'canAdvance', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            previousAdhoc = adhocUndo;
            previousPageNotFound = pageNotFound;
            Object.defineProperty(controllerViewModel, 'canAdvance', {
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
            desc.originalSpec.getInitialState.call(controllerViewModel) : {};
          if(routingEnabled){
            Object.defineProperty(controllerViewModel, 'path', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: nextState.path || '/'
            });
          }

        } else if('state' in nextState){
          delete nextState.state;

          //Need to have 'state' prop in controllerViewModel before can extend controllerViewModel to get correct state
          Object.defineProperty(controllerViewModel, 'state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });
          nextState = extend(nextState, controllerViewModel);
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

        Object.defineProperty(controllerViewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });
        return controllerViewModel;
      };
      return ControllerViewModelClass;
    }
  }
};

module.exports = ControllerViewModel;
