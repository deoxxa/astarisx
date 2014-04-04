!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.IMVVM=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict'

var IMVVM = _dereq_('./src/imvvm.js');

module.exports = IMVVM;
},{"./src/imvvm.js":3}],2:[function(_dereq_,module,exports){

var utils = _dereq_('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, stateChangedHandler, enableUndo) {

	if(typeof stateChangedHandler !== 'function'){
		throw new TypeError();
	}

	enableUndo === void(0) ? true : enableUndo;

	var ApplicationDataContext,
		dependsOn,
		appState = {},
		dataContexts = {},
		watchedProps,
		watchedPropsLen,
		watchList = {},
		dependents = [],
		domain,
		watchListPropA,
		watchListPropB;

	var depProp;

	var configure = function(obj, propName){
		var newObj = {};
		for(var k in obj){
			if(obj.hasOwnProperty(k)){
				if(Object.prototype.toString.call(obj[k]) === '[object Object]'){
					newObj[k] = obj[k];
				} else {
					newObj[k] = {};
					newObj[k][propName] = obj[k];
				}
			}
		}
		return newObj;
	};

	var getDeps = function(nextState, dataContext){
		var dependencies = {},
			props,
			watchedValue;

		if(!dataContext){
			return {};
		}

		dataContext = ('dependsOn' in dataContext) ? dataContext : {dependsOn: dataContext};

		for(var dependency in dataContext.dependsOn){
			if(dataContext.dependsOn.hasOwnProperty(dependency)){
				watchedValue = {};
				props = dataContext.dependsOn[dependency].property.split('.');
				props.forEach(function(prop, idx){
					if(idx === 0){
						watchedValue = nextState[prop];
					} else {
						watchedValue = watchedValue ? watchedValue[prop] : void(0);
					}
				});
				dependencies[dependency] = watchedValue;			
			}
		};
		return dependencies;
	};


	var transitionState = function(caller, nextState, prevState, subscribers){

		nextState = nextState || {};
		prevState = prevState || {};

		var processed = false,
			tempDeps,
			nextVal;

		if(caller !== appNamespace){
			nextState[caller] = new dataContexts[caller](nextState[caller], 
				getDeps(nextState, domain[caller]), prevState[caller]);					
		}

		if(subscribers){
			if(!!dependsOn){
				tempDeps = getDeps(nextState, dependsOn);
				nextState = extend(nextState, tempDeps);
				for(var depKey in dependsOn){
					if(dependsOn.hasOwnProperty(depKey) && ('onStateChange' in dependsOn[depKey])){
						nextVal = {};
						nextVal[depKey] = nextState[depKey];
						nextState = extend(nextState, dependsOn[depKey].onStateChange(nextVal));
					}
				}
			}
			nextState = new ApplicationDataContext(extend(nextState, tempDeps), prevState, enableUndo);
			subscribers.forEach(function(subscriber){
				if(subscriber !== appNamespace){
					nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber],
					getDeps(nextState, domain[subscriber]), prevState[subscriber]);
				}
			});
		}

		return nextState;
	};

	var appStateChangedHandler = function(caller, newState, callback) {
		
		if((newState === void(0) || newState === null || Object.keys(newState).length === 0)){
			return;
		}

		var nextState = {},
			prevState = {},
			subscribers = [],
			newStateKeys,
			newStateKeysLen,
			subscriberNames,
			idxKey,
			idxDepFld,
			tmpNextState = {},
			changeState,
			dependsOnObj;

		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangedHandler. If a callback was passed in
		//it would be assigned to newState
		if(Object.getPrototypeOf(newState).constructor.classType === "DomainModel") {
			//This means previous state has been requested
			//so set nextState to the previous state
			nextState = extend(newState);
			//revert the current appState to the previous state of the previous state
			prevState = newState.previousState;
		} else {
			if(caller in watchList){
				
				newStateKeys = Object.keys(newState);
				newStateKeysLen = newStateKeys.length;
				subscriberNames = {};

				for (var i = newStateKeysLen - 1; i >= 0; i--){
					if(watchList[caller][newStateKeys[i]]){
						for(var j = watchList[caller][newStateKeys[i]].length - 1; j >= 0; j--){
							subscriberNames[watchList[caller][newStateKeys[i]][j].dataContext] = true;
						}
					}
				}

				subscribers = Object.keys(subscriberNames);
				hasSubscribers = !!subscribers.length;
			}

			if(caller !== appNamespace){

				nextState[caller] = newState;
				nextState = extend(appState.state, nextState);

				if(hasSubscribers){

					subscribers.forEach(function(sub){
						
						for(idxKey=newStateKeysLen-1; idxKey >= 0; idxKey--){

							if(watchList[caller][newStateKeys[idxKey]]){

								var depFldArr = watchList[caller][newStateKeys[idxKey]];						
								
								for(idxDepFld = depFldArr.length - 1; idxDepFld >= 0; idxDepFld--){

									dependsOnObj = depFldArr[idxDepFld].dataContext === appNamespace ? dependsOn : 
										domain[depFldArr[idxDepFld].dataContext].dependsOn;

									if(dependsOnObj[depFldArr[idxDepFld].alias].onStateChange){

										tmpNextState[depFldArr[idxDepFld].alias] = nextState[caller][newStateKeys[idxKey]];
										changeState = dependsOnObj[depFldArr[idxDepFld].alias].
											onStateChange.call(appState.state[depFldArr[idxDepFld].dataContext], tmpNextState);

										if(Object.prototype.toString.call(changeState) === '[object Object]'){

											if(depFldArr[idxDepFld].dataContext === appNamespace){
												nextState = extend(nextState, changeState);
											} else {
												nextState[depFldArr[idxDepFld].dataContext] =
													extend(nextState[depFldArr[idxDepFld].dataContext], changeState);
											}
										}
									}
								}
							}
						}
					});
				}
			} else {
				nextState = extend(appState.state, newState);
			}
			prevState = appState;
			nextState = transitionState(caller, nextState, appState.state, hasSubscribers ? subscribers : false);
		}
		if(!!prevState){
			Object.freeze(prevState);
		}
		//Create a new App state context.
		appState = new ApplicationDataContext(nextState, prevState, enableUndo);
		//All the work is done! -> Notify the View
		//Provided for the main app to return from init() to the View
		Object.freeze(appState);
		Object.freeze(appState.state);
		stateChangedHandler(appState, caller, callback);
		return appState;
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	appState = new ApplicationDataContext({}, void(0), enableUndo, true);
	dependsOn = appState.getDependencies ? configure(appState.getDependencies(), 'property') : void(0);
	if(dependsOn){
		dependents.push(appNamespace);
		for(depProp in dependsOn){
			if(dependsOn.hasOwnProperty(depProp)){
				watchedProps = dependsOn[depProp].property.split('.');
				watchedPropsLen = watchedProps.length;
				watchListPropA = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
				watchListPropB = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
				watchList[watchListPropA] = watchList[watchListPropA] || {};
				watchList[watchListPropA][watchListPropB] = watchList[watchListPropA][watchListPropB] || [];
				if(watchList[watchListPropA][watchListPropB].indexOf(appNamespace) === -1){
					watchList[watchListPropA][watchListPropB].push({dataContext:appNamespace, alias: depProp});
				}
			}
		}
	}

	domain = configure(appState.getDomainDataContext(), 'viewModel');
	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			appState[dataContext] = new dataContexts[dataContext]({}, {}, {}, true);
			if(appState[dataContext].getDependencies){
				dependents.push(dataContext);
				domain[dataContext].dependsOn = configure(appState[dataContext].getDependencies(), 'property');
				for(depProp in domain[dataContext].dependsOn){
					if(domain[dataContext].dependsOn.hasOwnProperty(depProp)){
						watchedProps = domain[dataContext].dependsOn[depProp].property.split('.');
						watchedPropsLen = watchedProps.length;
						watchListPropA = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
						watchListPropB = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
						watchList[watchListPropA] = watchList[watchListPropA] || {};
						watchList[watchListPropA][watchListPropB] = watchList[watchListPropA][watchListPropB] || [];
						if(watchList[watchListPropA][watchListPropB].indexOf(dataContext) === -1){
							watchList[watchListPropA][watchListPropB].push({dataContext:dataContext, alias: depProp});
						}
					}
				}
			}
		}
	}
	dependents.forEach(function(dependent){
		if(dependent !== appNamespace){
				appState[dependent] = new dataContexts[dependent](appState[dependent],
					getDeps(appState, domain[dependent]), {});
		}
	});
	
	appState = new ApplicationDataContext(extend(appState, getDeps(appState, dependsOn)), void(0), enableUndo);
	Object.freeze(appState.state);
	return Object.freeze(appState);
};
},{"./utils":8}],3:[function(_dereq_,module,exports){

var model = _dereq_('./imvvmModel');
var viewModel = _dereq_('./imvvmViewModel');
var domainModel = _dereq_('./imvvmDomainModel');
var mixin = _dereq_('./mixin');

var utils = _dereq_('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;

var ModelBase = function() {};
var ViewModelBase = function() {};
var DomainModelBase = function() {};

mixInto(ModelBase, model.Mixin);
mixInto(ViewModelBase, viewModel.Mixin);
mixInto(DomainModelBase, domainModel.Mixin);

var IMVVMClass = {
  createClass: function(ctor, classType, spec){

    var Constructor = function(){};
    Constructor.prototype = new ctor();      
    Constructor.prototype.constructor = Constructor;

    var DescriptorConstructor = Constructor;

    var ConvenienceConstructor = function(stateChangedHandler) {
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

var IMVVM = {
  createModel: IMVVMClass.createClass.bind(this, ModelBase, 'Model'),
  createViewModel: IMVVMClass.createClass.bind(this, ViewModelBase, 'ViewModel'),
  createDomainModel: IMVVMClass.createClass.bind(this, DomainModelBase, 'DomainModel'),
  mixin: mixin
};

module.exports = IMVVM;

},{"./imvvmDomainModel":4,"./imvvmModel":5,"./imvvmViewModel":6,"./mixin":7,"./utils":8}],4:[function(_dereq_,module,exports){

var utils = _dereq_('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMDomainModel = {
  Mixin: {
    construct: function(stateChangedHandler){
      
      var desc = getDescriptor.call(this);
      desc.proto.setState = stateChangedHandler;

      var dataContext = function(nextState, prevState, enableUndo, initialize) {
        
        var freezeFields = desc.freezeFields;
        var domainModel = Object.create(desc.proto, desc.descriptor);
        
        //Need to have 'state' prop in domainModel before can extend domainModel to get correct state
        Object.defineProperty(domainModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });
        
        if(!!enableUndo && !!prevState){
          Object.defineProperty(domainModel, 'previousState', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: prevState
          });
        }

        prevState = prevState || {};

        if(initialize && ('getInitialState' in domainModel)){
          //Add state prop so that it can be referenced from within getInitialState
          nextState = extend(nextState, domainModel.getInitialState.call(domainModel));
        }

        //attach the nextState props to domainModel if they don't exist
        var keys = Object.keys(nextState);
        for (var i = keys.length - 1; i >= 0; i--) {
          if(!(keys[i] in domainModel)){
            domainModel[keys[i]] = nextState[keys[i]];
          }
        };

        Object.defineProperty(domainModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and domainModel instances
        for (var fld = freezeFields.length - 1; fld >= 0; fld--) {
            Object.freeze(domainModel[freezeFields[fld].fieldName]);
        };

        return domainModel;
      };
      
      return dataContext;
    }
  }
};

module.exports = IMVVMDomainModel;

},{"./utils":8}],5:[function(_dereq_,module,exports){

var utils = _dereq_('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = getDescriptor.call(this);
      
      var dataContext = function(nextState, prevState, withContext) {
        
        var freezeFields = desc.freezeFields;
        var model = Object.create(desc.proto, desc.descriptor);
        var argCount = arguments.length;
        var lastArgIsBool = typeof Array.prototype.slice.call(arguments, -1)[0] === 'boolean';
        var initialize = false;

        if(argCount === 0){
          //defaults
          nextState = {};
          prevState = {};
          withContext = false;
        } else if(argCount === 1){
          if(lastArgIsBool){
            withContext = nextState;
            nextState = {};
            prevState = {};
          } else {
            //assume this is a new Object and there is no prevState
            prevState = {};
            withContext = false;
            initialize = true;
          }
        } else if(argCount === 2){
          if(lastArgIsBool){
            //assume this is a new Object and there is no prevState
            withContext = prevState;
            prevState = {};
            initialize = true;
          } else {
            withContext = false;
          }
        }
        
        nextState = ('state' in nextState) ? nextState.state : nextState;
        prevState = ('state' in prevState) ? prevState.state : prevState;

        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize && ('getInitialState' in model)){
          nextState = extend(nextState, model.getInitialState.call(model));
        }

        if(withContext){
          //This will self distruct
          Object.defineProperty(model, 'context', {
            configurable: true,
            enumerable: false,
            set: function(context){
              this.setState = function(nextState, callback){ //callback may be useful for DB updates
                return stateChangedHandler.bind(context)
                  .call(context, extend(this.state, nextState), this.state, callback);
              }.bind(this);
              delete this.context;
            }
          });
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and model instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
            Object.freeze(model[freezeFields[i].fieldName]);
        };

        if(!withContext){
          Object.freeze(model);
        }

        return model;
      };
      return dataContext;
    }
  }
};

module.exports = IMVVMModel;

},{"./utils":8}],6:[function(_dereq_,module,exports){

var utils = _dereq_('./utils');
var extend = utils.extend;
var getDescriptor = utils.getDescriptor;

var IMVVMViewModel = {
  Mixin: {
    construct: function(stateChangedHandler){

      var desc = getDescriptor.call(this);
      desc.proto.setState = stateChangedHandler;
      
      var dataContext = function(nextState, dependencies, prevState, initialize) {
        
        //nextState has already been extended with prevState in core
        nextState = extend(nextState, dependencies);
        prevState = prevState || {};
        prevState = ('state' in prevState) ? prevState.state : prevState;
        
        var freezeFields = desc.freezeFields;
        var viewModel = Object.create(desc.proto, desc.descriptor);

        Object.defineProperty(viewModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(initialize && ('getInitialState' in viewModel)){
          nextState = extend(nextState, viewModel.getInitialState.call(viewModel));          
        }

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and viewModel instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
          if(freezeFields[i].kind === 'instance' &&
              ('context' in viewModel[freezeFields[i].fieldName])){
            viewModel[freezeFields[i].fieldName].context = viewModel; 
          }
          Object.freeze(viewModel[freezeFields[i].fieldName]);
        };

        //Add dependencies to viewModel
        for(var dep in dependencies){
          if(dependencies.hasOwnProperty(dep) && dep[0] !== '_'){
            Object.defineProperty(viewModel, dep, {
              configurable: false,
              enumerable: false,
              writable: false,
              value: dependencies[dep]
            });
          }
        }

        Object.freeze(nextState);
        return Object.freeze(viewModel);

      };
      return dataContext;
    }
  }
};

module.exports = IMVVMViewModel;

},{"./utils":8}],7:[function(_dereq_,module,exports){

var core = _dereq_('./core');
var NAMESPACE = '__IMVVM__';

var mixin = {
	stateChangedHandler: function(dataContext, caller, callback){
  	this.setState({domainDataContext: dataContext}, function(){
	    //send all state back to caller
	    //useful if you need to know what other parts of the app
	    //were impacted by your changes. You can also use the returned
	    //information to display things external to your ApplicationModel
	    //Allows you to have multiple Application ViewModels in the one app and
	    //still share the state with other presentation models that may be interested
	    if(typeof callback === 'function'){
      	if(this.state === null || !('domainDataContext' in this.state)){
          callback(void(0));
        } else {
					if(caller in this.state.domainDataContext){
					  callback(this.state.domainDataContext[caller]);
					} else if(caller === NAMESPACE) {
					  callback(this.state.domainDataContext);
					} else {
					  callback(void(0));
					}
				}
			}
		}.bind(this));
  },

	getInitialState: function(){
		var dataContext = core.getInitialState(NAMESPACE, this.props.domainModel,
			this.stateChangedHandler, this.props.enableUndo);
		return {domainDataContext: dataContext};
	}

};

module.exports = mixin;
},{"./core":2}],8:[function(_dereq_,module,exports){

var utils = {

  getDescriptor: function(){
    var descriptor = {};
    var proto = this.prototype;
    var autoFreeze = [];

    if('__processedObject__' in this.originalSpec){
      return this.originalSpec.__processedObject__;
    }

    for(var key in this.originalSpec){
      if(this.originalSpec.hasOwnProperty(key)){
        if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
          //assume it is a descriptor
          this.originalSpec[key].enumerable = true;
          if('kind' in this.originalSpec[key]){
            if(this.originalSpec[key].kind === 'pseudo'){
              this.originalSpec[key].enumerable = false;
            } else { //'instance' || 'array'
              autoFreeze.push({fieldName: key, kind: this.originalSpec[key].kind});
            }
            delete this.originalSpec[key].kind;
          }
          descriptor[key] = this.originalSpec[key];
        } else {
          proto[key] = this.originalSpec[key];
        }
      }
    }
    if(!('extend' in proto)){
      proto.extend = utils.extend;      
    }

    this.originalSpec.__processedObject__ = { 
      descriptor: descriptor,
      proto: proto,
      originalSpec: this.originalSpec || {},
      freezeFields: autoFreeze
    };

    return this.originalSpec.__processedObject__;
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