!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.IMVVM=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict'

var IMVVM = _dereq_('./src/imvvm.js');

module.exports = IMVVM;
},{"./src/imvvm.js":3}],2:[function(_dereq_,module,exports){
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var utils = _dereq_('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, appViewModel, initArgs, dataContexts, stateChangedHandler, noUndo) {

	if(typeof stateChangedHandler !== 'function'){
		throw new TypeError();
	}
	
	var appDataContextName = appNamespace,
		thisAppState = void 0,
		dataContextObjs = {},
		watchedProps,
		watchList = {};
		
	var transitionState = function(nextState, prevState, watchedDataContext){
		var processed = false,
			dependencies,
			initialize;

		prevState = prevState || {};

		if(nextState === void 0){
			initialize = true;
			nextState = {};
		}

		var getDependencies = function(dataContext){
			var deps = {},
				props,
				watchedValue;

			if('dependsOn' in dataContext){
				dataContext.dependsOn.forEach(function(dependency){
					watchedValue = {};
					props = dependency.property.split('.');
					props.forEach(function(prop, idx){
						if(idx === 0){
							watchedValue = nextState[prop];
						} else {
							watchedValue = watchedValue ? watchedValue[prop] : void 0;
						}
					});
					if('alias' in dependency){
						deps[dependency.alias] = watchedValue;
					} else {
						deps[props.join('_')] = watchedValue;
					}
				});
			}
			return deps;
		};

		for(var dataContextName in dataContexts){
			if(dataContexts.hasOwnProperty(dataContextName)){
				dependencies = getDependencies(dataContexts[dataContextName]);
				//Need to inject dependencies so that the state for this object can change
				//if required. Can't use appState as that is provided after the object is created
				if(initialize){
					nextState[dataContextName] = new dataContextObjs[dataContextName](nextState[dataContextName], dependencies, prevState[dataContextName]).init(dataContexts[dataContextName].initArgs);
				} else {
					nextState[dataContextName] = new dataContextObjs[dataContextName](nextState[dataContextName], dependencies, prevState[dataContextName]);
				}
				if(watchedDataContext){
					if(processed && watchedDataContext.subscribers.indexOf(dataContextName) !== -1){
						dependencies = getDependencies(dataContexts[watchedDataContext.name]);
						nextState[watchedDataContext.name] = new dataContextObjs[watchedDataContext.name](nextState[watchedDataContext.name], dependencies, prevState[watchedDataContext.name]);
					}
					processed = processed ? processed : dataContextName === watchedDataContext.name;
				}					
			}
		}
		return nextState;
	};

	var appStateChangedHandler = function(callerDataContext, newState, callback, initialize) {
		var appContext,
			nextState = {},
			prevState = void 0,
			watchedDataContext = void 0,
			newStateKeys,
			newStateKeysLen,
			subscriberKeys;

		if(callerDataContext in watchList){
			newStateKeys = Object.keys(newState);
			newStateKeysLen = newStateKeys.length;
			subscriberKeys = {};

			for(var i= 0; i < newStateKeysLen; i++){
				if(watchList[callerDataContext][newStateKeys[i]]){
					subscriberKeys[watchList[callerDataContext][newStateKeys[i]]] = true;
				}
			}
			watchedDataContext = {};
			watchedDataContext.name = callerDataContext;
			watchedDataContext.subscribers = Object.keys(subscriberKeys);
			//If there are no subscriber reset watchedDataContext
			watchedDataContext = !!watchedDataContext.subscribers.length ? watchedDataContext : void 0;
		}

		var AppViewModel = !!newState ? Object.getPrototypeOf(newState).constructor.classType === "AppViewModel" : false;
		
		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangedHandler. If a callback was passed in
		//it would be assigned to newState
		if(AppViewModel) {
			//This means previous state has been requested
			//so set nextState to the previous state
			nextState = extend(newState.state);
			//revert the current appState to the previous state of the previous state
			prevState = newState.state.previousState;
		} else {
			if(callerDataContext !== appDataContextName){
				nextState[callerDataContext] = newState;
				nextState = extend(thisAppState.state, nextState);
			} else {
				//appDataContextName is calling function
				//if(typeof callback === 'boolean' && callback){ //initialise State
				if(initialize) {
					nextState = extend(transitionState(), newState);
				} else {
					nextState = extend(thisAppState.state, newState);
				}
			}
			prevState = thisAppState;
			nextState = transitionState(nextState, thisAppState ? thisAppState.state : void 0, watchedDataContext);
		}
		if(prevState){
			Object.freeze(prevState);
		}
		//Create a new App state context. Only pass in previous state if it is actually an ApplicationDataContext
		thisAppState = new ApplicationDataContext(nextState, noUndo ? void 0 : prevState);
		appContext = Object.freeze(thisAppState.state);

		//All the work is done! -> Notify the View
		stateChangedHandler(appContext, callback);
		//Provided for the main app to return from init() to the View
		return appContext;
	};

	var ApplicationDataContext = appViewModel.call(this, appStateChangedHandler.bind(this, appDataContextName));

	for(var dataContextName in dataContexts){
		if(dataContexts.hasOwnProperty(dataContextName)){
			dataContextObjs[dataContextName] = dataContexts[dataContextName].viewModel.call(this, appStateChangedHandler.bind(this, dataContextName));
			if('dependsOn' in dataContexts[dataContextName]){
				for(var i = 0, len = dataContexts[dataContextName].dependsOn.length; i < len; i++){
					watchedProps = dataContexts[dataContextName].dependsOn[i].property.split('.');
					if(watchedProps.length > 1){
						watchList[watchedProps[0]] = watchList[watchedProps[0]] || {};
						watchList[watchedProps[0]][watchedProps[1]] = watchList[watchedProps[0]][watchedProps[1]] || [];
						if(watchList[watchedProps[0]][watchedProps[1]].indexOf(dataContextName) === -1){
							watchList[watchedProps[0]][watchedProps[1]].push(dataContextName);
						}
					}
				}
			}
		}
	}
	return new ApplicationDataContext().init(initArgs);
};
},{"./utils":9}],3:[function(_dereq_,module,exports){
'use strict'

var base = _dereq_('./imvvmBase');
var mixin = _dereq_('./mixin');

var IMVVM = {
    createModel: base.createModel,
    createViewModel: base.createViewModel,
    createAppViewModel: base.createAppViewModel,
    mixin: mixin
};

module.exports = IMVVM;
},{"./imvvmBase":5,"./mixin":8}],4:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMAppViewModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;

      var dataContext = function(state, previousState, oldState) {
        state = state || {};
        if(!!previousState){
          Object.defineProperty(state, 'previousState', {
            configurable: false,
            enumerable: true,
            writable: false,
            value: previousState
          });
        }
        //Do this after previousState is set so that it is included
        if(desc.originalSpec.getInitialState){
          state = extend(state, desc.originalSpec.getInitialState(state, previousState ? previousState.state: void 0));
        }

        desc.proto.DataContext = function(newState, callback, initialize){
          return desc.proto.setState(newState, callback, true);
        }

        if(!('init' in desc.proto)){
          desc.proto.init = function(){
            return this.DataContext();
          }
        }
        
        var model = Object.create(desc.proto, desc.descriptor);
       
        //set this last
        //TODO - rework this, as __proto__ is deprecated
        state.__proto__ = model.__proto__;

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: state
        });
        return model;
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMAppViewModel;

},{"./utils":9}],5:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;

