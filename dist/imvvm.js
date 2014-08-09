!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.IMVVM=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict'

var IMVVM = _dereq_('./src/core.js');

module.exports = IMVVM;

},{"./src/core.js":4}],2:[function(_dereq_,module,exports){

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

},{}],3:[function(_dereq_,module,exports){

var utils = _dereq_('./utils');
var extend = utils.extend;

var ControllerViewModel = {
  Mixin: {
    construct: function(stateChangeHandler){

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
      var ControllerViewModelClass = function(nextState, prevState, redoState, enableUndo,
        routingEnabled, pushStateChanged, internal, forget) {

        var freezeFields = desc.freezeFields,
          controllerViewModel = Object.create(desc.proto, desc.descriptor),
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

            Object.defineProperty(controllerViewModel, 'pageNotFound', {
              configurable: false,
              enumerable: false,
              writable: false,
              value: pageNotFound
            });
            Object.defineProperty(controllerViewModel, 'forceReplace', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: forceReplace
            });
            Object.defineProperty(controllerViewModel, 'pushState', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: pushState
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
            !previousAdhoc && internal && !forget){
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
          if('path' in nextState){
            Object.defineProperty(controllerViewModel, 'path', {
              configurable: false,
              enumerable: true,
              writable: false,
              value: nextState.path
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

},{"./utils":8}],4:[function(_dereq_,module,exports){

var model = _dereq_('./model');
var viewModel = _dereq_('./viewModel');
var controllerViewModel = _dereq_('./controllerViewModel');
var mixin = _dereq_('./mixin');

var page = _dereq_('page');

var utils = _dereq_('./utils');
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

var IMVVMClass = {
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
        key;

      if('__processedSpec__' in this.originalSpec){
        return this.originalSpec.__processedSpec__;
      }

      for(key in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(key)){
          if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
            //assume it is a descriptor
            this.originalSpec[key].enumerable = true;
            if('viewModel' in this.originalSpec[key]) {
              viewModels[key] = this.originalSpec[key].viewModel;
              delete this.originalSpec[key].viewModel;
              delete this.originalSpec[key].set;
            } else {
              if('aliasFor' in this.originalSpec[key]){
                aliases[this.originalSpec[key].aliasFor] = key;
                delete this.originalSpec[key].aliasFor;
              }

              if('kind' in this.originalSpec[key]){
                if(this.originalSpec[key].kind === 'pseudo'){
                  this.originalSpec[key].enumerable = false;
                } else if (this.originalSpec[key].kind === 'instance' ||
                  this.originalSpec[key].kind === 'array') { //'instance' || 'array'
                  autoFreeze.push({fieldName: key, kind: this.originalSpec[key].kind});
                } else if (this.originalSpec[key].kind === 'static') {
                  hasStatic = true;
                  statics[key] = void(0);
                } else if (this.originalSpec[key].kind === 'uid') {
                  //Don't do anything as yet
                } else {
                  throw new TypeError('"'+this.originalSpec[key].kind +'" '+
                    'is not a valid "kind" value. Please review field "' + key + '".');
                }
                delete this.originalSpec[key].kind;
              }
            }
            descriptor[key] = this.originalSpec[key];
          } else {
            if(key !== 'getInitialState' && key !== 'getWatchedState' &&
              key !== 'getRoutes'){
              proto[key] = this.originalSpec[key];
            }
          }
        }
      }

      if(!!Object.keys(viewModels).length){
        this.originalSpec.getViewModels = function(){
          return viewModels;
        }
      }

      this.originalSpec.__processedSpec__ = {
        descriptor: descriptor,
        proto: proto,
        originalSpec: this.originalSpec || {},
        freezeFields: autoFreeze,
        aliases: aliases,
        statics: statics,
        hasStatic: hasStatic
      };

      return this.originalSpec.__processedSpec__;
    };

    return ConvenienceConstructor;
  },
};

modelClassConstructor = IMVVMClass.createClass.bind(this, ModelBase, 'Model');
viewModelClassConstructor = IMVVMClass.createClass.bind(this, ViewModelBase, 'ViewModel');
controllerViewModelClassConstructor = IMVVMClass.createClass.bind(this, ControllerViewModelBase, 'ControllerViewModel');

module.exports = {
  createModel: modelClassConstructor, // deprecated
  createModelClass: modelClassConstructor,
  createMClass: modelClassConstructor,
  createViewModel: viewModelClassConstructor, // deprecated
  createVMClass: viewModelClassConstructor,
  createViewModelClass: viewModelClassConstructor,
  createDomainViewModel: controllerViewModelClassConstructor, // deprecated
  createControllerViewModelClass: controllerViewModelClassConstructor,
  createCVMClass: controllerViewModelClassConstructor,
  mixin: mixin,
  extend: extend,
  page: page
};

},{"./controllerViewModel":3,"./mixin":5,"./model":6,"./utils":8,"./viewModel":9,"page":2}],5:[function(_dereq_,module,exports){

var core = _dereq_('./stateController');
var __NAMESPACE__ = '__IMVVM__';

var mixin = {
	main: {
		stateChangeHandler: function(dataContext){
      this.setState({dataContext: dataContext});
	  },
		getInitialState: function(){
      var dataContext;
      var enableUndo = false;

      if(!('controllerViewModel' in this.props)){
        if('domainModel' in this.props){
          controllerViewModel = this.props.domainModel;
          new TypeError('Please rename the "domainModel" prop in React.renderComponent to "controllerViewModel"');
        }
        new TypeError('Please assign the ControllerViewModel to the "controllerViewModel" prop in React.renderComponent');
      }

      if('enableUndo' in this.props){
        enableUndo = this.props.enableUndo;
      }

			dataContext = core.getInitialState(__NAMESPACE__, this.props.controllerViewModel,
				this.stateChangeHandler, enableUndo);

			return {dataContext: dataContext};
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
			path = path.replace(IMVVM.page.base(), '');
			if (IMVVM.page.base() && orig == path ||
				el.href === el.baseURI + el.search + (el.hash || '')) {
					return;
				}

			IMVVM.page.show(orig);
		}
	},
	mediaQuery: {
		closureFunc: function(id, mql, initializing){
      (function(){
        this.state.dataContext.mediaChangeHandler.call(this.state.dataContext, id, mql, initializing);
      }.bind(this))();
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
                mql.addListener(this.closureFunc.bind(this, id[1]));
                if(initializing){
                  this.closureFunc(id[1], mql, initializing);
                } else {
                  this.closureFunc(mql);
                }
              }
            }
          }
        }
      }
    }
	}
};

