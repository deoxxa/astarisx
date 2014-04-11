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
		appState = {},
		dataContexts = {},
		domain,
		invokedWithCallback = false,
		links = {},
		watchedDataContexts = {},
		watchedDomainProps = {},
		hasWatchedDataContexts = false,
		hasWatchedDomainProps = false;

		var isPreviousState = false;

	var appStateChangedHandler = function(caller, newState, callback) {
		
		var nextState = {},
			prevState = {},
			newStateKeys;

		newState = newState || {};
		newStateKeys = Object.keys(newState);
		if(newStateKeys.length === 0){
			return;
		}

		//nextState = extend(newState);

		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangedHandler. If a callback was passed in
		//it would be assigned to newState
		if(Object.getPrototypeOf(newState).constructor.classType === "DomainViewModel") {
			
			nextState = extend(newState);
			prevState = newState.previousState;

			//Need to reset ViewModel with instance object so that setState is associated with
			//the current ViewModel. This reason this ccurs is that when a ViewModel is created it
			//assigns a setState function to all instance fields and binds itself to it. When undo is called
			//the data is rolled back but viewModels are not recreated and therefore the setState functions
			//are associated with outdated viewModels and returns unexpected output. So to realign the ViewModels
			//with setState we recreate them.
			for(var dc in domain){
				nextState[dc] = new dataContexts[dc](nextState);
			}

		} else {

			if(caller !== appNamespace){
				nextState[caller] = extend(appState[caller], newState);
				nextState = extend(appState, nextState);
				nextState[caller] = new dataContexts[caller](nextState);
				nextState = extend(appState, nextState);

				//It seems that calling
				// nextState = ApplicationDataContext(nextState, void(0), enableUndo)
				// freezes nextState. Need to extend it to unfreeze
				nextState = extend(ApplicationDataContext(nextState, void(0), enableUndo));

				if(caller in watchedDataContexts){
					for(var watchedField in watchedDataContexts[caller]){
						if(watchedDataContexts[caller].hasOwnProperty(watchedField)){
							if(newStateKeys.indexOf(watchedField) !== -1){
								var subscribers = watchedDataContexts[caller][watchedField];
								for(var sub in subscribers){
									if(subscribers.hasOwnProperty(sub)){
										
										nextState[sub] = extend(nextState[sub], subscribers[sub].call(appState[sub],
											nextState[caller][watchedField],
											appState[caller][watchedField], watchedField, caller));
										
										nextState[sub] = new dataContexts[sub](nextState);
													nextState = extend(appState, nextState);
													nextState = extend(ApplicationDataContext(nextState, void(0), enableUndo));

										//link
										if(sub in links){
							        for(var k2 in links[sub]){
							          if(links[sub].hasOwnProperty(k2)){
							            nextState[sub].state[links[sub][k2]] = (k2 in domain) ? extend(nextState[k2].state): nextState[k2];
							          }
							        }
							      }
									}
								}
							}
						}
					}
					nextState[caller] = new dataContexts[caller](nextState);
				}
			nextState = extend(appState, nextState);
			nextState = extend(ApplicationDataContext(nextState, void(0), enableUndo));

			//now link
			if(caller in links){
        for(var k in links[caller]){
          if(links[caller].hasOwnProperty(k)){
            nextState[caller].state[links[caller][k]] = (k in domain) ? extend(nextState[k].state): nextState[k];
          }
        }
      }
			nextState = extend(appState, nextState);
			nextState = ApplicationDataContext(nextState, void(0), enableUndo);
			//I think I need to pass in watched Items
			//nextState = ApplicationDataContext(extend(appState, nextState), void(0), enableUndo);
				
				// for(var linkKey in nextState[caller].linkTo){
				// 	if(nextState[caller].linkTo.hasOwnProperty(linkKey)){
				// 		//Just check to see if it's as ViewModel
				// 		if((linkKey in domain) && (nextState[caller].linkTo[caller] in appState[linkKey])){ //Then we need to update the link
				// 			nextState[linkKey] = new dataContexts[linkKey](extend(appState, nextState));
				// 		}
				// 	}
				// }
				// nextState[caller] = new dataContexts[caller](extend(appState, nextState));
				//nextState = ApplicationDataContext(extend(appState, nextState), void(0), enableUndo);


			} else {
				var global = true;
			}

			//nextState = extend(appState, nextState);

			/*var processed = [];
			//first check global state
			if(hasWatchedDomainProps && caller === appNamespace){
				for (var i = newStateKeys.length - 1; i >= 0; i--) {
					if(newStateKeys[i] in watchedDomainProps){
						watchedDomainProps[newStateKeys[i]].forEach(function(vm){
							if(processed.indexOf(vm) === -1){
								processed.push(vm);
								if(appState[vm].onWatchedStateChanged){
									nextState = extend(nextState,	appState[vm].onWatchedStateChanged(nextState));
								}
								nextState[vm] = new dataContexts[vm](nextState);
								nextState = extend(appState, nextState);
							}							
						});
					}
				};
				//nextState = new ApplicationDataContext(nextState, void(0), enableUndo);
			}
			
			if(caller in watchedDataContexts){
				watchedDataContexts[caller].forEach(function(vm){
					if(vm === appNamespace) {
						if(appState.onWatchedStateChanged){
							nextState = extend(appState,
								appState.onWatchedStateChanged(nextState[caller], caller));
						}
						//nextState = new ApplicationDataContext(nextState, void(0), enableUndo);
					} else {
						if(appState[vm].onWatchedStateChanged){
							nextState[vm] = extend(nextState[vm],
								appState[vm].onWatchedStateChanged(nextState[caller], caller));
						}
						//adding this worked!
						nextState = new ApplicationDataContext(nextState, void(0), enableUndo);
						nextState[vm] = new dataContexts[vm](nextState);
					}
				});
				nextState[caller] = new dataContexts[caller](nextState);
				nextState = extend(appState, nextState);	
			}*/
			prevState = invokedWithCallback ? appState.previousState: appState;
			invokedWithCallback = false;
		}

		if(!!prevState){
			Object.freeze(prevState);
		}
		
		appState = new ApplicationDataContext(nextState, prevState, enableUndo);

		if(typeof callback === 'function'){
			//Create a new App state context.
			invokedWithCallback = true;
			callback(caller !== appNamespace ? appState[caller] : appState);
		} else {
			//All the work is done! -> Notify the View
			stateChangedHandler(appState);
		}

		Object.freeze(appState);
		Object.freeze(appState.state);
		
		//Provided for the main app to return to the View
		return appState;
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	/*Need to look at DomainViewModel state and nextState and Domain Model and updating*/
	appState = new ApplicationDataContext(void(0), void(0), enableUndo, true);
  appState.state = appState.state || {};

	domain = appState.getDomainDataContext();

	// if('linkTo' in appState){
	// 	Object.keys(appState.linkTo).forEach(function(watchedItem){
	// 		if(watchedItem in domain){
	// 			if(!(watchedItem in watchedDataContexts)){
	// 				watchedDataContexts[watchedItem] = [appNamespace]
	// 			} else {
	// 				watchedDataContexts[watchedItem].push(appNamespace);
	// 			}
	// 		}
	// 	});
	// }

	var watchedState;
	var watchedItem;
	var watchedProp;
	var tmp;
	// if('getWatchedState' in appState){
 //  	watchedState = appState.getWatchedState();
 //  	for(watchedItem in watchedState){
 //  		if(watchedState.hasOwnProperty(watchedItem)){
 //  			for(watchedProp in watchedState[watchedItem].fields){
 //  				if(watchedState[watchedItem].fields.hasOwnProperty(watchedProp)){
 //      			if(watchedItem in domain){
	// 						tmp = {};
	// 						if(!(watchedItem in watchedDataContexts)){
	// 							watchedDataContexts[watchedItem] = {};
	// 						}
	// 						tmp[watchedProp] = {};
	// 						tmp[watchedProp][appNamespace] = watchedState[watchedItem].fields[watchedProp];
	// 						watchedDataContexts[watchedItem] = tmp;							
	// 					}      					
 //  				}
 //  			}

	// 			if(watchedItem in appState.state){
	// 				if(!(watchedItem in watchedDomainProps)){
	// 					watchedDomainProps[watchedItem] = [appNamespace]
	// 				} else {
	// 					watchedDomainProps[watchedItem].push(appNamespace);
	// 				}
	// 			}

 //  		}
 //  	}
 //  }


	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].call(this, appStateChangedHandler.bind(this, dataContext)).bind(this, dataContext);
      appState.state[dataContext] = new dataContexts[dataContext](appState.state);

      if('getWatchedState' in appState[dataContext]){
      	watchedState = appState[dataContext].getWatchedState();
      	for(watchedItem in watchedState){
      		if(watchedState.hasOwnProperty(watchedItem)){
      			if(watchedItem in domain || watchedItem in appState.state){
	      			if('alias' in watchedState[watchedItem]){
		      			if(!(dataContext in links)){
		      				links[dataContext] = {};
		      			}
		      			links[dataContext][watchedItem] = watchedState[watchedItem].alias;
	      			}
	      			for(watchedProp in watchedState[watchedItem].fields){
	      				if(watchedState[watchedItem].fields.hasOwnProperty(watchedProp)){
			      			if(watchedItem in domain){
										tmp = {};
										if(!(watchedItem in watchedDataContexts)){
											watchedDataContexts[watchedItem] = {};
										}
										tmp[watchedProp] = {};
										tmp[watchedProp][dataContext] = watchedState[watchedItem].fields[watchedProp];
										watchedDataContexts[watchedItem] = tmp;
									}
	      				}
	      			}
      			} /*else if(watchedItem in appState.state){
							if('alias' in watchedState[watchedItem]){
		      			if(!(dataContext in links)){
		      				links[dataContext] = {};
		      			}
		      			links[dataContext][watchedItem] = watchedState[watchedItem].alias;
	      			}
	      			for(watchedProp in watchedState[watchedItem].fields){
	      				if(watchedState[watchedItem].fields.hasOwnProperty(watchedProp)){
			      			if(watchedItem in domain){
										tmp = {};
										if(!(watchedItem in watchedDataContexts)){
											watchedDataContexts[watchedItem] = {};
										}
										tmp[watchedProp] = {};
										tmp[watchedProp][dataContext] = watchedState[watchedItem].fields[watchedProp];
										watchedDataContexts[watchedItem] = tmp;
									}
	      				}
	      			}				
						}*/
      		}
      	}
      }
		}
	}

	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			for(var k in links[dataContext]){
        if(links[dataContext].hasOwnProperty(k)){
          appState[dataContext].state[links[dataContext][k]] = (k in domain) ? extend(appState[k].state): appState[k];
        }
      }
		}
	}

	hasWatchedDataContexts = !!Object.keys(watchedDataContexts).length;
	hasWatchedDomainProps = !!Object.keys(watchedDomainProps).length;

	appState = new ApplicationDataContext(appState, void(0), enableUndo);
	Object.freeze(appState.state);
	Object.freeze(appState);
	return appState;
};
},{"./utils":8}],3:[function(_dereq_,module,exports){

var model = _dereq_('./imvvmModel');
var viewModel = _dereq_('./imvvmViewModel');
var domainModel = _dereq_('./imvvmDomainViewModel');
var mixin = _dereq_('./mixin');

var utils = _dereq_('./utils');
var extend = utils.extend;
var mixInto = utils.mixInto;

var ModelBase = function(){};
var ViewModelBase = function(){};
var DomainViewModelBase = function(){};

mixInto(ModelBase, model.Mixin);
mixInto(ViewModelBase, viewModel.Mixin);
mixInto(DomainViewModelBase, domainModel.Mixin);

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
      var viewModels = {};
      var autoFreeze = [];

      if('__processedObject__' in this.originalSpec){
        return this.originalSpec.__processedObject__;
      }

      for(var key in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(key)){
          if('get' in this.originalSpec[key] || 'set' in this.originalSpec[key]){
            //assume it is a descriptor
            this.originalSpec[key].enumerable = true;
            if('viewModel' in this.originalSpec[key]) {
              viewModels[key] = this.originalSpec[key].viewModel;
              delete this.originalSpec[key].viewModel;
            } else if('kind' in this.originalSpec[key]){
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

      if(!!Object.keys(viewModels).length){
        proto.getDomainDataContext = function(){
          return viewModels;
        }
      }

      // if('linkTo' in proto){
      //   for(var link in proto.linkTo){
      //     if(proto.linkTo.hasOwnProperty(link)){
      //       (function(){
      //         descriptor[proto.linkTo[link]] = (function(){
      //             var key = proto.linkTo[link];
      //             return {
      //             get: function(){
      //               return this.state[key]
      //             }
      //           }
      //         })();
      //       })();
      //     }
      //   }
      // }

      this.originalSpec.__processedObject__ = { 
        descriptor: descriptor,
        proto: proto,
        originalSpec: this.originalSpec || {},
        freezeFields: autoFreeze
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
  createDomainViewModel: IMVVMClass.createClass.bind(this, DomainViewModelBase, 'DomainViewModel'),
  mixin: mixin
};

module.exports = IMVVM;

},{"./imvvmDomainViewModel":4,"./imvvmModel":5,"./imvvmViewModel":6,"./mixin":7,"./utils":8}],4:[function(_dereq_,module,exports){

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
        
        if(nextState === void(0) && ('getInitialState' in domainModel)){
          //Add state prop so that it can be referenced from within getInitialState
          nextState = domainModel.getInitialState.call(domainModel);
        } else if('state' in nextState){
          delete nextState.state;
        
        //Need to have 'state' prop in domainModel before can extend domainModel to get correct state
        Object.defineProperty(domainModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });
        nextState = extend(nextState, domainModel);
      }
       //Need to have 'state' prop in domainModel before can extend domainModel to get correct state
        Object.defineProperty(domainModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
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
          enumerable: false,
          writable: true,
          value: nextState
        });

        nextState = extend(nextState, model);
        
        if(initialize && ('getInitialState' in model)){
          nextState = extend(nextState, model.getInitialState.call(model));
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

      var dataContext = function(VMName, appState) {

        //nextState has already been extended with prevState in core
        var nextState = {};
        var freezeFields = desc.freezeFields;
        var viewModel = Object.create(desc.proto, desc.descriptor);
        var tempDesc,
          tempModel;

        Object.defineProperty(viewModel, 'state', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: nextState
        });

        if(appState[VMName] === void(0)){
          if('getInitialState' in viewModel){
            nextState = extend(nextState, viewModel.getInitialState.call(viewModel));          
          }
        } else {
          nextState = ('state' in appState[VMName] ? appState[VMName].state : appState[VMName]);
        }

        Object.defineProperty(viewModel, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: nextState
        });

        //freeze arrays and viewModel instances
        for (var i = freezeFields.length - 1; i >= 0; i--) {
          if(freezeFields[i].kind === 'instance'){
              if(viewModel[freezeFields[i].fieldName]){
                tempDesc = viewModel[freezeFields[i].fieldName].__getDescriptor();
                tempModel = Object.create(tempDesc.proto, tempDesc.descriptor);

                Object.defineProperty(tempModel, 'state', {
                  configurable: false,
                  enumerable: false,
                  writable: false,
                  value: viewModel[freezeFields[i].fieldName].state
                });

                tempModel.__proto__.setState = function(someState, callback){ //callback may be useful for DB updates
                    return tempDesc.stateChangedHandler.call(this, extend(tempModel.state, someState), tempModel.state, callback);
                }.bind(viewModel);

                Object.freeze(viewModel[freezeFields[i].fieldName]);
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
	stateChangedHandler: function(dataContext){
  	this.setState({domainDataContext: dataContext})
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