var model = _dereq_('./imvvmModel');
var viewModel = _dereq_('./imvvmViewModel');
var appViewModel = _dereq_('./imvvmAppViewModel');

var ModelBase = function() {};
var ViewModelBase = function() {};
var AppViewModelBase = function() {};

mixInto(ModelBase, model.Mixin);
mixInto(ViewModelBase, viewModel.Mixin);
mixInto(AppViewModelBase, appViewModel.Mixin);

var IMVVMClass = {
  createClass: function(ctor, classType, spec){

    var Constructor = function(){};
    Constructor.prototype = new ctor();      
    Constructor.prototype.constructor = Constructor;

    var DescriptorConstructor = Constructor;

    var ConvenienceConstructor = function(raiseStateChangeHandler) {
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

/*    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in IMVVMInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }
*/

    /*
    if (__DEV__) {
      // In DEV the convenience constructor generates a proxy to another
      // instance around it to warn about access to properties on the
      // descriptor.
      DescriptorConstructor = createDescriptorProxy(Constructor);
    }*/

    return ConvenienceConstructor;
  },
};
var IMVVMConstructors = {
  createModel: IMVVMClass.createClass.bind(this, ModelBase, 'Model'),
  createViewModel: IMVVMClass.createClass.bind(this, ViewModelBase, 'ViewModel'),
  createAppViewModel: IMVVMClass.createClass.bind(this, AppViewModelBase, 'AppViewModel')
};

module.exports = IMVVMConstructors;

},{"./imvvmAppViewModel":4,"./imvvmModel":6,"./imvvmViewModel":7,"./utils":9}],6:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      var dataContext = function(state, withContext, oldState) {
        
        var model = Object.create(desc.proto, desc.descriptor);
        var argCount = arguments.length;
        var lastIsBoolean = typeof Array.prototype.slice.call(arguments, -1)[0] === 'boolean';
        if(argCount === 1){
          if(lastIsBoolean){
            withContext = state;
            state = {};
          } else {
            //state = state || {};
            withContext = true;
          }
        } else if(argCount === 2){
          if(!lastIsBoolean){
            oldState = withContext;
            withContext = true;
          }
        } else if(argCount === 3){
          if(lastIsBoolean){
            var temp = withContext;
            withContext = oldState;
            oldState = temp;
          } 
        } else {
          state = {};
          withContext = true;
        }
        
        if(desc.originalSpec.getInitialState){
          state = extend(state, desc.originalSpec.getInitialState(state, oldState));
        }

        if(withContext){
          //This will self distruct
          Object.defineProperty(model, 'context', {
            configurable: true,
            enumerable: true,
            set: function(context){
              this.setState = raiseStateChangeHandler(context);
              delete this.context;
            }
          });
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: state
        });
        return model;
      };
      return dataContext;
    }
  }
};