module.exports = mixin;

},{"./stateController":7}],6:[function(_dereq_,module,exports){

var utils = _dereq_('./utils');
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

},{"./utils":8}],7:[function(_dereq_,module,exports){
var page = _dereq_('page');
var utils = _dereq_('./utils');
var extend = utils.extend;
var updateStatic = utils.updateStatic;

exports.getInitialState = function(appNamespace, controllerViewModel, stateChangeHandler, enableUndo) {

	var ApplicationDataContext,
		appState = {},
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
		routingEnabled = false,
		routeHash = {},
		routeMapping = {},
		routePath,
		external = false,
		internal = false;

	var appStateChangeHandler = function(caller, newState, newAppState, forget, callback, delay) {

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
			willUndo = false;

    if(arguments.length < 2){
      newState = appState;
    }

    if(typeof forget === 'function'){
    	delay = callback;
      callback = forget;
      forget = false;
    } else if(typeof newAppState === 'function'){
    	delay = forget;
			callback = newAppState;
			newAppState = {};
		} else if (typeof newAppState === 'boolean'){
      forget = newAppState;
      newAppState = {};
    }

    if(forget === void(0)){
    	forget = false;
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
					appState = new ApplicationDataContext(nextState, prevState, redoState,
						enableUndo, routingEnabled, nextState.path !== appState.path,
						!external || nextState.pageNotFound, forget);

	        calledBack = true;
	        if(!!delay){
						window.setTimeout(function(){
							callback(void(0), appState);
			      }, delay);
					} else {
						callback(void(0), appState);
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
				if(caller === appNamespace){
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
					nextState[transientStateKeys[keyIdx]] = extend(appState[transientStateKeys[keyIdx]], transientState[transientStateKeys[keyIdx]]);
					nextState[transientStateKeys[keyIdx]] = new dataContexts[transientStateKeys[keyIdx]](nextState[transientStateKeys[keyIdx]]);
				} else {
					nextState[transientStateKeys[keyIdx]] = transientState[transientStateKeys[keyIdx]];
				}
			};

			processedState = extend(processedState, nextState);

			//Triggers
			nextState = extend(appState, processedState);

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
											subscribers[subscriber].call(appState[subscriber],
											nextState[transientStateKeys[keyIdx]][watchedField],
											appState[transientStateKeys[keyIdx]][watchedField],
											watchedField, transientStateKeys[keyIdx],
											nextState.path, appState.path));
									}
								}
							}
						}
					}
				}
			};
			if(!!Object.keys(transientState).length){
				appStateChangeHandler(void(0), {}, transientState, forget, callback, delay);
				return;
			}
			//Link Phase
			processedStateKeys = Object.keys(processedState);
			processedStateKeysLen = processedStateKeys.length - 1;
			for (keyIdx = processedStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(caller === appNamespace && (appNamespace in links)){
					if(processedStateKeys[keyIdx] in links[appNamespace]){
						for(dataContext in links[appNamespace][processedStateKeys[keyIdx]]){
							if(links[appNamespace][processedStateKeys[keyIdx]].hasOwnProperty(dataContext)){
								nextState[dataContext].state[links[appNamespace][processedStateKeys[keyIdx]][dataContext]] =
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

			if(appState.canRevert && calledBack){
				prevState = appState.previousState;
			} else if(hasStatic && staticState._staticUpdated && staticState._onlyStatic){
        if(appState.canRevert){
        	prevState = appState.previousState;
        }
        if(appState.canAdvance){
        	redoState = appState.nextState;
        }
      } else {
				prevState = appState;
			}
		}

		if(!!prevState){
			Object.freeze(prevState);
		}

		//check the paths to see of there has been an path change
		pushStateChanged = nextState.path !== appState.path;

		try {
			//Add dataContextWillUpdate
      if(willUndo){
        nextState = extend(nextState, {dataContextWillUpdate: newState.state.dataContextWillUpdate});
      } else {
        nextState = extend(nextState, {dataContextWillUpdate: processedState});
      }

			appState = new ApplicationDataContext(nextState, prevState, redoState,
			enableUndo, routingEnabled, pushStateChanged,
			!external || nextState.pageNotFound, forget);	

			Object.freeze(appState);
			Object.freeze(appState.state);

			if(typeof callback === 'function'){
				calledBack = true;
				if(!!delay){
					window.setTimeout(function(){
						callback(void(0), appState);
		      }, delay);
				} else {
					callback(void(0), appState);
					return;
				}
			}
		} catch(e) {
			if(typeof callback === 'function'){
				callback(e);
				return;
			}
		}

		calledBack = false;
		transientState = {};
		processedState = {};
	
    //All the work is done! -> Notify the View
    stateChangeHandler(appState);

		// Internal call routing
		if(routingEnabled && appState.pushState){
			if(('path' in appState) && !external){
				internal = true;
				if(pushStateChanged && !appState.forceReplace){
					page(appState.path);
				} else {
					page.replace(appState.path);
				}
			}
			external = false;
		}
	};

	//Initialize Application Data Context
	ApplicationDataContext = controllerViewModel.call(this, appStateChangeHandler.bind(this, appNamespace));
	appState = new ApplicationDataContext(void(0), void(0), void(0), enableUndo, routingEnabled);
  appState.state = appState.state || {};

	domain = appState.constructor.originalSpec.getViewModels();
	delete appState.constructor.originalSpec.getViewModels;

	//Initialize all dataContexts
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			dataContexts[viewModel] = domain[viewModel].call(this, appStateChangeHandler.bind(this, viewModel));
			appState.state[viewModel] = new dataContexts[viewModel](appState.state[viewModel], true);
    }
  }

  //Store links
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			if('getWatchedState' in appState[viewModel].constructor.originalSpec){
				watchedState = appState[viewModel].constructor.originalSpec.getWatchedState();
				for(watchedItem in watchedState){
					if(watchedState.hasOwnProperty(watchedItem)){
						if(watchedItem in domain || watchedItem in appState){
							if('alias' in watchedState[watchedItem]){
								if(!(viewModel in links)){
									links[viewModel] = {};
								}
								links[viewModel][watchedItem] = watchedState[watchedItem].alias;

								if(!(watchedItem in domain)){
									if(!(appNamespace in links)){
										links[appNamespace] = {};
									}
									if(!(viewModel in links[appNamespace])){
										links[appNamespace][watchedItem] = {};
									}
									links[appNamespace][watchedItem][viewModel] = watchedState[watchedItem].alias;
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
					appState[viewModel].state[links[viewModel][link]] = appState[link];
			  }
			}
		}
	}

	//reinitialize with all data in place
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			appState.state[viewModel] =
				new dataContexts[viewModel](appState.state[viewModel]);

			if('getRoutes' in appState[viewModel].constructor.originalSpec){
				routingEnabled = true;
				routeHash = appState[viewModel].constructor.originalSpec.getRoutes();
				for(routePath in routeHash){
					if(routeHash.hasOwnProperty(routePath)){
						routeMapping[routeHash[routePath].path] = routeHash[routePath].handler;
						page(routeHash[routePath].path, function(dataContextName, route,
								pathKey, ctx){
							external = true;
							if(!internal) {
								if(appState.canRevert && appState.pageNotFound){
                  ctx.rollbackRequest = true;
									ctx.revert = function(){
                    this.revert.bind(this);
                    this.setState({},{path:ctx.path});
                  }.bind(appState);
                }
								routeMapping[route].call(appState[dataContextName], ctx.params,
								ctx.path, pathKey, ctx);
							}
							internal = false;
						}.bind(this, viewModel, routeHash[routePath].path, routePath));
					}
				}
				delete appState[viewModel].constructor.originalSpec.getRoutes;
			}
    }
  }

	appState = new ApplicationDataContext(appState, void(0), void(0),
			enableUndo, routingEnabled);

	if(routingEnabled){
		//Setup 'pageNotFound' route
		page(function(ctx){
			external = true;
			appState.setState({'pageNotFound':true});
			internal = false;
		});
		//Initilize first path
		internal = true;
		page.replace(appState.path);
		page.start({click: false, dispatch: false});
		external = false;
	}

	hasStatic = appState.constructor.originalSpec.__processedSpec__.hasStatic;
	if(hasStatic){
		staticState = updateStatic(appState.constructor.originalSpec.__processedSpec__.statics, appState.state);
	}

	if('dataContextWillInitialize' in appState.constructor.originalSpec){
		appState.constructor.originalSpec.dataContextWillInitialize.call(appState);
		delete appState.constructor.originalSpec.dataContextWillInitialize;
	}

  for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			if('dataContextWillInitialize' in appState[viewModel].constructor.originalSpec){
				appState[viewModel].constructor.originalSpec.dataContextWillInitialize.call(appState[viewModel]);
				delete appState[viewModel].constructor.originalSpec.dataContextWillInitialize;
			}
		}
	}

  Object.freeze(appState.state);
  Object.freeze(appState);
  return appState;

};
},{"./utils":8,"page":2}],8:[function(_dereq_,module,exports){

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
  }
  
};

module.exports = utils;
},{}],9:[function(_dereq_,module,exports){

var utils = _dereq_('./utils');
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

                tempModel.__proto__.setState = function(state, callback){ //callback may be useful for DB updates
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
      return ViewModelClass;
    }
  }
};

module.exports = ViewModel;

},{"./utils":8}]},{},[1])
(1)
});