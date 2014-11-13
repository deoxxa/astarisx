
var utils = require('./utils');
var extend = utils.extend;
var isArray = utils.isArray;
var isObject = utils.isObject;
var freeze = utils.freeze;
var deepFreeze = utils.deepFreeze;

var ControllerViewModel = {

  Mixin: {
    construct: function(stateChangeHandler, viewStateChangeHandler){

      var prevAdhocUndo = false;
      var previousPageNotFound = false;
      var desc = this.getDescriptor();
      desc.proto.setState = stateChangeHandler;

      desc.proto.revert = function(callback){
        this.setState(this._previousState, !!this._previousState ? this : void(0), callback);
      };

      desc.proto.advance = function(callback){
        if(this.$canAdvance){
          this.setState(this._nextState, this._nextState._nextState, callback);
        }
      };

      desc.proto.initializeDataContext = function(obj /* ...string and objects OR array of strings and objects OR empty */){

        var args = Array.prototype.slice.call(arguments, 0);
        var argsLen;
        var objArg = {};
        var arg, ctx, contexts, ctxArgs;

        if(obj === void(0)){
          objArg = { '*':[] };
        } else {
          if(isArray(obj)){
            args = args[0];
          }
          argsLen = args.length;
          for (var i = 0; i < argsLen; i++) {
            args[i]
          
            if(isObject(args[i])){
              for(arg in args[i]){
                if(args[i].hasOwnProperty(arg)){
                  if(isArray(args[i][arg])){
                    objArg[arg] = args[i][arg];
                  } else {
                    objArg[arg] = args[i][arg] === void(0) ? [] : [args[i][arg]];
                  }
                };
              }
            } else {
              objArg[args[i]] = [];
            }
          };
        }

        //determine processing scope
        contexts = '*' in objArg ? desc.viewModels : objArg;
        for(ctx in contexts){
          if(contexts.hasOwnProperty(ctx)){
            if((ctx in this) && !!this[ctx].dataContextWillInitialize){
              //build args
              ctxArgs = objArg[ctx] || [];
              //append '*' args
              ctxArgs = ctxArgs.concat(objArg['*'] || objArg['_*'] || []);
              this[ctx].dataContextWillInitialize.apply(this[ctx], ctxArgs);
              delete Object.getPrototypeOf(this[ctx]).dataContextWillInitialize;
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

            pageNotFound = nextState.$pageNotFound === void(0) ? false : nextState.$pageNotFound;

            Object.defineProperty(controllerViewModel, '$pageNotFound', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: pageNotFound
            });
            Object.defineProperty(controllerViewModel, '$forceReplace', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: nextState.$forceReplace === void(0) ? false : nextState.$forceReplace
            });
            Object.defineProperty(controllerViewModel, '$pushState', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: nextState.$pushState === void(0) ? true : nextState.$pushState
            });
            if(!('$path' in controllerViewModel) && ('$path' in nextState)){
              Object.defineProperty(controllerViewModel, '$path', {
                configurable: false,
                enumerable: true,
                writable: false,
                value: nextState.$path
              });
            }
          }

          if(nextState.$enableUndo === void(0)){
              adhocUndo = false;
          } else {
            enableUndo = nextState.$enableUndo;
            adhocUndo = nextState.$enableUndo;
            if(!nextState.$enableUndo){
              routingEnabled = false;
            }
          }
        }

        //need routingEnabled flag because it depends on prevState
        if(enableUndo || routingEnabled){
          if(!!prevState && (!pushStateChanged || adhocUndo || pageNotFound) &&
            internal && remember){
            prevAdhocUndo = adhocUndo;
            previousPageNotFound = pageNotFound;
            Object.defineProperty(controllerViewModel, '_previousState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: prevState
            });
            Object.defineProperty(controllerViewModel, '$canRevert', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            Object.defineProperty(controllerViewModel, '$canRevert', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: false
            });
          }
          if(!!redoState && ('_state' in redoState) && !prevAdhocUndo &&
            !previousPageNotFound){
            Object.defineProperty(controllerViewModel, '_nextState', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: redoState
            });
            Object.defineProperty(controllerViewModel, '$canAdvance', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: true
            });
          } else {
            prevAdhocUndo = adhocUndo;
            previousPageNotFound = pageNotFound;
            Object.defineProperty(controllerViewModel, '$canAdvance', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: false
            });
          }
        }

        if(init){
          //Add _state prop so that it can be referenced from within getInitialState
          nextState = ('getInitialState' in desc.originalSpec) ?
            desc.originalSpec.getInitialState.call(controllerViewModel) : {};
          if(routingEnabled){
            Object.defineProperty(controllerViewModel, '$path', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: nextState.$path || '/'
            });
          }

        } else if('_state' in nextState){
          delete nextState._state;

          //Need to have '_state' prop in controllerViewModel before can extend controllerViewModel to get correct _state
          Object.defineProperty(controllerViewModel, '_state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });
          nextState = extend(nextState, controllerViewModel);
        }

        //freeze arrays and model objects and initialize if necessary
        if(freezeFields !== void(0)){
          for (fld = freezeFields.length - 1; fld >= 0; fld--) {
            if(freezeFields[fld].kind === 'object' || freezeFields[fld].kind === 'pseudoObject'){
              //Only freeze root object
              if(isObject(nextState[freezeFields[fld].fieldName])){
                Object.freeze(nextState[freezeFields[fld].fieldName]);
              }
            } else if(freezeFields[fld].kind === 'object:freeze' || freezeFields[fld].kind === 'pseudoObject:freeze'){
              //shallow freeze all objects and arrays one level down
              freeze(nextState[freezeFields[fld].fieldName]);
            } else if(freezeFields[fld].kind === 'object:deepFreeze' || freezeFields[fld].kind === 'pseudoObject:deepFreeze'){
              //freeze all objects and arrays traversing arrays for objects and arrays
              deepFreeze(nextState[freezeFields[fld].fieldName]);
            } else if(freezeFields[fld].kind !== 'instance') {
              //Must be kind:'array*'
              //initialize array if necessary
              if(!isArray(nextState[freezeFields[fld].fieldName])){
                nextState[freezeFields[fld].fieldName] = [];
              }
              if(freezeFields[fld].kind === 'array:freeze' || freezeFields[fld].kind === 'pseudoArray:freeze'){
                //shallow freeze all objects and arrays in array
                freeze(nextState[freezeFields[fld].fieldName]);
              } else if(freezeFields[fld].kind === 'array:deepFreeze' || freezeFields[fld].kind === 'pseudoArray:deepFreeze'){
                //freeze all objects and arrays in array traversing arrays and objects for arrays and objects
                deepFreeze(nextState[freezeFields[fld].fieldName]);
              } else {
                //freezeFields[fld].kind === 'array' || freezeFields[fld].kind === 'pseudoArray'
                Object.freeze(nextState[freezeFields[fld].fieldName]);
              }
            }
          };
        }

        Object.defineProperty(controllerViewModel, '_state', {
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