module.exports = IMVVMModel;

},{"./utils":9}],7:[function(_dereq_,module,exports){
'use strict';

var utils = _dereq_('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      var desc = getDescriptor.call(this);
      desc.proto.setState = raiseStateChangeHandler;

      var dataContext = function(state, dependencies, oldState) {

        state = state || {};
        state = extend(state, dependencies);

        if(desc.originalSpec.getInitialState){
          state = extend(state, desc.originalSpec.getInitialState(state, oldState));
        }
      
        desc.proto.DataContext = dataContext;

        if(!('init' in desc.proto)){
          desc.proto.init = function(){
            return this.DataContext();
          }
        }
        
        var model = Object.create(desc.proto, desc.descriptor);

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: state
        });

        Object.keys(model).map(function(key){
          if(Object.prototype.toString.call(this[key]) === '[object Object]' &&
            ('context' in this[key])){
            this[key].context = this; 
            Object.freeze(this[key]);
          }
        }.bind(model));

        state.__proto__ = model.__proto__;
        return Object.freeze(state);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;

},{"./utils":9}],8:[function(_dereq_,module,exports){
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var core = _dereq_('./core');
var NAMESPACE = '__IMVVM__';

var mixin = {
	stateChangedHandler: function(dataContext, callback){
		this.setState({appContext: dataContext}, function(){
			//send all state back to caller
			//useful if you need to know what other parts of the app
			//were impacted by your changes. You can also use the returned
			//information to display things external to your ApplicationModel
			//Allows you to have multiple Application ViewModels in the one app and
			//still share the state with other presentation models that may be interested
			if(typeof callback === 'function'){
				if(this.state !== null && ('appContext' in this.state)){
					callback(this.state.appContext);
				} else {
					callback(void 0);
				}
			}
		}.bind(this));
	},

	getInitialState: function(){
		var appDataContext = core.getInitialState(NAMESPACE, this.props.viewModel, this.props.initArgs,
			this.props.dataContexts, this.stateChangedHandler, this.props.noUndo);
		return {appContext: appDataContext};
	}

};

module.exports = mixin;
},{"./core":2}],9:[function(_dereq_,module,exports){
'use strict';

var utils = {
  getDescriptor: function(){
    var descriptor = {};
    var proto = this.prototype;
    //var originalSpec = this.originalSpec || {};
    for(var key in this.originalSpec){
      if(this.originalSpec.hasOwnProperty(key)){
        if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
          //assume it is a descriptor
          if(!('enumerable' in this.originalSpec[key])){
            //default enumerable to true
            this.originalSpec[key].enumerable = true;
          }
          descriptor[key] = this.originalSpec[key];
        } else {
          proto[key] = this.originalSpec[key];
        }
      }
    }
    proto.extend = utils.extend;
    return { 
      descriptor: descriptor,
      proto: proto,
      originalSpec: this.originalSpec || {}
    }
  },
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
},{}]},{},[1])
(1)
});