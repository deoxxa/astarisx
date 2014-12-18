!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Astarisx=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Astarisx = require('./src/core.js');
require('./lib/custom-event-polyfill');

module.exports = Astarisx;

},{"./lib/custom-event-polyfill":2,"./src/core.js":6}],2:[function(require,module,exports){
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
  /* globals require, module */

/**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = window.history.location || window.location;

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
  * HashBang option
  */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
    // show <path> with [state]
    } else if ('string' == typeof path) {
      'string' === typeof fn
        ? page.redirect(path, fn)
        : page.show(path, fn);
    // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path){
    if (0 === arguments.length) return base;
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
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!'))
      ? location.hash.substr(2) + location.search
      : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function(){
    if (!running) return;
    running = false;
    window.removeEventListener('click', onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
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
    if (false !== ctx.handled) ctx.pushState();
    return ctx;
  };

  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {String} from - if param 'to' is undefined redirects to 'from'
   * @param {String} [to]
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function (e) {
        setTimeout(function() {
          page.replace(to);
        },0);
      });
    }

    // Wait for the push state and replace it with another
    if('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
          page.replace(from);
      },0);
    }
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
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx){
    var prev = prevContext;
    var i = 0;
    var j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
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
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!','');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path == 'function') {
      return page.exit('*', path);
    };

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
  * Remove URL encoding from the given `str`.
  * Accommodates whitespace in both x-www-form-urlencoded
  * and regular percent-encoded form.
  *
  * @param {str} URL component to decode
  */
  function decodeURLEncodedURIComponent(str) {
    return decodeURIComponent(str.replace(/\+/g, ' '));
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
    path = decodeURLEncodedURIComponent(path);
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i
      ? path.slice(i + 1)
      : '';
    this.pathname = ~i
      ? path.slice(0, i)
      : path;
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
    history.pushState(this.state
      , this.title
      , hashbang && this.path !== '/'
        ? '#!' + this.path
        : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function(){
    history.replaceState(this.state
      , this.title
      , hashbang && this.path !== '/'
        ? '#!' + this.path
        : this.canonicalPath);
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
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options.sensitive,
      options.strict);
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
    var keys = this.keys,
        qsIndex = path.indexOf('?'),
        pathname = ~qsIndex
          ? path.slice(0, qsIndex)
          : path,
        m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];

      var val = 'string' === typeof m[i]
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

    // Ignore if tag has a "download" attribute
    if (el.getAttribute("download")) return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (el.pathname === location.pathname && (el.hash || '#' === link)) return;

    // Check for mailto: in the href
    if (link && link.indexOf("mailto:") > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;

    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // same page
    var orig = path;

    path = path.replace(base, '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which
      ? e.button
      : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

},{"path-to-regexp":4}],4:[function(require,module,exports){
/**
 * Expose `pathtoRegexp`.
 */
module.exports = pathtoRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match already escaped characters that would otherwise incorrectly appear
  // in future matches. This allows the user to escape special characters that
  // shouldn't be transformed.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that should always be escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
var attachKeys = function (re, keys) {
  re.keys = keys;

  return re;
};

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array should be passed in, which will contain the placeholder key
 * names. For example `/user/:id` will then contain `["id"]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 keys
 * @param  {Object}                options
 * @return {RegExp}
 */
function pathtoRegexp (path, keys, options) {
  if (keys && !Array.isArray(keys)) {
    options = keys;
    keys = null;
  }

  keys = keys || [];
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var index = 0;

  if (path instanceof RegExp) {
    // Match all capturing groups of a regexp.
    var groups = path.source.match(/\((?!\?)/g) || [];

    // Map all the matches to their numeric keys and push into the keys.
    keys.push.apply(keys, groups.map(function (match, index) {
      return {
        name:      index,
        delimiter: null,
        optional:  false,
        repeat:    false
      };
    }));

    // Return the source back to the user.
    return attachKeys(path, keys);
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value) {
      return pathtoRegexp(value, keys, options).source;
    });

    // Generate a new regexp instance by joining all the parts together.
    return attachKeys(new RegExp('(?:' + path.join('|') + ')', flags), keys);
  }

  // Alter the path string into a usable regexp.
  path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
    // Avoiding re-escaping escaped characters.
    if (escaped) {
      return escaped;
    }

    // Escape regexp special characters.
    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push({
      name:      key || index++,
      delimiter: prefix || '/',
      optional:  optional,
      repeat:    repeat
    });

    // Escape the prefix character.
    prefix = prefix ? '\\' + prefix : '';

    // Match using the custom capturing group, or fallback to capturing
    // everything up to the next slash (or next period if the param was
    // prefixed with a period).
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    // Allow parameters to be repeated more than once.
    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    // Allow a parameter to be optional.
    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  });

  // Check whether the path ends in a slash as it alters some match behaviour.
  var endsWithSlash = path[path.length - 1] === '/';

  // In non-strict mode we allow an optional trailing slash in the match. If
  // the path to match already ended with a slash, we need to remove it for
  // consistency. The slash is only valid at the very end of a path match, not
  // anywhere in the middle. This is important for non-ending mode, otherwise
  // "/test/" will match "/test//route".
  if (!strict) {
    path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
  }

  // In non-ending mode, we need prompt the capturing groups to match as much
  // as possible by using a positive lookahead for the end or next path segment.
  if (!end) {
    path += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + path + (end ? '$' : ''), flags), keys);
};

},{}],5:[function(require,module,exports){

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
        this.setState(this.$previousState, !!this.$previousState ? this : void(0), true, callback, void(0), true);
      };

      desc.proto.advance = function(callback){
        if(this.$canAdvance){
          this.setState(this.$nextState, this.$nextState.$nextState, callback);
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
},{"./utils":10}],6:[function(require,module,exports){
var model = require('./model');
var viewModel = require('./viewModel');
var controllerViewModel = require('./controllerViewModel');
var mixin = require('./mixin');

var page = require('page');

var utils = require('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;
var createMergedResultFunction = utils.createMergedResultFunction;
var createChainedFunction = utils.createChainedFunction;
var uuid = utils.uuid;


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
        autoFreeze,
        aliases,
        statics,
        clientFields,
        hasStatic = false,
        key,
        mixinSpec,
        tempDesc = {},
        validations;

      if('__processedSpec__' in this.originalSpec){
        return this.originalSpec.__processedSpec__;
      }
      var tempFieldsSpec = {};
      var tempMergeMethodsSpec = {}, tempMethodsSpec = {};
      // Mixin addons into the originalSpec
      if('mixins' in this.originalSpec){
        for (var i = 0; i < this.originalSpec.mixins.length; i++) {
          mixinSpec = this.originalSpec.mixins[i];
          for (var prop in mixinSpec) {
            if (!mixinSpec.hasOwnProperty(prop)) {
              continue;
            }
            
            //If field is getter or setter and is not defined in originalSpec
            //then add it to tempFieldsSpec. originalSpec wins otherwise last prop wins.
            if(('get' in mixinSpec[prop] || 'set' in mixinSpec[prop]) && !(prop in this.originalSpec)){
              tempFieldsSpec[prop] = mixinSpec[prop];
            } else {
              //must be a function.
              //functions starting with get return Objects. The output will be merged
              //otherwise the function is chained
              if(prop.substring(0, 3) === 'get'){
                tempMergeMethodsSpec[prop] = tempMergeMethodsSpec[prop] || [];
                tempMergeMethodsSpec[prop].push(mixinSpec[prop]);
              } else {
                tempMethodsSpec[prop] = tempMethodsSpec[prop] || [];
                tempMethodsSpec[prop].push(mixinSpec[prop]);
              }
            }
          }
        }
        for(var mergeMethod in tempMergeMethodsSpec){
          if(tempMergeMethodsSpec.hasOwnProperty(mergeMethod)){
            if(tempMergeMethodsSpec[mergeMethod].length === 1 && !(mergeMethod in this.originalSpec)){
              this.originalSpec[mergeMethod] = tempMergeMethodsSpec[mergeMethod][0];
            } else {
              if(mergeMethod in this.originalSpec){
                tempMergeMethodsSpec[mergeMethod].push(this.originalSpec[mergeMethod]);
              }
              this.originalSpec[mergeMethod] = createMergedResultFunction(tempMergeMethodsSpec[mergeMethod]);
            }
          }
        }
        for(var method in tempMethodsSpec){
          if(tempMethodsSpec.hasOwnProperty(method)){
            if(tempMethodsSpec[method].length === 1 && !(method in this.originalSpec)){
              //If there is only 1 method then just attach to originalSpec
              //This is used when the function returns something as the
              //createChainedFunction ignores the return value. So methods
              //that return a value must be unique;
              this.originalSpec[method] = tempMethodsSpec[method][0];
            } else {
              if(method in this.originalSpec){
                tempMethodsSpec[method].push(this.originalSpec[method]);
              }
              this.originalSpec[method] = createChainedFunction(tempMethodsSpec[method]);
            }
          }
        }
        //Then merge temp fields into originalSpec
        this.originalSpec = extend(this.originalSpec, tempFieldsSpec);
        delete this.originalSpec.mixins;
      }

      
      for(key in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(key)){
          if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
            //assume it is a descriptor and clone
            tempDesc[key] = extend(this.originalSpec[key]);
            if(!('enumerable' in tempDesc[key])){
              if(proto.constructor.classType === "Model" && key[0] === "_"){
                tempDesc[key].enumerable = false;
                clientFields = clientFields || [];
                clientFields.push(key);
              } else {
                tempDesc[key].enumerable = true;
              }
            }
            if(proto.constructor.classType === "ControllerViewModel" && ('viewModel' in tempDesc[key])) {
              //ensure that we don't use the reseved keys
              if(key !== '*' && key !== '_*'){
                viewModels[key] = tempDesc[key].viewModel;
                //intercept the viewModel and add $dataContext field
                tempDesc[key].viewModel.originalSpec.$dataContext = (function(dataContextName){
                  return {
                    kind: 'pseudo',
                    get: function(){
                      return dataContextName;
                    }
                  }
                })(key);
              }
              delete tempDesc[key].viewModel;
              delete tempDesc[key].set;
            } else {
              if(proto.constructor.classType === "Model" && ('aliasFor' in tempDesc[key])){
                aliases = aliases || {};
                aliases[tempDesc[key].aliasFor] = key;
                delete tempDesc[key].aliasFor;
              }

              if(proto.constructor.classType === "Model" && ('validate' in tempDesc[key]) && 
                Object.prototype.toString.call(tempDesc[key].validate) === '[object Object]'){
                //delete setter. just in case
                delete tempDesc[key].validate.set;
                descriptor['$'+key + 'Valid'] = tempDesc[key].validate;
                validations = validations || [];
                validations.push(tempDesc[key].validate.get);
                delete tempDesc[key].validate;
              }

              if('kind' in tempDesc[key]){
                if(tempDesc[key].kind === 'pseudo'){
                  tempDesc[key].enumerable = false;
                } else if ((proto.constructor.classType !== "ControllerViewModel" && tempDesc[key].kind === 'instance') ||
                  tempDesc[key].kind === 'object' ||
                  tempDesc[key].kind === 'object:freeze' ||
                  tempDesc[key].kind === 'object:deepFreeze' ||
                  tempDesc[key].kind === 'array' ||
                  tempDesc[key].kind === 'array:freeze' ||
                  tempDesc[key].kind === 'array:deepFreeze') {
                  
                  autoFreeze = autoFreeze || [];
                  autoFreeze.push({fieldName: key, kind: tempDesc[key].kind});

                } else if (proto.constructor.classType === "ControllerViewModel" && tempDesc[key].kind === 'static') {
                  statics = statics || {};
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

      if(proto.constructor.classType === "Model"){      
        //add allValid check
        if(validations !== void(0)){
          var validationsLen = validations.length;
          if(validationsLen > 0){
            descriptor.$allValid = { 
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

        //add $dirty field to models
        descriptor.$dirty = {
          get: function() {
            return this.$state.$dirty === void(0) ? false : this.$state.$dirty;
          }
        };

        proto.__clientFields = function(){
          return clientFields || [];
        };

      }

      this.originalSpec.__processedSpec__ = {
        descriptor: descriptor,
        proto: proto,
        originalSpec: this.originalSpec || {},
        freezeFields: autoFreeze,
        aliases: aliases,
        statics: statics,
        clientFields: clientFields,
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
  uuid: uuid,
  page: page
};

},{"./controllerViewModel":5,"./mixin":7,"./model":8,"./utils":10,"./viewModel":11,"page":3}],7:[function(require,module,exports){
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

},{"./stateManager":9}],8:[function(require,module,exports){

var utils = require('./utils');
var extend = utils.extend;
var isObject = utils.isObject;
var isArray = utils.isArray;
var freeze = utils.freeze;
var deepFreeze = utils.deepFreeze;

var Model = {
  Mixin: {
    construct: function(stateChangeHandler){

      var desc = this.getDescriptor();

      var ModelClass = function(nextState, extendState) {
        var freezeFields = desc.freezeFields,
          fld,
          model = Object.create(desc.proto, desc.descriptor);

        nextState = extend(nextState, extendState);

        if(desc.aliases !== void(0)){
          for(var aliasFor in desc.aliases){
            if(desc.aliases.hasOwnProperty(aliasFor) && (aliasFor in nextState)){
              nextState[desc.aliases[aliasFor]] = nextState[aliasFor];
              delete nextState[aliasFor];
            }
          }
        }

        Object.defineProperty(model, '$state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if('getInitialState' in desc.originalSpec){
          nextState = extend(nextState, desc.originalSpec.getInitialState.call(model));
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
            } else if(freezeFields[fld].kind !== 'instance'){
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

        Object.defineProperty(model, '$state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: Object.freeze(nextState)
        });

        if(stateChangeHandler){
          Object.defineProperty(model, '_stateChangeHandler', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: (function(){
              return stateChangeHandler;
            })()
          });
        }
        return Object.freeze(model);
      };
      return ModelClass;
    }
  }
};

module.exports = Model;
},{"./utils":10}],9:[function(require,module,exports){
var page = require('page');
var utils = require('./utils');
var extend = utils.extend;
var updateStatic = utils.updateStatic;
var uuid = utils.uuid;
var isArray = utils.isArray;
var isControllerViewModel = utils.isControllerViewModel;
var ApplicationDataContext;

var StateManager = function(component, appCtx/*, initCtxArgs... */) {
	
	var namespace = uuid(),
		controllerViewModel,
		stateChangeHandler,
		viewKey,
		node,
		enableUndo,
		routingEnabled,
		staticState = {}, //Only applicable to ControllerViewModel
		hasStatic = false, //Only applicable to ControllerViewModel
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
		stateMgr = this;

	//Ensures that UI shouldComponentUpdate will not be overridden
	var shouldComponentUpdateIsNull = component.shouldComponentUpdate === null;
	var initCtxArgs = Array.prototype.slice.call(arguments, 2);

	stateMgr.appState = {};
	stateMgr.listeners = {};
	stateMgr.handlers = {};
	stateMgr.hasListeners = false;		

	controllerViewModel = appCtx.controllerViewModel;
	enableUndo = 'enableUndo' in appCtx ? appCtx.enableUndo : false;
	routingEnabled = 'enableRouting' in appCtx ? appCtx.enableRouting : false;
	stateMgr.signInUrl = appCtx.signInUrl;

	stateChangeHandler = function(applicationDataContext){
    	component.setState({appContext: applicationDataContext});
  };

  notifyViews = function(notify){
  	var temp;
		if(stateMgr.hasListeners){
			stateChangeEvent = new CustomEvent("stateChange", {
				"detail": {
					"appContext": stateMgr.appState
				}
			});
			passiveStateChangeEvent = new CustomEvent("stateChange", {
				"detail": {
					"appContext": stateMgr.appState,
					"shouldUpdate": false
				}
			});
			
			//Notify views of a state change. If a view is specified in
			//$notify then update specified views. Otherwise only notify the other 
			//views without rendering them.
		  if(notify){
				if(isArray(notify)){
		  		temp = {};
		  		//notify specific views
          notify.forEach(function (viewKey) {
          	if(viewKey === "*"){
          		//Ensure UI IS rendered
	        		if(shouldComponentUpdateIsNull){
					    	component.shouldComponentUpdate = function(){
					    		return true;
					    	}
				    	};
							stateChangeHandler(stateMgr.appState);
          	} else if(viewKey in stateMgr.listeners) {
              stateMgr.listeners[viewKey].dispatchEvent(stateChangeEvent);
            }
            temp[viewKey] = true;
          });
	        //notify other views but do not render component
	        if(!('*' in temp)){
	        	//Ensure UI IS NOT rendered
	        	if(shouldComponentUpdateIsNull){
				    	component.shouldComponentUpdate = function(){
				    		return false;
				    	}
			    	};
	        	stateChangeHandler(stateMgr.appState, false);
	        }
			    for(var k in stateMgr.listeners){
			  		if(stateMgr.listeners.hasOwnProperty(k) && !(k in temp)){
			  			stateMgr.listeners[k].dispatchEvent(passiveStateChangeEvent);
			  		}
			  	}
		  		temp = void(0);
        } else {
					if(notify === "*"){
						//Ensure UI IS rendered
	        	if(shouldComponentUpdateIsNull){
				    	component.shouldComponentUpdate = function(){
				    		return true;
				    	}
			    	};
						stateChangeHandler(stateMgr.appState);
					} else {
						//Ensure UI IS NOT rendered
	        	if(shouldComponentUpdateIsNull){
				    	component.shouldComponentUpdate = function(){
				    		return false;
				    	}
			    	};
						stateChangeHandler(stateMgr.appState, false);
					}
					for(var k2 in stateMgr.listeners){
			  		if(stateMgr.listeners.hasOwnProperty(k2)){
			  			if(k2 === notify){
								stateMgr.listeners[k2].dispatchEvent(stateChangeEvent);
			  			} else {
			  				stateMgr.listeners[k2].dispatchEvent(passiveStateChangeEvent);
			  			}
			  		}
			  	}
				}
			} else {
				//Ensure UI IS rendered
	      if(shouldComponentUpdateIsNull){
		    	component.shouldComponentUpdate = function(){
		    		return true;
		    	}
	    	};
				// Notify all the views
		    stateChangeHandler(stateMgr.appState);
		    for(var k3 in stateMgr.listeners){
		  		if(stateMgr.listeners.hasOwnProperty(k3)){
		  			stateMgr.listeners[k3].dispatchEvent(stateChangeEvent);
		  		}
		  	}
			}
			stateChangeEvent = void(0);
			passiveStateChangeEvent = void(0);
		} else {
			//Ensure UI IS rendered
	    if(shouldComponentUpdateIsNull){
	    	component.shouldComponentUpdate = function(){
	    		return true;
	    	}
    	};
			stateChangeHandler(stateMgr.appState);
		}
  };

	var appStateChangeHandler = function(caller, newState, newAppState, remember, callback, delay, revert) {
		var nextState = {},
      prevState = void(0),
      redoState = void(0),
      newStateKeys,
      keyIdx,
      transientStateKeysLen,
      transientStateKeys,
      dataContext,
      dataContext2,
      linkedDataContext,
      processedStateKeys = [],
      processedStateKeysLen,
      watchedField,
      subscribers,
      subscriber,
      pushStateChanged = false,
      willUndo = false,
      stateChangeEvent,
      passiveStateChangeEvent;

    //If reverting to previousState remove any processedState from the prior call
    //This occurs because of the callback batching process
    processedState = revert ? void(0) : processedState;

		//This covers setState with no args or with void(0) or with {} as argument
    if(arguments.length <= 2 || (typeof newState === 'function')){
    	if(newState === void(0) || !!!Object.keys(newState).length || (typeof newState === 'function')){
				calledBack = false;
				notifyViews(processedState.$notify);
				transientState = {};
				processedState = {};
				if (typeof newState === 'function'){ //must be callback
					if(newAppState !== void(0) && !isNaN(newAppState)){
						window.setTimeout(function(){
						  if(caller === namespace){
		            newState.call(stateMgr.appState, void(0), stateMgr.appState);
		          } else {
		            newState.call(stateMgr.appState[caller], void(0), stateMgr.appState);
		          }
			      }, newAppState);
					} else {
					  if(caller === namespace){
	            newState.call(stateMgr.appState, void(0), stateMgr.appState);
	          } else {
	            newState.call(stateMgr.appState[caller], void(0), stateMgr.appState);
	          }
					}
	    	}
	    	return;    		
    	}
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

		newAppState = newAppState || {};

		//Check to see if appState is a ready made $state object. If so
		//pass it straight to the stateChangeHandler. If a callback was passed in
		//it would be assigned to newState
		if(isControllerViewModel(newState)) {
			willUndo = true;
			nextState = extend(newState, staticState);
			prevState = newState.$previousState;
			redoState = newAppState;
			//Need to reset ViewModel with instance object so that setState is associated with
			//the current ViewModel. This reason this occurs is that when a ViewModel is created it
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
							nextState[dataContext].$state[links[dataContext][linkedDataContext]] =
								(linkedDataContext in domain) ? extend(nextState[linkedDataContext]) :
									nextState[linkedDataContext];
						}
					}
				}
			}

			if(typeof callback === 'function'){
				try {
					stateMgr.appState = new ApplicationDataContext(nextState, prevState, redoState,
					enableUndo, routingEnabled, nextState.$path !== stateMgr.appState.$path,
					!external || nextState.$pageNotFound, remember);

	        calledBack = true;
	        if(delay !== void(0) && !isNaN(delay)){
						window.setTimeout(function(){
						  if(caller === namespace){
                callback.call(stateMgr.appState, void(0), stateMgr.appState);
              } else {
                callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
              }
			      }, delay);
					} else {
					  if(caller === namespace){
              callback.call(stateMgr.appState, void(0), stateMgr.appState);
            } else {
              callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
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
			//If newAppState included the current caller dataContext then newAppState stomped on
			//nextState. Below I merge the current caller state into one object then use that
			//to extend the transientState 
			if(caller !== void(0) && caller in newAppState){
				var mergedNextState = {};
				mergedNextState[caller] = extend(nextState[caller], newAppState[caller]);
				transientState = extend(newAppState, mergedNextState, transientState);
			} else {
				transientState = extend(newAppState, nextState, transientState);
			}
			transientStateKeys = Object.keys(transientState);
			if(transientStateKeys.length === 0){
				if(typeof callback === 'function'){
					calledBack = true;
					if(delay !== void(0) && !isNaN(delay)){
						window.setTimeout(function(){
						  if(caller === namespace){
		            callback.call(stateMgr.appState, void(0), stateMgr.appState);
		          } else {
		            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
		          }
			      }, delay);
					} else {
					  if(caller === namespace){
	            callback.call(stateMgr.appState, void(0), stateMgr.appState);
	          } else {
	            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
	          }
						return;
					}
				} else {
					return;
				}
			}

			transientStateKeysLen = transientStateKeys.length - 1;

			for (keyIdx = transientStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(transientStateKeys[keyIdx] in domain){
					nextState[transientStateKeys[keyIdx]] = extend(stateMgr.appState[transientStateKeys[keyIdx]], transientState[transientStateKeys[keyIdx]]);
					nextState[transientStateKeys[keyIdx]] = new dataContexts[transientStateKeys[keyIdx]](nextState[transientStateKeys[keyIdx]]);
				} else {
					nextState[transientStateKeys[keyIdx]] = transientState[transientStateKeys[keyIdx]];
				}
			};

			processedState = extend(processedState, nextState);

			//Triggers
			nextState = extend(stateMgr.appState, processedState);

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
													nextState[subscriber].$state[links[subscriber][dataContext]] =
														(dataContext in domain) ? extend(nextState[dataContext]) :
															nextState[dataContext];
												}
												if(dataContext in links){
													for(dataContext2 in links[dataContext]){
														if(links[dataContext].hasOwnProperty(dataContext2)){
															nextState[dataContext].$state[links[dataContext][dataContext2]] =
																(dataContext2 in domain) ? extend(nextState[dataContext2]) :
																	nextState[dataContext2];
														}
													}
												}
											}
										}
										transientState = extend(transientState,
											subscribers[subscriber].call(stateMgr.appState[subscriber],
											nextState[transientStateKeys[keyIdx]][watchedField],
											stateMgr.appState[transientStateKeys[keyIdx]][watchedField],
											watchedField, transientStateKeys[keyIdx],
											nextState.$path, stateMgr.appState.$path));
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
								nextState[dataContext].$state[links[namespace][processedStateKeys[keyIdx]][dataContext]] =
                  (processedStateKeys[keyIdx] in domain) ? extend(nextState[processedStateKeys[keyIdx]]) :
                        nextState[processedStateKeys[keyIdx]];
							}
							if(dataContext in links){
								for(dataContext2 in links[dataContext]){
									if(links[dataContext].hasOwnProperty(dataContext2)){
										nextState[dataContext].$state[links[dataContext][dataContext2]] =
											(dataContext2 in domain) ? extend(nextState[dataContext2]) :
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
								nextState[processedStateKeys[keyIdx]].$state[links[processedStateKeys[keyIdx]][dataContext]] =
									(dataContext in domain) ? extend(nextState[dataContext]) : nextState[dataContext];
							}
							if(dataContext in links){
								for(dataContext2 in links[dataContext]){
									if(links[dataContext].hasOwnProperty(dataContext2)){
										nextState[dataContext].$state[links[dataContext][dataContext2]] =
											(dataContext2 in domain) ? extend(nextState[dataContext2]) :
                        nextState[dataContext2];
									}
								}
							}
						}
					}
				}
	    }

			if(stateMgr.appState.$canRevert && calledBack){
				prevState = stateMgr.appState.$previousState;
			} else if(hasStatic && staticState._staticUpdated && staticState._onlyStatic){
        if(stateMgr.appState.$canRevert){
        	prevState = stateMgr.appState.$previousState;
        }
        if(stateMgr.appState.$canAdvance){
        	redoState = stateMgr.appState.$nextState;
        }
      } else {
				prevState = stateMgr.appState;
			}
		}

		if(!!prevState){
			Object.freeze(prevState);
		}

		//check the paths to see of there has been an path change
		pushStateChanged = nextState.$path !== stateMgr.appState.$path;

		try {
			//Add dataContextWillUpdate
      if(willUndo){
        nextState = extend(nextState, {$dataContextWillUpdate: newState.$state.$dataContextWillUpdate});
      } else {
        nextState = extend(nextState, {$dataContextWillUpdate: processedState});
      }

			stateMgr.appState = new ApplicationDataContext(nextState, prevState, redoState,
			enableUndo, routingEnabled, pushStateChanged,
			!external || nextState.$pageNotFound, remember);	

			Object.freeze(stateMgr.appState);
			Object.freeze(stateMgr.appState.$state);

			if(typeof callback === 'function'){
				calledBack = true;
				if(delay !== void(0) && !isNaN(delay)){
					window.setTimeout(function(){
					  if(caller === namespace){
	            callback.call(stateMgr.appState, void(0), stateMgr.appState);
	          } else {
	            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
	          }
		      }, delay);
				} else {
				  if(caller === namespace){
            callback.call(stateMgr.appState, void(0), stateMgr.appState);
          } else {
            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
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
		if(routingEnabled && stateMgr.appState.$pushState){
			if(('$path' in stateMgr.appState) && !external){
				internal = true;
				if(pushStateChanged && !stateMgr.appState.$forceReplace){
					page(stateMgr.appState.$path);
				} else {
					page.replace(stateMgr.appState.$path);
				}
			}
			external = false;
		}
		
		/***************/
		/* All the work is done! -> Notify the UI
		/* and any other mounted Views
		/***************/
		calledBack = false;
  	notifyViews(nextState.$notify);
		transientState = {};
		processedState = {};
	};
	/***************/
	/* Initialize Application Data Context
	/***************/
  try {
  	ApplicationDataContext = controllerViewModel.call(this, appStateChangeHandler.bind(this, namespace));
  	stateMgr.appState = new ApplicationDataContext(void(0), void(0), void(0), enableUndo, routingEnabled);
    stateMgr.appState.$state = stateMgr.appState.$state || {};
  } catch (e) { 
  	if (e instanceof TypeError) {
    	throw new TypeError('Please assign a ControllerViewModel to the "controllerViewModel" prop in React.renderComponent');
  	} else {
  		throw e;
  	}
  }

	domain = stateMgr.appState.constructor.originalSpec.getViewModels();
	delete Object.getPrototypeOf(stateMgr.appState).getViewModels;
	
	//Initialize all dataContexts
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			dataContexts[viewModel] = domain[viewModel].call(this, appStateChangeHandler.bind(this, viewModel));
			stateMgr.appState.$state[viewModel] = new dataContexts[viewModel](stateMgr.appState.$state[viewModel], true);
    }
  }

  //Store links
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			if('getWatchedState' in stateMgr.appState[viewModel].constructor.originalSpec){
				watchedState = stateMgr.appState[viewModel].constructor.originalSpec.getWatchedState();
				for(watchedItem in watchedState){
					if(watchedState.hasOwnProperty(watchedItem)){
						if(watchedItem in domain || watchedItem in stateMgr.appState){
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
					stateMgr.appState[viewModel].$state[links[viewModel][link]] = 
            (link in domain) ? extend(stateMgr.appState[link]) : stateMgr.appState[link];
			  }
			}
		}
	}

	//reinitialize with all data in place
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			stateMgr.appState.$state[viewModel] =
				new dataContexts[viewModel](stateMgr.appState.$state[viewModel]);

			if('getRoutes' in stateMgr.appState[viewModel].constructor.originalSpec){
				routeHash = stateMgr.appState[viewModel].constructor.originalSpec.getRoutes();
				for(routePath in routeHash){
					if(routeHash.hasOwnProperty(routePath)){
						routeMapping[routeHash[routePath].path] = routeHash[routePath].handler;
						page(routeHash[routePath].path, function(dataContextName, route,
								pathKey, ctx){
							external = true;
							if(!internal) {
								routeMapping[route].call(stateMgr.appState[dataContextName], ctx.params,
                stateMgr.appState,
								ctx.path, pathKey, ctx, ('show' in stateMgr.appState) ? stateMgr.appState.show.bind(stateMgr.appState): void(0));
							}
							internal = false;
						}.bind(this, viewModel, routeHash[routePath].path, routePath));
					}
				}
				delete Object.getPrototypeOf(stateMgr.appState[viewModel]).getRoutes;
    	}

    	//This is if astarisx-animate mixin is used
			if('getDisplays' in stateMgr.appState[viewModel].constructor.originalSpec){
				try {
					stateMgr.appState.addDisplays(stateMgr.appState[viewModel].constructor.originalSpec.getDisplays(), viewModel);
					delete Object.getPrototypeOf(stateMgr.appState[viewModel]).getDisplays;
				} catch (e) { 
			  	if (e instanceof TypeError) {
			    	throw new TypeError('Please ensure that Astarisx-Animate is mixed into the ControllerViewModel.');
			  	} else {
			  		throw e;
			  	}
			  }
			}
		}
  }

	//This is if astarisx-animate mixin is used
	if('getDisplays' in stateMgr.appState.constructor.originalSpec){
		stateMgr.appState.addDisplays(stateMgr.appState.constructor.originalSpec.getDisplays());
		delete Object.getPrototypeOf(stateMgr.appState).getDisplays;
	}
	delete Object.getPrototypeOf(stateMgr.appState).addDisplays;

	if('getTransitions' in stateMgr.appState.constructor.originalSpec){
		stateMgr.appState.addTransitions(stateMgr.appState.constructor.originalSpec.getTransitions());
		delete Object.getPrototypeOf(stateMgr.appState).getTransitions;
	}
	delete Object.getPrototypeOf(stateMgr.appState).addTransitions;

	stateMgr.appState = new ApplicationDataContext(stateMgr.appState, void(0), void(0),
			enableUndo, routingEnabled);

	if(routingEnabled){
		//Setup 'pageNotFound' route
		page(function(ctx){
			external = true;
			stateMgr.appState.setState({'$pageNotFound':true});
			internal = false;
		});
		//Initilize first path
		internal = true;
		page.replace(stateMgr.appState.$path);
		page.start({click: false, dispatch: false});
		external = false;
	}

	hasStatic = stateMgr.appState.constructor.getDescriptor().hasStatic;
	if(hasStatic){
		staticState = updateStatic(stateMgr.appState.constructor.getDescriptor().statics, stateMgr.appState.$state);
	}

  Object.freeze(stateMgr.appState.$state);
  Object.freeze(stateMgr.appState);

  stateChangeHandler(stateMgr.appState);
  if('dataContextWillInitialize' in stateMgr.appState.constructor.originalSpec){
    stateMgr.appState.constructor.originalSpec.dataContextWillInitialize.apply(stateMgr.appState, initCtxArgs);
    delete Object.getPrototypeOf(stateMgr.appState).dataContextWillInitialize;
  }

};

StateManager.prototype.currentState = function(){
  return this.appState;
};

StateManager.prototype.unmountView = function(component){
	var viewKey = component.props.$viewKey || component._rootNodeID;
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
		var viewKey = component.props.$viewKey || component._rootNodeID;
		var shouldUpdate;
		this.handlers[viewKey] = function(e){
			shouldUpdate = e.detail.shouldUpdate === void(0) ? true : e.detail.shouldUpdate;
			component.setState({appContext: e.detail.appContext});
			//Do not override shouldComponentUpdate if exists
			if(component.shouldComponentUpdate === null){
		    component.shouldComponentUpdate = function(){
		    	return shouldUpdate;
		    }
			}
		};
		var node = component.getDOMNode();
		// if node is null i.e. return 'null' from render(). then create a dummy element
		// to attach the event listener to
		this.listeners[viewKey] = !!node ? node : document.createElement("div");
  	this.listeners[viewKey].addEventListener("stateChange", this.handlers[viewKey]);
  	this.hasListeners = true;
}

StateManager.prototype.dispose = function(){
  
  var emptyState = new ApplicationDataContext(void(0), void(0), void(0), false, false);
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
			resetState[viewModel] = this.appState[viewModel].__dispose();
    }
  }
  resetState = extend(this.appState, emptyState, resetState);
	try {
  	this.appState = new ApplicationDataContext(resetState, void(0), void(0), false, false);
    this.appState.$state = this.appState.$state || {};
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
},{"./utils":10,"page":3}],10:[function(require,module,exports){
var toString = Object.prototype.toString;
var utils = {
  
  extend: function () {
    var newObj = {};
    for (var i = 0; i < arguments.length; i++) {
      var obj = arguments[i];
      if(typeof obj === 'function'){
        obj = obj.call(this);
      }
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = obj[key];
        }
      }
      if(utils.isObject(obj) && utils.isModel(obj) && ('__clientFields' in obj)){
        obj.__clientFields().forEach(function(fld){
          newObj[fld] = obj[fld];
        });
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

  createMergedResultFunction: function(funcArray) {
    return function mergedResult() {
      return utils.extend.apply(this, funcArray);
    };
  },

  createChainedFunction: function(funcArray) {
    return function chainedFunction() {
      for (var i = 0; i < funcArray.length; i++) {
        funcArray[i].apply(this, arguments);
      };
    };
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
  },
  isObject: function(o) {
    return toString.call(o) === '[object Object]';
  },
  isArray: function (o) {
    return toString.call(o) === '[object Array]';
  },
  isModel: function (o) {
    if(!utils.isObject(o)){
      return false;
    }
    return Object.getPrototypeOf(o).constructor.classType === "Model";
  },
  isViewModel: function (o) {
    if(!utils.isObject(o)){
      return false;
    }
    return Object.getPrototypeOf(o).constructor.classType === "ViewModel";
  },
  isControllerViewModel: function (o) {
    if(!utils.isObject(o)){
      return false;
    }
    return Object.getPrototypeOf(o).constructor.classType === "ControllerViewModel";
  },
  freeze: function(o) {
    if(utils.isObject(o)){
      if(!Object.isFrozen(o)){
        Object.freeze(o);
      }
      for (var k in o) {
        if(o.hasOwnProperty(k)){
          if(utils.isArray(o[k]) || utils.isObject(o[k])){
            Object.freeze(o[k]);
          }          
        }
      }
    } else if(utils.isArray(o)){
      if(!Object.isFrozen(o)){
        Object.freeze(o);
      }
      for (var i = o.length - 1; i >= 0; i--) {
        if(utils.isArray(o[i]) || utils.isObject(o[i])){
          if(!Object.isFrozen(o[i])){
            Object.freeze(o[i]);
          }
        }
      };
    }
  },
  deepFreeze: function(o) {
    if(utils.isObject(o)){
      if(!Object.isFrozen(o)){
        Object.freeze(o);
      }
      for (var k in o) {
        if(o.hasOwnProperty(k)){
          if(utils.isArray(o[k]) || utils.isObject(o[k])){
            utils.deepFreeze(o[k]);
          }
        }
      }
    } else if(utils.isArray(o)){
      if(!Object.isFrozen(o)){
        Object.freeze(o);
      }
      for (var i = 0, len = o.length; i < len; i++) {
        if(utils.isArray(o[i]) || utils.isObject(o[i])){
          utils.deepFreeze(o[i]);
        }
      };
    }
  }  
};

module.exports = utils;
},{}],11:[function(require,module,exports){
var utils = require('./utils');
var extend = utils.extend;
var isObject = utils.isObject;
var isModel = utils.isModel;
var isArray = utils.isArray;
var freeze = utils.freeze;
var deepFreeze = utils.deepFreeze;

var ViewModel = {

  Mixin: {
    construct: function(stateChangeHandler){

      var desc = this.getDescriptor();
      desc.proto.setState = stateChangeHandler;

      var ViewModelClass = function(nextState, initialize) {

        //nextState has already been extended with prevState in core
        nextState = nextState || {};
        nextState = ('$state' in nextState ? nextState.$state : nextState);

        var freezeFields = desc.freezeFields,
          fld,
          viewModel = Object.create(desc.proto, desc.descriptor),
          tempSpec,
          tempDesc,
          tempModel;

        Object.defineProperty(viewModel, '$state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize){
          nextState = ('getInitialState' in desc.originalSpec) ?
            extend(nextState, desc.originalSpec.getInitialState.call(viewModel)) : nextState;

          Object.defineProperty(viewModel, '$state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: nextState
          });
        }

        //freeze arrays and viewModel instances
        if(freezeFields !== void(0)){
          for (fld = freezeFields.length - 1; fld >= 0; fld--) {
            if(freezeFields[fld].kind === 'instance'){
              if(isModel(viewModel[freezeFields[fld].fieldName])){
                var tempCstor = viewModel[freezeFields[fld].fieldName].constructor;
                tempSpec = tempCstor.getDescriptor();
                tempModel = Object.create(tempSpec.proto, tempSpec.descriptor);

                Object.defineProperty(tempModel, '_stateChangeHandler', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: (function(fld){
                    return viewModel[fld]._stateChangeHandler;
                  })(freezeFields[fld].fieldName)
                });
                
                Object.defineProperty(tempModel, '$state', {
                  configurable: true,
                  enumerable: false,
                  writable: true,
                  value: viewModel[freezeFields[fld].fieldName].$state
                });

                Object.getPrototypeOf(tempModel).setState = function(state, appState, callback){ //callback may be useful for DB updates
                  var clientFields = {};
                  var modelNextState;
                  if(typeof appState === 'function'){
                    callback = appState;
                    appState = void(0);
                  } else if(typeof state === 'function'){
                    callback = state;
                    state = void(0);
                    appState = void(0);
                  }

                  if(state !== void(0) && !!Object.keys(state).length){
                     clientFields.$dirty = true;
                  } else {
                    clientFields.$dirty = tempModel.$dirty;
                  }

                  if(tempSpec.clientFields !== void(0)){
                    for (var cf = tempSpec.clientFields.length - 1; cf >= 0; cf--) {
                      clientFields[tempSpec.clientFields[cf]] = this[tempSpec.clientFields[cf]];
                    };
                  }
                  
                  modelNextState = extend(this.$state, clientFields, state);
                  
                  if(callback && (typeof callback === 'function')){
                    //We need to create a model with the next state and bind it to the callback
                    callback = callback.bind(new tempCstor(this._stateChangeHandler)(modelNextState));
                  }
                  this._stateChangeHandler.call(viewModel, modelNextState, appState, callback);
                };

                if(!!tempSpec.freezeFields && !!tempSpec.freezeFields.length){
                  for (var i = tempSpec.freezeFields.length - 1; i >= 0; i--) {
                    if(tempSpec.freezeFields[i].kind === 'instance' 
                      && isModel(viewModel[freezeFields[fld].fieldName][tempSpec.freezeFields[i].fieldName])){
                      var tempCstor2 = viewModel[freezeFields[fld].fieldName][tempSpec.freezeFields[i].fieldName].constructor;
                      var tempSpec2 = tempCstor2.getDescriptor();
                      var tempModel2 = Object.create(tempSpec2.proto, tempSpec2.descriptor);
                      
                      Object.defineProperty(tempModel2, '_stateChangeHandler', {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: tempModel._stateChangeHandler
                      });

                      Object.defineProperty(tempModel2, '$state', {
                        configurable: true,
                        enumerable: false,
                        writable: true,
                        value: tempModel[tempSpec.freezeFields[i].fieldName].$state
                      });

                      Object.getPrototypeOf(tempModel2).setState = (function(fldName){
                        return function(state, appState, callback){ //callback may be useful for DB updates
                          var clientFields2 = {};
                          var modelNextState2;
                          var thisState = {};
                          fldName = ('$owner' in this.$state) ? this.$state.$owner : fldName;

                          if(typeof appState === 'function'){
                            callback = appState;
                            appState = void(0);
                          } else if(typeof state === 'function'){
                            callback = state;
                            state = void(0);
                            appState = void(0);
                          }

                          if(state !== void(0) && !!Object.keys(state).length){
                            clientFields2.$dirty = true;
                          } else {
                            clientFields2.$dirty = tempModel2.$dirty;
                          }

                          if(tempSpec2.clientFields !== void(0)){
                            for (var cf = tempSpec2.clientFields.length - 1; cf >= 0; cf--) {
                              clientFields2[tempSpec2.clientFields[cf]] = this[tempSpec2.clientFields[cf]];
                            };
                          }

                          thisState[fldName] = extend(this.$state, clientFields2, state);
                          
                          modelNextState2 = extend(tempModel, thisState);

                          if(callback && (typeof callback === 'function')){
                            //We need to create a model with the next state and bind it to the callback
                            callback = callback.bind(new tempCstor2(tempModel._stateChangeHandler)(modelNextState2));
                          }
                          tempModel._stateChangeHandler.call(viewModel, modelNextState2, appState, callback);
                        };
                      })(tempSpec.freezeFields[i].fieldName);
                      Object.freeze(viewModel[freezeFields[fld].fieldName][tempSpec.freezeFields[i].fieldName]);
                    }
                  };
                }
                Object.freeze(viewModel[freezeFields[fld].fieldName]);
              }
            } else if(freezeFields[fld].kind === 'object'){
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
            } else {
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

        Object.defineProperty(viewModel, '$state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });
        
        return Object.freeze(viewModel);
      };

      desc.proto.__dispose = function(){
        return ViewModelClass(void(0));
      };

      return ViewModelClass;
    }
  }
};

module.exports = ViewModel;
},{"./utils":10}]},{},[1])(1)
});