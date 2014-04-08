!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.IMVVM=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict'

var IMVVM = _dereq_('./src/imvvm.js');

module.exports = IMVVM;
},{"./src/imvvm.js":3}],2:[function(_dereq_,module,exports){

var utils = _dereq_('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, stateChangedHandler, enableUndo, initialize) {

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

	// var getDeps = function(nextState, dataContext){
	// 	var dependencies = {},
	// 		props,
	// 		watchedValue;

	// 	if(!dataContext){
	// 		return {};
	// 	}

	// 	dataContext = ('dependsOn' in dataContext) ? dataContext : {dependsOn: dataContext};

	// 	for(var dependency in dataContext.dependsOn){
	// 		if(dataContext.dependsOn.hasOwnProperty(dependency)){
	// 			watchedValue = {};
	// 			props = dataContext.dependsOn[dependency].property.split('.');
	// 			props.forEach(function(prop, idx){
	// 				if(idx === 0){
	// 					watchedValue = nextState[prop];
	// 				} else {
	// 					watchedValue = watchedValue ? watchedValue[prop] : void(0);
	// 				}
	// 			});
	// 			dependencies[dependency] = watchedValue;			
	// 		}
	// 	};
	// 	return dependencies;
	// };


	// var transitionState = function(caller, nextState, prevState){

	// 	nextState = nextState || {};

	// 	var processed = false,
	// 		tempDeps,
	// 		nextVal;

	// 	if(caller !== appNamespace){
	// 		nextState[caller] = new dataContexts[caller](nextState.state[caller]/*, getDeps(nextState, domain[caller])*/, initialize);
	// 	}

	// 	// if(subscribers){
	// 	// 	if(!!dependsOn){
	// 	// 		tempDeps = getDeps(nextState, dependsOn);
	// 	// 		nextState = extend(nextState, tempDeps);
	// 	// 		for(var depKey in dependsOn){
	// 	// 			if(dependsOn.hasOwnProperty(depKey) && ('onStateChange' in dependsOn[depKey])){
	// 	// 				nextVal = {};
	// 	// 				nextVal[depKey] = nextState[depKey];
	// 	// 				nextState = extend(nextState, dependsOn[depKey].onStateChange(nextVal));
	// 	// 			}
	// 	// 		}
	// 	// 	}
	// 	// 	nextState = new ApplicationDataContext(extend(nextState, tempDeps), prevState, enableUndo);
	// 	// 	subscribers.forEach(function(subscriber){
	// 	// 		if(subscriber !== appNamespace){
	// 	// 			nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber],
	// 	// 			getDeps(nextState, domain[subscriber]));
	// 	// 		}
	// 	// 	});
	// 	// }

	// 	return nextState;
	// };

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
				nextState.persons.state.$hobbies = nextState.hobbies;
	nextState.hobbies.state.$persons = nextState.persons;
			prevState = newState.previousState;
		} else {
			// if(caller in watchList){
				
			// 	newStateKeys = Object.keys(newState);
			// 	newStateKeysLen = newStateKeys.length;
			// 	subscriberNames = {};

			// 	for (var i = newStateKeysLen - 1; i >= 0; i--){
			// 		if(watchList[caller][newStateKeys[i]]){
			// 			for(var j = watchList[caller][newStateKeys[i]].length - 1; j >= 0; j--){
			// 				subscriberNames[watchList[caller][newStateKeys[i]][j].dataContext] = true;
			// 			}
			// 		}
			// 	}

			// 	subscribers = Object.keys(subscriberNames);
			// 	hasSubscribers = !!subscribers.length;
			// }

			if(caller !== appNamespace){
				//nextState[caller] = extend(appState.state[caller].state, newState);
				nextState[caller] = extend(appState[caller], newState);
				nextState[caller] = new dataContexts[caller](nextState[caller]); //All this should really do is create
				//a viewModel with the prototype and enable calling initial and onStateChange functions
				
				//for each subscriber call onStateChanging(next.hobbies.state) => pass in nextState
				//also call if for datacontext that is invoking the change
				nextState = extend(appState, nextState);

				//At this point assign nextState to all subscribers
				nextState.persons.state.$hobbies = nextState.hobbies;
				//nextState.hobbies.state.$persons = nextState.persons;

				if(caller === 'persons' && ('$persons' in nextState.hobbies.state) && !Object.isFrozen(nextState.hobbies.state)){
					Object.defineProperty(nextState.hobbies.state, '$persons', {
						configurable: true,
						enumerable: true,
						get: function(){ return appState.persons; },
						set: function(persons) {
							if(appState.hobbies.onWatchedStateChanged){
								nextState.hobbies = extend(appState.hobbies, appState.hobbies.onWatchedStateChanged(caller, persons));
								nextState.hobbies = new dataContexts.hobbies(nextState.hobbies);
								nextState = extend(appState, nextState);
								nextState.persons.state.$hobbies = new dataContexts.hobbies(nextState.hobbies);								
							}
						}
					});

				}

				//This calls set() only once
				nextState.hobbies.state.$persons = nextState.persons;
				nextState.hobbies.state.$persons = nextState.persons;

				// nextState.persons.previousState.$hobbies = appState.hobbies.state;
				// nextState.hobbies.previousState.$persons = appState.persons.state;

				//Need to Look at why this is not preserving previous state
				//maybe it's because I am testing with this code

				/*if(caller === 'persons'){
					nextState.hobbies = extend(appState.hobbies, appState.hobbies.onStateChanged(appState.hobbies,
						appState.previousState ? appState.previousState.hobbies: void(0)));
					nextState.hobbies = new dataContexts.hobbies(nextState.hobbies);
					nextState.persons.state.$hobbies = nextState.hobbies;
					nextState.hobbies.state.$persons = nextState.persons;
					// nextState.persons.previousState.$hobbies = appState.hobbies.state;
					// nextState.hobbies.previousState.$persons = appState.persons.state;
				}*/
				// Object.freeze(nextState.persons.state);
				// Object.freeze(nextState.hobbies.state);
				//for each subscriber call onStateChanged(appState.hobbies.state) => pass in previousState
				//also call if for datacontext that is invoking the change
				
				//nextState[caller] = nextState;
				
				// if(hasSubscribers){

				// 	subscribers.forEach(function(sub){
						
				// 		for(idxKey=newStateKeysLen-1; idxKey >= 0; idxKey--){

				// 			if(watchList[caller][newStateKeys[idxKey]]){

				// 				var depFldArr = watchList[caller][newStateKeys[idxKey]];						
								
				// 				for(idxDepFld = depFldArr.length - 1; idxDepFld >= 0; idxDepFld--){

				// 					dependsOnObj = depFldArr[idxDepFld].dataContext === appNamespace ? dependsOn : 
				// 						domain[depFldArr[idxDepFld].dataContext].dependsOn;

				// 					if(dependsOnObj[depFldArr[idxDepFld].alias].onStateChange){

				// 						tmpNextState[depFldArr[idxDepFld].alias] = nextState[caller][newStateKeys[idxKey]];
				// 						changeState = dependsOnObj[depFldArr[idxDepFld].alias].
				// 							onStateChange.call(appState.state[depFldArr[idxDepFld].dataContext], tmpNextState);

				// 						if(Object.prototype.toString.call(changeState) === '[object Object]'){

				// 							if(depFldArr[idxDepFld].dataContext === appNamespace){
				// 								nextState = extend(nextState, changeState);
				// 							} else {
				// 								nextState[depFldArr[idxDepFld].dataContext] =
				// 									extend(nextState[depFldArr[idxDepFld].dataContext], changeState);
				// 							}
				// 						}
				// 					}
				// 				}
				// 			}
				// 		}
				// 	});
				// }
				if(typeof callback === 'function'){
					prevState = appState.previousState || void(0);
				} else {
					prevState = appState;
				}

			} else {
				nextState = extend(appState, newState);

				//At this point assign nextState to all subscribers
				// nextState.state.$hobbies = nextState.hobbies;
				// nextState.state.$persons = nextState.persons;
				prevState = appState;
			}
			// prevState = appState;
			//nextState = extend(appState, nextState);
			//nextState = transitionState(caller, nextState, appState.state);
			//nextState = extend(appState, new dataContexts[caller](nextState[caller]));
		}
		if(!!prevState){
			Object.freeze(prevState);
		}
		//Create a new App state context.
		appState = new ApplicationDataContext(nextState, prevState, enableUndo);

		//appState.persons.state.hobbies = appState.hobbies;

		//All the work is done! -> Notify the View
		//Provided for the main app to return from init() to the View
		Object.freeze(appState);
		Object.freeze(appState.state);


//		appState.hobbies.previousState = appState.previousState.hobbies;

		stateChangedHandler(appState, caller, callback);
		return appState;
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	appState = new ApplicationDataContext({}, void(0), enableUndo, false);
	// dependsOn = appState.getDependencies ? configure(appState.getDependencies(), 'property') : void(0);
	// if(dependsOn){
	// 	dependents.push(appNamespace);
	// 	for(depProp in dependsOn){
	// 		if(dependsOn.hasOwnProperty(depProp)){
	// 			watchedProps = dependsOn[depProp].property.split('.');
	// 			watchedPropsLen = watchedProps.length;
	// 			watchListPropA = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
	// 			watchListPropB = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
	// 			watchList[watchListPropA] = watchList[watchListPropA] || {};
	// 			watchList[watchListPropA][watchListPropB] = watchList[watchListPropA][watchListPropB] || [];
	// 			if(watchList[watchListPropA][watchListPropB].indexOf(appNamespace) === -1){
	// 				watchList[watchListPropA][watchListPropB].push({dataContext:appNamespace, alias: depProp});
	// 			}
	// 		}
	// 	}
	// }

	domain = configure(appState.getDomainDataContext(), 'viewModel');

	//var test = domain.persons.viewModel.originalSpec.getDependencies();

	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			appState[dataContext] = new dataContexts[dataContext]({}, true);
			if(appState[dataContext].getDependencies){
				// dependents.push(dataContext);
				// domain[dataContext].dependsOn = configure(appState[dataContext].getDependencies(), 'property');
				// for(depProp in domain[dataContext].dependsOn){
				// 	if(domain[dataContext].dependsOn.hasOwnProperty(depProp)){
				// 		watchedProps = domain[dataContext].dependsOn[depProp].property.split('.');
				// 		watchedPropsLen = watchedProps.length;
				// 		watchListPropA = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
				// 		watchListPropB = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
				// 		watchList[watchListPropA] = watchList[watchListPropA] || {};
				// 		watchList[watchListPropA][watchListPropB] = watchList[watchListPropA][watchListPropB] || [];
				// 		if(watchList[watchListPropA][watchListPropB].indexOf(dataContext) === -1){
				// 			watchList[watchListPropA][watchListPropB].push({dataContext:dataContext, alias: depProp});
				// 		}
				// 	}
				// }
			}
		}
	}
	// //move this within if statement above
	// Object.defineProperty(appState.persons.state, '$hobbies', {
	// 	configurable: true,
	// 	enumerable: true,
	// 	get: function(){ return appState.hobbies; }
	// });
	// Object.freeze(appState.persons.state);
	// Object.defineProperty(appState.hobbies.state, '$persons', {
	// 	configurable: true,
	// 	enumerable: true,
	// 	get: function(){ return appState.persons; },
	// 	set: function(persons) {
	// 		console.log('persons has been set');
	// 		console.log(persons);
	// 	}
	// });
	// Object.freeze(appState.hobbies.state);

	appState.persons.state.$hobbies = appState.hobbies;
	appState.hobbies.state.$persons = appState.persons;

	appState.persons.state.$hobbies = new dataContexts.hobbies(appState.hobbies);
	appState.hobbies.state.$persons = new dataContexts.persons(appState.persons);

	// Object.defineProperty(appState.persons.previousState, '$hobbies', {
	// 	configurable: false,
	// 	enumerable: true,
	// 	get: function(){ return {}; }
	// });
	// Object.freeze(appState.persons.previousState);
	// Object.defineProperty(appState.hobbies.previousState, '$persons', {
	// 	configurable: false,
	// 	enumerable: true,
	// 	get: function(){ return {}; }
	// });
	// Object.freeze(appState.hobbies.previousState);
		
	appState = new ApplicationDataContext(appState, void(0), enableUndo, false);
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

