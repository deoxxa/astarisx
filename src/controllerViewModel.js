
var utils = require('./utils');
var extend = utils.extend;
var isArray = utils.isArray;
var isObject = utils.isObject;
var freeze = utils.freeze;
var deepFreeze = utils.deepFreeze;

var ControllerViewModel = {

  Mixin: {
    construct: function(stateChangeHandler){

      var prevAdhocUndo = false;
      var previousPageNotFound = false;
      var desc = this.getDescriptor();
      desc.proto.setState = stateChangeHandler;

      //revert and advance should always be available to allow for adhoc undo.
      desc.proto.revert = function(callback){
        var proxy;
        if(callback !== void(0)){
          proxy = function(err, appContext){
            this.setState();
            callback(err, appContext);
          }.bind(this);
        }
        this.setState(this.$previousState, !!this.$previousState ? this : void(0), true, proxy, void(0), true);
      };

      desc.proto.advance = function(callback){
        var proxy;
        if(callback !== void(0)){
          proxy = function(err, appContext){
            this.setState();
            callback(err, appContext);
          }.bind(this);
        }
        if(this.$canAdvance){
          this.setState(this.$nextState, this.$nextState.$nextState, proxy);
        }
      };

      desc.proto.initializeDataContext = function(/* empty OR an array of strings and objects OR ...strings and ...objects */){

        var args = Array.prototype.slice.call(arguments, 0);
        var argsLen;
        var objArg = {};
        var arg, ctx, contexts, ctxArgs;

        if(args[0] === void(0)){
          objArg = { '*':[] };
        } else {
          if(isArray(args[0])){
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
              ctxArgs = [];
              //append '*' args
              ctxArgs = ctxArgs.concat(objArg['*'] || [])
              if(ctx !== '*' && ctx !== '_*' && ctx in objArg){
                //pass args to dataContexts listed in objArg
                ctxArgs = ctxArgs.concat(objArg['_*'] || []);
                //pass args to specific dataContexts
                ctxArgs = ctxArgs.concat(objArg[ctx] || []);
              }
              this[ctx].dataContextWillInitialize.apply(this[ctx], ctxArgs);
              //dataContext dataContextWillInitialize should not be invoked again
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
            Object.defineProperty(controllerViewModel, '$previousState', {
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
          if(!!redoState && ('$state' in redoState) && !prevAdhocUndo &&
            !previousPageNotFound){
            Object.defineProperty(controllerViewModel, '$nextState', {
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
          //Add $state prop so that it can be referenced from within getInitialState
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

        } else if('$state' in nextState){
          delete nextState.$state;

          //Need to have '$state' prop in controllerViewModel before can extend controllerViewModel to get correct $state
          Object.defineProperty(controllerViewModel, '$state', {
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
            if(freezeFields[fld].kind === 'object'){
              //Only freeze root object
              if(isObject(nextState[freezeFields[fld].fieldName])){
                Object.freeze(nextState[freezeFields[fld].fieldName]);
              }
            } else if(freezeFields[fld].kind === 'object:freeze'){
              //shallow freeze all objects and arrays one level down
              freeze(nextState[freezeFields[fld].fieldName]);
            } else if(freezeFields[fld].kind === 'object:deepFreeze'){
              //freeze all objects and arrays traversing arrays for objects and arrays
              deepFreeze(nextState[freezeFields[fld].fieldName]);
            } else if(freezeFields[fld].kind !== 'instance') {
              //Must be kind:'array*'
              //initialize array if necessary
              if(!isArray(nextState[freezeFields[fld].fieldName])){
                nextState[freezeFields[fld].fieldName] = [];
              }
              if(freezeFields[fld].kind === 'array:freeze'){
                //shallow freeze all objects and arrays in array
                freeze(nextState[freezeFields[fld].fieldName]);
              } else if(freezeFields[fld].kind === 'array:deepFreeze'){
                //freeze all objects and arrays in array traversing arrays and objects for arrays and objects
                deepFreeze(nextState[freezeFields[fld].fieldName]);
              } else {
                //freezeFields[fld].kind === 'array'
                Object.freeze(nextState[freezeFields[fld].fieldName]);
              }
            }
          };
        }

        Object.defineProperty(controllerViewModel, '$state', {
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
