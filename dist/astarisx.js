!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Astarisx=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Astarisx = require('./src/core.js');
require('./lib/custom-event-polyfill');

module.exports = Astarisx;

},{"./lib/custom-event-polyfill":2,"./src/core.js":5}],2:[function(require,module,exports){
// Polyfill for creating CustomEvents on IE9/10

// code pulled from:
// https://github.com/d4tocchini/customevent-polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill
// modified by fattenap to test if function -> ie 11
if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
    var CustomEvent = function(event, params) {
        var evt;
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };

        evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent; // expose definition to window
}

},{}],3:[function(require,module,exports){

;(function(){

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' == typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' == typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
    // show <path> with [state]
    } else if ('string' == typeof path) {
      page.show(path, fn);
    // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path){
    if (0 == arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options){
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) window.addEventListener('click', onclick, false);
    if (!dispatch) return;
    var url = location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function(){
    running = false;
    removeEventListener('click', onclick, false);
    removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch){
    var ctx = new Context(path, state);
    if (false !== dispatch) page.dispatch(ctx);
    if (!ctx.unhandled) ctx.pushState();
    return ctx;
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */

  page.replace = function(path, state, init, dispatch){
    var ctx = new Context(path, state);
    ctx.init = init;
    if (null == dispatch) dispatch = true;
    if (dispatch) page.dispatch(ctx);
    ctx.save();
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx){
    var i = 0;

    function next() {
      var fn = page.callbacks[i++];
      if (!fn) return unhandled(ctx);
      fn(ctx, next);
    }

    next();
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    var current = window.location.pathname + window.location.search;
    if (current == ctx.canonicalPath) return;
    page.stop();
    ctx.unhandled = true;
    window.location = ctx.canonicalPath;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? path.slice(i + 1) : '';
    this.pathname = ~i ? path.slice(0, i) : path;
    this.params = [];

    // fragment
    this.hash = '';
    if (!~this.path.indexOf('#')) return;
    var parts = this.path.split('#');
    this.path = parts[0];
    this.hash = parts[1] || '';
    this.querystring = this.querystring.split('#')[0];
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function(){
    history.pushState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function(){
    history.replaceState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(path
      , this.keys = []
      , options.sensitive
      , options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn){
    var self = this;
    return function(ctx, next){
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Array} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params){
    var keys = this.keys
      , qsIndex = path.indexOf('?')
      , pathname = ~qsIndex ? path.slice(0, qsIndex) : path
      , m = this.regexp.exec(pathname);

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];

      var val = 'string' == typeof m[i]
        ? decodeURIComponent(m[i])
        : m[i];

      if (key) {
        params[key.name] = undefined !== params[key.name]
          ? params[key.name]
          : val;
      } else {
        params.push(val);
      }
    }

    return true;
  };

  /**
   * Normalize the given path string,
   * returning a regular expression.
   *
   * An empty array should be passed,
   * which will contain the placeholder
   * key names. For example "/user/:id" will
   * then contain ["id"].
   *
   * @param  {String|RegExp|Array} path
   * @param  {Array} keys
   * @param  {Boolean} sensitive
   * @param  {Boolean} strict
   * @return {RegExp}
   * @api private
   */

  function pathtoRegexp(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
          + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  }

  /**
   * Handle "populate" events.
   */

  function onpopstate(e) {
    if (e.state) {
      var path = e.state.path;
      page.replace(path, e.state);
    }
  }

  /**
   * Handle "click" events.
   */

  function onclick(e) {
    if (1 != which(e)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;

    // ensure link
    var el = e.target;
    while (el && 'A' != el.nodeName) el = el.parentNode;
    if (!el || 'A' != el.nodeName) return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;

    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // same page
    var orig = path + el.hash;

    path = path.replace(base, '');
    if (base && orig == path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null == e.which
      ? e.button
      : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return 0 == href.indexOf(origin);
  }

  /**
   * Expose `page`.
   */

  if ('undefined' == typeof module) {
    window.page = page;
  } else {
    module.exports = page;
  }

})();

},{}],4:[function(require,module,exports){

var utils = require('./utils');
var extend = utils.extend;

var ControllerViewModel = {

  Mixin: {
    construct: function(stateChangeHandler, viewStateChangeHandler){

      var prevAdhocUndo = false;
      var previousPageNotFound = false;
      var desc = extend(this.getDescriptor());
      desc.proto.setState = stateChangeHandler;

      desc.proto.revert = function(){
        this.setState(this.previousState, !!this.previousState ? this : void(0));
      };

      desc.proto.advance = function(){
        if(this.canAdvance){
          this.setState(this.nextState, this.nextState.nextState);
        }
      };

      desc.proto.initializeDataContext = function(obj /* ...string and objects OR array of string and objects OR empty */){

        var args = Array.prototype.slice.call(arguments, 0);
        var argsLen;
        var objArg = {};
        var arg, ctx, contexts, ctxArgs;

        if(obj === void(0)){
          objArg = { '*':[] };
        } else {
          if(Object.prototype.toString.call(obj) === '[object Array]'){
            args = args[0];
          }
          argsLen = args.length;
          for (var i = 0; i < argsLen; i++) {
            args[i]
          
            if(Object.prototype.toString.call(args[i]) === '[object Object]'){
              for(arg in args[i]){
                if(args[i].hasOwnProperty(arg)){
                  if(Object.prototype.toString.call(args[i][arg]) === '[object Array]'){
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

},{"./utils":9}],5:[function(require,module,exports){
var model = require('./model');
var viewModel = require('./viewModel');
var controllerViewModel = require('./controllerViewModel');
var mixin = require('./mixin');

var page = require('page');

var utils = require('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;

var ModelBase = function(){};
var ViewModelBase = function(){};
var ControllerViewModelBase = function(){};

var modelClassConstructor;
var viewModelClassConstructor;
var controllerViewModelClassConstructor;

mixInto(ModelBase, model.Mixin);
mixInto(ViewModelBase, viewModel.Mixin);
mixInto(ControllerViewModelBase, controllerViewModel.Mixin);

var AstarisxClass = {
  createClass: function(ctor, classType, spec){

    var Constructor = function(){};
    Constructor.prototype = new ctor();
    Constructor.prototype.constructor = Constructor;

    var DescriptorConstructor = Constructor;

    var ConvenienceConstructor = function(stateChangeHandler) {
      var descriptor = new DescriptorConstructor();
      return descriptor.construct.apply(ConvenienceConstructor, arguments);
    };

    ConvenienceConstructor.componentConstructor = Constructor;
    Constructor.ConvenienceConstructor = ConvenienceConstructor;

    ConvenienceConstructor.originalSpec = spec;

    // Expose the convience constructor on the prototype so that it can be
    // easily accessed on descriptors. E.g. <Foo />.type === Foo.type and for
    // static methods like <Foo />.type.staticMethod();
    // This should not be named constructor since this may not be the function
    // that created the descriptor, and it may not even be a constructor.
    ConvenienceConstructor.type = Constructor;
    Constructor.prototype.type = Constructor;

    ConvenienceConstructor.classType = classType;
    Constructor.prototype.classType = classType;
    
    ConvenienceConstructor.getDescriptor = function(){
      var descriptor = {},
        proto = this.prototype,
        viewModels = {},
        autoFreeze = [],
        aliases = {},
        statics = {},
        hasStatic = false,
        key,
        mixinSpec;
      var tempDesc = {},
        validations = [];

      if('__processedSpec__' in this.originalSpec){
        return this.originalSpec.__processedSpec__;
      }

      // Mixin addons
      if('mixins' in this.originalSpec && proto.constructor.classType !== "Model"){
        for (var i = 0; i < this.originalSpec.mixins.length; i++) {
          mixinSpec = this.originalSpec.mixins[i];
          for (var name in mixinSpec) {
            var property = mixinSpec[name];
            if (!mixinSpec.hasOwnProperty(name)) {
              continue;
            }
            this.originalSpec[name] = property;
          }
        }
        delete this.originalSpec.mixins;
      }
      for(key in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(key)){
          if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
            //assume it is a descriptor and clone
            tempDesc[key] = extend(this.originalSpec[key]);
            tempDesc[key].enumerable = true;
            if(proto.constructor.classType === "ControllerViewModel" && ('viewModel' in tempDesc[key])) {
              //ensure that we don't use the reseved keys
              if(key !== '*' && key !== '_*'){
                viewModels[key] = tempDesc[key].viewModel;
              }
              delete tempDesc[key].viewModel;
              delete tempDesc[key].set;
            } else {
              if(proto.constructor.classType === "Model" && ('aliasFor' in tempDesc[key])){
                aliases[tempDesc[key].aliasFor] = key;
                delete tempDesc[key].aliasFor;
              }

              if(proto.constructor.classType === "Model" && ('validate' in tempDesc[key]) && 
                Object.prototype.toString.call(tempDesc[key].validate) === '[object Object]'){
                //delete setter. just in case
                delete tempDesc[key].validate.set;
                descriptor[key + 'Valid'] = tempDesc[key].validate;
                validations.push(tempDesc[key].validate.get);
                delete tempDesc[key].validate;
              }

              if('kind' in tempDesc[key]){
                if(tempDesc[key].kind === 'pseudo'){
                  tempDesc[key].enumerable = false;
                } else if ((proto.constructor.classType === "ViewModel" && tempDesc[key].kind === 'instance') ||
                  tempDesc[key].kind === 'array') { //'instance' || 'array'
                  autoFreeze.push({fieldName: key, kind: tempDesc[key].kind});
                  //if array then remove set. Can only update array via functions
                  if(tempDesc[key].kind === 'array'){
                    delete tempDesc[key].set;
                  }
                } else if (proto.constructor.classType === "ControllerViewModel" && tempDesc[key].kind === 'static') {
                  hasStatic = true;
                  statics[key] = void(0);
                } else if (proto.constructor.classType === "Model" && tempDesc[key].kind === 'uid') {
                  //Don't do anything as yet
                } else {
                  throw new TypeError('"'+tempDesc[key].kind +'" '+
                    'is not a valid "kind" value. Please review field "' + key + '".');
                }
                delete tempDesc[key].kind;
              }
            }
            descriptor[key] = tempDesc[key];
          } else {
            if(key !== 'getInitialState' && key !== 'getWatchedState' &&
              key !== 'getRoutes' && key !== 'getDisplays' && key != 'getTransitions'){
              proto[key] = this.originalSpec[key];
            }
          }
        }
      }

      if(proto.constructor.classType === "ControllerViewModel"){
        this.originalSpec.getViewModels = function(){
          return viewModels;
        }
      }

      //add allValid check
      if(proto.constructor.classType === "Model"){
        var validationsLen = validations.length;
        if(validationsLen > 0){
          descriptor.allValid = { 
            get: function(){
              var valid = true;
              for(var v = 0; v < validationsLen; v++){
                if(!!!validations[v].call(this)){
                  valid = false;
                  break;
                }
              }
              return valid;
            }
          }
        }
      }

      this.originalSpec.__processedSpec__ = {
        descriptor: descriptor,
        proto: proto,
        originalSpec: this.originalSpec || {},
        freezeFields: autoFreeze,
        aliases: aliases,
        statics: statics,
        hasStatic: hasStatic,
        viewModels: viewModels
      };
      return this.originalSpec.__processedSpec__;
    };
    return ConvenienceConstructor;
  },
};

modelClassConstructor = AstarisxClass.createClass.bind(this, ModelBase, 'Model');
viewModelClassConstructor = AstarisxClass.createClass.bind(this, ViewModelBase, 'ViewModel');
controllerViewModelClassConstructor = AstarisxClass.createClass.bind(this, ControllerViewModelBase, 'ControllerViewModel');

module.exports = {
  createModelClass: modelClassConstructor,
  createMClass: modelClassConstructor,
  createVMClass: viewModelClassConstructor,
  createViewModelClass: viewModelClassConstructor,
  createControllerViewModelClass: controllerViewModelClassConstructor,
  createCVMClass: controllerViewModelClassConstructor,
  mixin: mixin,
  extend: extend,
  page: page
};

},{"./controllerViewModel":4,"./mixin":6,"./model":7,"./utils":9,"./viewModel":10,"page":3}],6:[function(require,module,exports){
var StateManager = require('./stateManager');
var stateMgr;

var mixin = {
  ui: {
    initializeAppContext: function(options, initCtxObj){
      stateMgr = new StateManager(this, options, initCtxObj);
    },
    componentWillUnmount: function(){
      if('sessionStorage' in window){
        window.sessionStorage.clear();
      }
      stateMgr.dispose();
    }
  },
  view: {
    getInitialState: function(){
      //If component isn't passed in just returns appContext
      return {
        appContext: stateMgr.currentState(),
        containerType: "view"
      };
    },
    componentDidMount: function(){
      //If component is passed registers stateChange listener
      stateMgr.mountView(this);
    },
    componentWillUnmount: function(){
      //remove event listener
      stateMgr.unmountView(this);
    }
  },
  display: {
    getInitialState: function(){
      return {
        containerType: "display"
      }
    },
    componentDidMount: function(){
      this.props.appContext.cueDisplay(this);
    }
  },
  page: {
    getInitialState: function(){
      return {
        containerType: "page"
      }
    },
    componentDidMount: function(){
      this.props.appContext.cuePage(this);
    }
  },  
  pushState: {
    componentDidMount: function(){
      this.getDOMNode().addEventListener('click', this.onclick);
    },
    componentWillUnmount: function(){
      this.getDOMNode().removeEventListener('click');
    },
    /**
    * Event button.
    */
    which: function(e) {
      e = e || window.event;
      return null == e.which
        ? e.button
        : e.which;
    },
    /**
    * Check if `href` is the same origin.
    */
    sameOrigin: function(href) {
      var origin = location.protocol + '//' + location.hostname;
      if (location.port) origin += ':' + location.port;
      return 0 == href.indexOf(origin);
    },
    /**
    * Handle "click" events for routing from <a>
    */
    onclick: function (e) {

      if (1 != this.which(e)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (e.defaultPrevented) return;

      // ensure link
      var el = e.target;
      while (el && 'A' != el.nodeName) el = el.parentNode;
      if (!el || 'A' != el.nodeName) return;

      // ensure non-hash for the same path
      var link = el.getAttribute('href');
      if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

      // check target
      if (el.target) return;

      // x-origin
      if (!this.sameOrigin(el.href)) return;

      // rebuild path
      var path = el.pathname + el.search + (el.hash || '');

      // same page
      var orig = path + el.hash;
      e.preventDefault();
      path = path.replace(Astarisx.page.base(), '');
      if (Astarisx.page.base() && orig == path ||
        el.href === el.baseURI + el.search + (el.hash || '')) {
          return;
        }

      Astarisx.page.show(orig);
    }
  },
  mediaQuery: {
    mediaChangeHandler: function(id, mql, initializing){
      stateMgr.currentState().mediaChangeHandler.call(stateMgr.currentState(), id, mql, initializing);
    },
    componentDidMount: function(){
      
      var sheets = document.styleSheets;
      var sheetsLen = sheets.length;
      var initializing = true;
      var rules, rulesLen, mql, id;

      for (var i = 0; i < sheetsLen; i += 1) {
        rules = sheets[i].cssRules;
        rulesLen = rules.length;
        for (var j = 0; j < rulesLen; j += 1) {
          if (rules[j].constructor === CSSMediaRule) {
            if(!!rules[j].cssRules.length){
              id = rules[j].cssRules[0].selectorText.split("#");
              if(id.length === 2 && id[0] === ".media"){
                mql = window.matchMedia(rules[j].media.mediaText);
                mql.addListener(this.mediaChangeHandler.bind(this, id[1]));
                if(initializing){
                  this.mediaChangeHandler(id[1], mql, initializing);
                } else {
                  this.mediaChangeHandler(mql);
                }
              }
            }
          }
        }
      }
    }
  }
};

var display = {
  getInitialState: function(){
    //If component isn't passed in it just returns appContext
    return {
      appContext: stateMgr.currentState(),
      containerType: "display"
    };
  },
  componentDidMount: function(){
    //If component is passed it registers stateChange listener
    stateMgr.mountView(this);
    this.state.appContext.cueDisplay(this);
  },
  componentWillUnmount: function(){
    //remove event listener
    stateMgr.unmountView(this);
  }
};

var page = {
  getInitialState: function(){
    //If component isn't passed in it just returns appContext
    return {
      appContext: stateMgr.currentState(),
      containerType: "page"
    };
  },
  componentDidMount: function(){
    //If component is passed it registers stateChange listener
    stateMgr.mountView(this);
    this.state.appContext.cuePage(this);
  },
  componentWillUnmount: function(){
    //remove event listener
    stateMgr.unmountView(this);
  }
};

var viewMixin = mixin.view;

Object.defineProperty(mixin.view, 'display', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: display
});

Object.defineProperty(mixin.view, 'page', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: page
});

module.exports = mixin;

},{"./stateManager":8}],7:[function(require,module,exports){

var utils = require('./utils');
var extend = utils.extend;

var Model = {
  Mixin: {
    construct: function(stateChangeHandler){

      var desc = this.getDescriptor();

      var ModelClass = function(nextState, extendState, initialize) {
        var freezeFields = desc.freezeFields,
          fld,
          model = Object.create(desc.proto, desc.descriptor);

        if(nextState === void(0)){
          initialize = true;
        } else if(typeof nextState === 'boolean'){
          initialize = nextState;
          nextState = void(0);
        } else if(typeof extendState === 'boolean'){
          initialize = extendState;
          extendState = void(0);
        }
        nextState = extend(nextState, extendState);

        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        nextState = extend(nextState, model);

        if(initialize){
          for(var aliasFor in desc.aliases){
            if(desc.aliases.hasOwnProperty(aliasFor) && aliasFor in nextState){
              nextState[desc.aliases[aliasFor]] = nextState[aliasFor];
              delete nextState[aliasFor];
            }
          }

          Object.defineProperty(model, 'state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });

          nextState = extend(nextState, model);

          if('getInitialState' in desc.originalSpec){
            nextState = extend(nextState, desc.originalSpec.getInitialState.call(model));
          }
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

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });
        
        Object.defineProperty(model, '__stateChangeHandler', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: (function(){
            return stateChangeHandler;
          })()
        });

        return Object.freeze(model);
      };
      return ModelClass;
    }
  }
};

module.exports = Model;

},{"./utils":9}],8:[function(require,module,exports){
var page = require('page');
var utils = require('./utils');
var extend = utils.extend;
var updateStatic = utils.updateStatic;
var uuid = require('./utils').uuid;

var StateManager = function(component, appCtx, initCtxObj) {
	
	var namespace = uuid(),
		controllerViewModel,
		stateChangeHandler,
		viewKey,
		node,
		enableUndo,
		routingEnabled,
		staticState = {},
		hasStatic = false,
		dataContexts = {},
		domain,
		links = {},
		watchedDataContexts = {},
		viewModel,
		transientState = {},
		processedState = {},
		watchedState,
		watchedItem,
		watchedProp,
		watchedDataContext,
		link,
		calledBack = false,
		routeHash = {},
		routeMapping = {},
		routePath,
		external = false,
		internal = false,
		self = this;

	self.appState = {};
	self.listeners = {};
	self.handlers = {};
	self.hasListeners = false;		

	controllerViewModel = appCtx.controllerViewModel;
	enableUndo = 'enableUndo' in appCtx ? appCtx.enableUndo : false;
	routingEnabled = 'enableRouting' in appCtx ? appCtx.enableRouting : false;
	self.signInUrl = appCtx.signInUrl;

	stateChangeHandler = function(applicationDataContext){
    component.setState({appContext: applicationDataContext});
  };

	var appStateChangeHandler = function(caller, newState, newAppState, remember, callback, delay) {
		var nextState = {},
			prevState = void(0),
			redoState = void(0),
			newStateKeys,
			keyIdx,
			transientStateKeysLen,
			dataContext,
			linkedDataContext,
			processedStateKeys = [],
			processedStateKeysLen,
			watchedField,
			subscribers,
			subscriber,
			pushStateChanged = false,
			willUndo = false,
			stateChangeEvent;

			console.log(newState);


    if(arguments.length < 2){
      newState = self.appState;
    }

    if(typeof remember === 'function'){
    	delay = callback;
      callback = remember;
      remember = true;
    } else if(typeof newAppState === 'function'){
    	delay = remember;
			callback = newAppState;
			newAppState = {};
		} else if (typeof newAppState === 'boolean'){
      remember = newAppState;
      newAppState = {};
    }

    if(remember === void(0)){
    	remember = true;
    }
		newState = newState || {};
		newStateKeys = Object.keys(newState);

		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangeHandler. If a callback was passed in
		//it would be assigned to newState
		if(Object.getPrototypeOf(newState).constructor.classType === "ControllerViewModel") {
			willUndo = true;
			nextState = extend(newState, staticState);
			prevState = newState.previousState;
			redoState = newAppState;
			//Need to reset ViewModel with instance object so that setState is associated with
			//the current ViewModel. This reason this ccurs is that when a ViewModel is created it
			//assigns a setState function to all instance fields and binds itself to it. When undo is called
			//the data is rolled back but viewModels are not recreated and therefore the setState functions
			//are associated with outdated viewModels and returns unexpected output. So to realign the ViewModels
			//with setState we recreate them.
			for(dataContext in domain){
				nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext]);
			}

			//relink
			for(dataContext in domain){
				if(domain.hasOwnProperty(dataContext)){
					for(linkedDataContext in links[dataContext]){
						if(links[dataContext].hasOwnProperty(linkedDataContext)){
							nextState[dataContext].state[links[dataContext][linkedDataContext]] =
								(linkedDataContext in domain) ? extend(nextState[linkedDataContext].state) :
									nextState[linkedDataContext];
						}
					}
				}
			}

			if(typeof callback === 'function'){
				try {
						self.appState = new this.ApplicationDataContext(nextState, prevState, redoState,
						enableUndo, routingEnabled, nextState.path !== self.appState.path,
						!external || nextState.pageNotFound, remember);

	        calledBack = true;
	        if(!!delay){
						window.setTimeout(function(){
						  if(caller === namespace){
                callback.call(self.appState, void(0), self.appState);
              } else {
                callback.call(self.appState[caller], void(0), self.appState);
              }
			      }, delay);
					} else {
					  if(caller === namespace){
              callback.call(self.appState, void(0), self.appState);
            } else {
              callback.call(self.appState[caller], void(0), self.appState);
            }
					}
				} catch(e) {
					callback(e);
				}
        return;
			}
		} else {

			if(hasStatic){
				staticState = updateStatic(staticState, newState);
			}

			if(!!newStateKeys.length){
				if(caller === namespace){
					nextState = extend(newState);
				} else {
					nextState[caller] = extend(newState);
				}
			}
			transientState = extend(nextState, transientState, newAppState);
			transientStateKeys = Object.keys(transientState);
			if(transientStateKeys.length === 0){
				return;
			}

			transientStateKeysLen = transientStateKeys.length - 1;

			for (keyIdx = transientStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(transientStateKeys[keyIdx] in domain){
					nextState[transientStateKeys[keyIdx]] = extend(self.appState[transientStateKeys[keyIdx]], transientState[transientStateKeys[keyIdx]]);
					nextState[transientStateKeys[keyIdx]] = new dataContexts[transientStateKeys[keyIdx]](nextState[transientStateKeys[keyIdx]]);
				} else {
					nextState[transientStateKeys[keyIdx]] = transientState[transientStateKeys[keyIdx]];
				}
			};

			processedState = extend(processedState, nextState);

			//Triggers
			nextState = extend(self.appState, processedState);

			transientState = {};
			for (keyIdx = transientStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(transientStateKeys[keyIdx] in watchedDataContexts){
					for(watchedField in watchedDataContexts[transientStateKeys[keyIdx]]){
						if(watchedDataContexts[transientStateKeys[keyIdx]].hasOwnProperty(watchedField)){
							if(newStateKeys.indexOf(watchedField) !== -1){
								subscribers = watchedDataContexts[transientStateKeys[keyIdx]][watchedField];
								for(subscriber in subscribers){
									if(subscribers.hasOwnProperty(subscriber)){
										//Cross reference dataContext link Phase
										if(subscriber in links){
											for(dataContext in links[subscriber]){
												if(links[subscriber].hasOwnProperty(dataContext)){
													nextState[subscriber].state[links[subscriber][dataContext]] =
														(dataContext in domain) ? extend(nextState[dataContext].state) :
															nextState[dataContext];
												}
												if(dataContext in links){
													for(dataContext2 in links[dataContext]){
														if(links[dataContext].hasOwnProperty(dataContext2)){
															nextState[dataContext].state[links[dataContext][dataContext2]] =
																(dataContext2 in domain) ? extend(nextState[dataContext2].state) :
																	nextState[dataContext2];
														}
													}
												}
											}
										}
										transientState = extend(transientState,
											subscribers[subscriber].call(self.appState[subscriber],
											nextState[transientStateKeys[keyIdx]][watchedField],
											self.appState[transientStateKeys[keyIdx]][watchedField],
											watchedField, transientStateKeys[keyIdx],
											nextState.path, self.appState.path));
									}
								}
							}
						}
					}
				}
			};
			if(!!Object.keys(transientState).length){
				appStateChangeHandler(void(0), {}, transientState, remember, callback, delay);
				return;
			}
			//Link Phase
			processedStateKeys = Object.keys(processedState);
			processedStateKeysLen = processedStateKeys.length - 1;
			for (keyIdx = processedStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(caller === namespace && (namespace in links)){
					if(processedStateKeys[keyIdx] in links[namespace]){
						for(dataContext in links[namespace][processedStateKeys[keyIdx]]){
							if(links[namespace][processedStateKeys[keyIdx]].hasOwnProperty(dataContext)){
								nextState[dataContext].state[links[namespace][processedStateKeys[keyIdx]][dataContext]] =
									nextState[processedStateKeys[keyIdx]];
							}
							if(dataContext in links){
								for(dataContext2 in links[dataContext]){
									if(links[dataContext].hasOwnProperty(dataContext2)){
										nextState[dataContext].state[links[dataContext][dataContext2]] =
											(dataContext2 in domain) ? extend(nextState[dataContext2].state) :
												nextState[dataContext2];
									}
								}
							}
						}
					}
				} else {
					if(processedStateKeys[keyIdx] in links){
						for(dataContext in links[processedStateKeys[keyIdx]]){
							if(links[processedStateKeys[keyIdx]].hasOwnProperty(dataContext)){
								nextState[processedStateKeys[keyIdx]].state[links[processedStateKeys[keyIdx]][dataContext]] =
									nextState[dataContext];
							}
							if(dataContext in links){
								for(dataContext2 in links[dataContext]){
									if(links[dataContext].hasOwnProperty(dataContext2)){
										nextState[dataContext].state[links[dataContext][dataContext2]] =
											nextState[dataContext2];
									}
								}
							}
						}
					}
				}
	    }

			if(self.appState.canRevert && calledBack){
				prevState = self.appState.previousState;
			} else if(hasStatic && staticState._staticUpdated && staticState._onlyStatic){
        if(self.appState.canRevert){
        	prevState = self.appState.previousState;
        }
        if(self.appState.canAdvance){
        	redoState = self.appState.nextState;
        }
      } else {
				prevState = self.appState;
			}
		}

		if(!!prevState){
			Object.freeze(prevState);
		}

		//check the paths to see of there has been an path change
		pushStateChanged = nextState.path !== self.appState.path;

		try {
			//Add dataContextWillUpdate
      if(willUndo){
        nextState = extend(nextState, {dataContextWillUpdate: newState.state.dataContextWillUpdate});
      } else {
        nextState = extend(nextState, {dataContextWillUpdate: processedState});
      }

			self.appState = new this.ApplicationDataContext(nextState, prevState, redoState,
			enableUndo, routingEnabled, pushStateChanged,
			!external || nextState.pageNotFound, remember);	

			Object.freeze(self.appState);
			Object.freeze(self.appState.state);

			if(typeof callback === 'function'){
				calledBack = true;
				if(!!delay){
					window.setTimeout(function(){
					  if(caller === namespace){
	            callback.call(self.appState, void(0), self.appState);
	          } else {
	            callback.call(self.appState[caller], void(0), self.appState);
	          }
		      }, delay);
				} else {
				  if(caller === namespace){
            callback.call(self.appState, void(0), self.appState);
          } else {
            callback.call(self.appState[caller], void(0), self.appState);
          }
					return;
				}
			}
		} catch(e) {
			if(typeof callback === 'function'){
				callback(e);
				return;
			}
		}

		// Internal call routing
		if(routingEnabled && self.appState.pushState){
			if(('path' in self.appState) && !external){
				internal = true;
				if(pushStateChanged && !self.appState.forceReplace){
					page(self.appState.path);
				} else {
					page.replace(self.appState.path);
				}
			}
			external = false;
		}
		
		/***************/
		/* All the work is done! -> Notify the UI
		/* and any other mounted Views
		/***************/
		calledBack = false;
		transientState = {};
		processedState = {};
  	
  	if(self.hasListeners){
			stateChangeEvent = new CustomEvent("stateChange", {"detail": self.appState});
		  if(nextState.notify){
		  	//Only notify specific views
				if(Object.prototype.toString.call(nextState.notify) === '[object Array]'){
					nextState.notify.forEach(function(viewKey){
						if(viewKey === "*"){
							stateChangeHandler(self.appState);
						} else if(viewKey in self.listeners){
							self.listeners[viewKey].dispatchEvent(stateChangeEvent);
						}
					});
				} else {
					if(nextState.notify === "*"){
						stateChangeHandler(self.appState);
					} else if(nextState.notify in self.listeners){
						self.listeners[nextState.notify].dispatchEvent(stateChangeEvent);
					}
				}
			} else {
				// Notify all the views
		    stateChangeHandler(self.appState);
		    for(var k in self.listeners){
		  		if(self.listeners.hasOwnProperty(k)){
		  			self.listeners[k].dispatchEvent(stateChangeEvent);
		  		}
		  	}
			}
			stateChangeEvent = void(0);
		} else {
			stateChangeHandler(self.appState);
		}
	};
	/***************/
	/* Initialize Application Data Context
	/***************/
  try {
  	this.ApplicationDataContext = controllerViewModel.call(this, appStateChangeHandler.bind(this, namespace));
  	self.appState = new this.ApplicationDataContext(void(0), void(0), void(0), enableUndo, routingEnabled);
    self.appState.state = self.appState.state || {};
  } catch (e) { 
  	if (e instanceof TypeError) {
    	throw new TypeError('Please assign a ControllerViewModel to the "controllerViewModel" prop in React.renderComponent');
  	} else {
  		throw e;
  	}
  }

	domain = self.appState.constructor.originalSpec.getViewModels();
	delete Object.getPrototypeOf(self.appState).getViewModels;

	//Initialize all dataContexts
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			dataContexts[viewModel] = domain[viewModel].call(this, appStateChangeHandler.bind(this, viewModel));
			self.appState.state[viewModel] = new dataContexts[viewModel](self.appState.state[viewModel], true);
    }
  }

  //Store links
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			if('getWatchedState' in self.appState[viewModel].constructor.originalSpec){
				watchedState = self.appState[viewModel].constructor.originalSpec.getWatchedState();
				for(watchedItem in watchedState){
					if(watchedState.hasOwnProperty(watchedItem)){
						if(watchedItem in domain || watchedItem in self.appState){
							if('alias' in watchedState[watchedItem]){
								if(!(viewModel in links)){
									links[viewModel] = {};
								}
								links[viewModel][watchedItem] = watchedState[watchedItem].alias;

								if(!(watchedItem in domain)){
									if(!(namespace in links)){
										links[namespace] = {};
									}
									if(!(viewModel in links[namespace])){
										links[namespace][watchedItem] = {};
									}
									links[namespace][watchedItem][viewModel] = watchedState[watchedItem].alias;
								}
							}
							for(watchedProp in watchedState[watchedItem].fields){
								if(watchedState[watchedItem].fields.hasOwnProperty(watchedProp)){
									if(watchedItem in domain){
										watchedDataContext = {};
										if(!(watchedItem in watchedDataContexts)){
											watchedDataContexts[watchedItem] = {};
										}
										watchedDataContext[watchedProp] = {};
										watchedDataContext[watchedProp][viewModel] =
											watchedState[watchedItem].fields[watchedProp];
										watchedDataContexts[watchedItem] = watchedDataContext;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	//apply links
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			for(link in links[viewModel]){
			  if(links[viewModel].hasOwnProperty(link)){
					self.appState[viewModel].state[links[viewModel][link]] = self.appState[link];
			  }
			}
		}
	}

	//reinitialize with all data in place
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			self.appState.state[viewModel] =
				new dataContexts[viewModel](self.appState.state[viewModel]);

			if('getRoutes' in self.appState[viewModel].constructor.originalSpec){
				routeHash = self.appState[viewModel].constructor.originalSpec.getRoutes();
				for(routePath in routeHash){
					if(routeHash.hasOwnProperty(routePath)){
						routeMapping[routeHash[routePath].path] = routeHash[routePath].handler;
						page(routeHash[routePath].path, function(dataContextName, route,
								pathKey, ctx){
							external = true;
							if(!internal) {
								if(self.appState.canRevert && self.appState.pageNotFound){
                  ctx.rollbackRequest = true;
									ctx.revert = function(){
                    this.revert.bind(this);
                    this.setState({},{path:ctx.path});
                  }.bind(self.appState);
                }
								routeMapping[route].call(self.appState[dataContextName], ctx.params,
								ctx.path, pathKey, ctx, ('show' in self.appState) ? self.appState.show.bind(self.appState): void(0));
							}
							internal = false;
						}.bind(this, viewModel, routeHash[routePath].path, routePath));
					}
				}
				delete Object.getPrototypeOf(self.appState[viewModel]).getRoutes;
    	}

    	//This is if astarisx-animate mixin is used
			if('getDisplays' in self.appState[viewModel].constructor.originalSpec){
				self.appState.addDisplays(self.appState[viewModel].constructor.originalSpec.getDisplays(), viewModel);
				delete Object.getPrototypeOf(self.appState[viewModel]).getDisplays;
			}
		}
  }

	//This is if astarisx-animate mixin is used
	if('getDisplays' in self.appState.constructor.originalSpec){
		self.appState.addDisplays(self.appState.constructor.originalSpec.getDisplays());
		delete Object.getPrototypeOf(self.appState).getDisplays;
	}
	delete Object.getPrototypeOf(self.appState).addDisplays;

	if('getTransitions' in self.appState.constructor.originalSpec){
		self.appState.addTransitions(self.appState.constructor.originalSpec.getTransitions());
		delete Object.getPrototypeOf(self.appState).getTransitions;
	}
	delete Object.getPrototypeOf(self.appState).addTransitions;

	self.appState = new this.ApplicationDataContext(self.appState, void(0), void(0),
			enableUndo, routingEnabled);

	if(routingEnabled){
		//Setup 'pageNotFound' route
		page(function(ctx){
			external = true;
			self.appState.setState({'pageNotFound':true});
			internal = false;
		});
		//Initilize first path
		internal = true;
		page.replace(self.appState.path);
		page.start({click: false, dispatch: false});
		external = false;
	}

	hasStatic = self.appState.constructor.originalSpec.__processedSpec__.hasStatic;
	if(hasStatic){
		staticState = updateStatic(self.appState.constructor.originalSpec.__processedSpec__.statics, self.appState.state);
	}

  Object.freeze(self.appState.state);
  Object.freeze(self.appState);

  if('dataContextWillInitialize' in self.appState.constructor.originalSpec){
    self.appState.constructor.originalSpec.dataContextWillInitialize.call(self.appState, initCtxObj);
    delete Object.getPrototypeOf(self.appState).dataContextWillInitialize;
  }

};

StateManager.prototype.currentState = function(){
  return this.appState;
};

StateManager.prototype.unmountView = function(component){
	var viewKey = component.props.viewKey || component._rootNodeID;
	if(this.listeners === null || this.listeners === void(0)){
		this.handlers = null;
		this.hasListeners = false;
		return;
	}
	this.listeners[viewKey].removeEventListener("stateChange", this.handlers[viewKey]);
	delete this.listeners[viewKey];
	delete this.handlers[viewKey];
	if(!!!Object.keys(this.listeners).length){
		this.hasListeners = false;
	}
}

StateManager.prototype.mountView = function(component){
		var viewKey = component.props.viewKey || component._rootNodeID;
		this.handlers[viewKey] = function(e){
	    component.setState({appContext: e.detail});
		};
		var node = component.getDOMNode();
		// if node is null i.e. return 'null' from render(). then create a dummy element
		// to attach the event listener to
		this.listeners[viewKey] = !!node ? node : document.createElement("div");
  	this.listeners[viewKey].addEventListener("stateChange", this.handlers[viewKey]);
  	this.hasListeners = true;
}

StateManager.prototype.dispose = function(){
  
  var emptyState = new this.ApplicationDataContext(void(0), void(0), void(0), false, false);
	var resetState = {};
	var viewModels = this.appState.constructor.originalSpec.getViewModels();
	if(!!this.signInUrl){
		page.replace(this.signInUrl);
	}
	//first check if Animation mixin is being used
	//if it is then reset the display
	if('resetDisplay' in this.appState){
		this.appState.resetDisplay();
	}
		
	//remove listners
	for(var viewKey in this.listeners){
		if(this.listeners.hasOwnProperty(viewKey)){
			this.listeners[viewKey].removeEventListener("stateChange", this.handlers[viewKey]);
		}
	}
	
	//reset dataContexts
	for(viewModel in viewModels){
		if(viewModels.hasOwnProperty(viewModel)){
			resetState[viewModel] = this.appState[viewModel].dispose();
    }
  }
  resetState = extend(this.appState, emptyState, resetState);
	try {
  	this.appState = new this.ApplicationDataContext(resetState, void(0), void(0), false, false);
    this.appState.state = this.appState.state || {};
  } catch (e) { 
  	if (e instanceof TypeError) {
    	throw new TypeError('Something went wrong');
  	} else {
  		throw e;
  	}
  }

	delete this.appState.constructor.originalSpec.__processedSpec__;
	for(viewModel in viewModels){
		if(viewModels.hasOwnProperty(viewModel)){			
			delete this.appState[viewModel].constructor.originalSpec.__processedSpec__;
		}
	}
	this.listeners = null;
	this.handlers = null;
	this.hasListeners = false;

};

module.exports = StateManager;
},{"./utils":9,"page":3}],9:[function(require,module,exports){
var utils = {
  
  extend: function () {
    var newObj = {};
    for (var i = 0; i < arguments.length; i++) {
      var obj = arguments[i];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = obj[key];
        }
      }
    }
    return newObj;
  },

  updateStatic: function () {
    var newObj = {};
    Object.defineProperty(newObj, '_onlyStatic', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: true
    });
    Object.defineProperty(newObj, '_staticUpdated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    });
    for (var i = 0; i < arguments.length; i++) {
      var obj = arguments[i];
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && key in arguments[0]) {
          if(key in arguments[0]){
            newObj[key] = obj[key];
            if(i > 0){
              newObj._staticUpdated = true;
            }
          } else {
            newObj._onlyStatic = false;
          }
        }
      }
    }
    return newObj;
  },

  mixInto: function(constructor, methodBag) {
    var methodName;
    for (methodName in methodBag) {
      if (!methodBag.hasOwnProperty(methodName)) {
        continue;
      }
      constructor.prototype[methodName] = methodBag[methodName];
    }
  },

  uuid: function () {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
        .toString(16);
    }
    return uuid;
  }
  
};

module.exports = utils;
},{}],10:[function(require,module,exports){
var utils = require('./utils');
var extend = utils.extend;

var ViewModel = {

  Mixin: {
    construct: function(stateChangeHandler){

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangeHandler;

      var ViewModelClass = function(nextState, initialize) {

        //nextState has already been extended with prevState in core
        nextState = nextState || {};
        nextState = ('state' in nextState ? nextState.state : nextState);

        var freezeFields = desc.freezeFields,
          fld,
          viewModel = Object.create(desc.proto, desc.descriptor),
          tempDesc,
          tempModel;

        Object.defineProperty(viewModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize){
          nextState = ('getInitialState' in desc.originalSpec) ?
            extend(nextState, desc.originalSpec.getInitialState.call(viewModel)) : nextState;

          Object.defineProperty(viewModel, 'state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });
        }

        //freeze arrays and viewModel instances
        for (fld = freezeFields.length - 1; fld >= 0; fld--) {
          if(freezeFields[fld].kind === 'instance'){
              if(viewModel[freezeFields[fld].fieldName]){
                tempDesc = viewModel[freezeFields[fld].fieldName].constructor.originalSpec.__processedSpec__;
                tempModel = Object.create(tempDesc.proto, tempDesc.descriptor);

                Object.defineProperty(tempModel, '__stateChangeHandler', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: (function(fld){
                    return viewModel[fld].__stateChangeHandler;
                  })(freezeFields[fld].fieldName)
                });

                Object.defineProperty(tempModel, 'state', {
                  configurable: true,
                  enumerable: false,
                  writable: true,
                  value: viewModel[freezeFields[fld].fieldName].state
                });

                Object.getPrototypeOf(tempModel).setState = function(state, callback){ //callback may be useful for DB updates
                  callback = callback ? callback.bind(this) : void(0);
                  this.__stateChangeHandler.call(viewModel, extend(this.state, state), callback);
                };

                Object.freeze(viewModel[freezeFields[fld].fieldName]);
              }

          } else {
            nextState[freezeFields[fld].fieldName] = nextState[freezeFields[fld].fieldName] || [];
            Object.freeze(nextState[freezeFields[fld].fieldName]);
          }
        };

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        return Object.freeze(viewModel);
      };

      desc.proto.dispose = function(){
        return ViewModelClass(void(0));
      };

      return ViewModelClass;
    }
  }
};

module.exports = ViewModel;

},{"./utils":9}]},{},[1])(1)
});