var ModelBase = function(){};
var ViewModelBase = function(){};
var DomainModelBase = function(){};

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

    ConvenienceConstructor.getDescriptor = function(){
      var descriptor = {};
      var proto = this.prototype;
      var uid;
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
              } else if(this.originalSpec[key].kind === 'uid'){
                uid = key;
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
        freezeFields: autoFreeze,
        uid: uid
      };

      return this.originalSpec.__processedObject__;
    };

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
      
      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      var dataContext = function(nextState, prevState, enableUndo, initialize) {
        
        var freezeFields = desc.freezeFields;
        var domainModel = Object.create(desc.proto, desc.descriptor);
        
        //Need to have 'state' prop in domainModel before can extend domainModel to get correct state
        Object.defineProperty(domainModel, 'state', {
          configurable: true,
          enumerable: true,
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
        
        nextState = extend(nextState, domainModel);
        
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

      var desc = this.getDescriptor(this);
      desc.stateChangedHandler = stateChangedHandler;
      desc.proto.__getDescriptor = function(){
        return desc;
      }

      var dataContext = function(nextState, initialize) {
        
        var freezeFields = desc.freezeFields;
        var model = Object.create(desc.proto, desc.descriptor);

        if(nextState === void(0)){
          initialize = true;
        }
        nextState = nextState || {};

        Object.defineProperty(model, 'state', {
          configurable: true,
          enumerable: true,
          writable: true,
          value: nextState
        });

        nextState = extend(nextState, model);
        
        if(initialize && ('getInitialState' in model)){
          nextState = extend(nextState, model.getInitialState.call(model));
        }

        Object.defineProperty(model, 'state', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: nextState
        });

        //freeze arrays and model instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
            Object.freeze(model[freezeFields[i].fieldName]);
        };
        //return model;
        return Object.freeze(model);
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

      var desc = this.getDescriptor(this);
      desc.proto.setState = stateChangedHandler;

      // console.log('viewModel');
      var dataContext = function(nextState, initialize) {

        //nextState has already been extended with prevState in core
        //nextState = extend(nextState, dependencies);
        
        var freezeFields = desc.freezeFields;
        var viewModel = Object.create(desc.proto, desc.descriptor);
        var tempDesc,
          tempModel;

        // Object.defineProperty(viewModel, 'previousState', {
        //   configurable: true,
        //   enumerable: true,
        //   writable: true,
        //   value: {}
        // });
        
        if(nextState.state){
          nextState = extend(nextState.state, nextState);
          delete nextState.state;
        }
        
        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: true,
          writable: true,
          value: nextState
        });
        

        if(initialize && ('getInitialState' in viewModel)){
          nextState = extend(nextState, viewModel.getInitialState.call(viewModel));          
        
          Object.defineProperty(viewModel, 'state', {
            configurable: false,
            enumerable: true,
            writable: true,
            value: nextState
          });
        }
        //freeze arrays and viewModel instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
          if(freezeFields[i].kind === 'instance'){
              if(viewModel[freezeFields[i].fieldName]){
                tempDesc = viewModel[freezeFields[i].fieldName].__getDescriptor();
                tempModel = Object.create(tempDesc.proto, tempDesc.descriptor);

                Object.defineProperty(tempModel, 'state', {
                  configurable: false,
                  enumerable: true,
                  writable: false,
                  value: viewModel[freezeFields[i].fieldName].state
                });
                
                tempModel.__proto__.setState = function(nextState, callback){ //callback may be useful for DB updates
                    return tempDesc.stateChangedHandler.bind(viewModel)
                      .call(viewModel, extend(this.state, nextState), this.state, callback);
                }.bind(tempModel);
                
                viewModel[freezeFields[i].fieldName] = Object.freeze(tempModel);
              }

          } else {
            Object.freeze(viewModel[freezeFields[i].fieldName]);
          }
        };
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