
var utils = require('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, stateChangedHandler, disableUndo) {

	if(typeof stateChangedHandler !== 'function'){
		throw new TypeError();
	}
	
	var ApplicationDataContext,
		thisAppState = {},
		dataContexts = {},
		watchedProps,
		watchList = {},
		domain,
		reprocessing = false;

	disableUndo === void(0) ? false : disableUndo;

	var getDependencies2 = function(nextState, dataContext){
		var deps = {},
			props,
			watchedValue;

		//if('dependsOn' in dataContext){
		dataContext.dependsOn.forEach(function(dependency){
			watchedValue = {};
			props = dependency.property.split('.');
			props.forEach(function(prop, idx){
				if(idx === 0){
					watchedValue = nextState[prop];
				} else {
					watchedValue = watchedValue ? watchedValue[prop] : void(0);
				}
			});
			if('alias' in dependency){
				deps[dependency.alias] = watchedValue;
			} else {
				deps[props.join('$')] = watchedValue;
			}
		});
		//}
		return deps;
	};


	var transitionState = function(caller, initialize, nextState, prevState, watchedDataContext){
		var processed = false,
			dependencies;

		nextState = nextState || {};
		prevState = prevState || {};

		var getDependencies = function(dataContext, caller){
			var deps = {},
				props,
				watchedValue;

			if('dependsOn' in dataContext){
				dataContext.dependsOn.forEach(function(dependency){
					watchedValue = {};
					props = dependency.property.split('.');
					if(caller === true){
						props.forEach(function(prop, idx){
							if(idx === 0){
								watchedValue = nextState[prop];
							} else {
								watchedValue = watchedValue ? watchedValue[prop] : void(0);
							}
						});
						if('alias' in dependency){
							deps[dependency.alias] = watchedValue;
						} else {
							deps[props.join('$')] = watchedValue;
						}
					} else if(caller === props[0]){
						props.forEach(function(prop, idx){
							if(idx === 0){
								watchedValue = nextState[prop];
							} else {
								watchedValue = watchedValue ? watchedValue[prop] : void(0);
							}
						});
						if('alias' in dependency){
							deps[dependency.alias] = watchedValue;
						} else {
							deps[props.join('$')] = watchedValue;
						}
					}
				});
			}
			return deps;
		};

		if(initialize){
			for(var dataContext in domain){
				if(domain.hasOwnProperty(dataContext)){
					dependencies = getDependencies(domain[dataContext], initialize);
					nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext], dependencies, prevState[dataContext]);
					if(!!nextState[dataContext].getInitialState){
						nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext].getInitialState(), 
							dependencies, nextState[dataContext]);
					}
					// nextState[dataContext] = new dataContexts[dataContext]()
					// 	.getInitialState();
				}
				if(watchedDataContext){
					if(processed && watchedDataContext.subscribers.indexOf(dataContext) !== -1){
						dependencies = getDependencies(domain[watchedDataContext.name]);
						nextState[watchedDataContext.name] = new dataContexts[watchedDataContext.name](nextState[watchedDataContext.name],
							dependencies, prevState[watchedDataContext.name]);
					}
					processed = processed ? processed : dataContext === watchedDataContext.name;
				}
			}
		} else {
			dependencies = getDependencies(domain[caller], true);
			nextState[caller] = new dataContexts[caller](nextState[caller], dependencies, prevState[caller]);
			if(watchedDataContext){
				watchedDataContext.subscribers.forEach(function(subscriber){
					dependencies = extend(nextState[subscriber].dependencies,  getDependencies(domain[subscriber], caller));
					nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber], dependencies, prevState[subscriber]);
				});
			}	
		}

		// for(var dataContext in domain){
		// 	if(domain.hasOwnProperty(dataContext)){
		// 		dependencies = getDependencies(domain[dataContext]);
		// 		//Need to inject dependencies so that the state for this object can change
		// 		//if required. Can't use appState as that is provided after the object is created
		// 		if(initialize){
		// 			nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext], dependencies,
		// 				prevState[dataContext]).getInitialState();
		// 		} else {
		// 			nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext], dependencies,
		// 				prevState[dataContext]);
		// 		}
		// 		if(watchedDataContext){
		// 			if(processed && watchedDataContext.subscribers.indexOf(dataContext) !== -1){
		// 				dependencies = getDependencies(domain[watchedDataContext.name]);
		// 				nextState[watchedDataContext.name] = new dataContexts[watchedDataContext.name](nextState[watchedDataContext.name],
		// 					dependencies, prevState[watchedDataContext.name]);
		// 			}
		// 			processed = processed ? processed : dataContext === watchedDataContext.name;
		// 		}					
		// 	}
		// }
		return nextState;
	};

	var appStateChangedHandler = function(caller, newState, callback, initialize) {
		var nextState = {},
			prevState = {},
			watchedDataContext = void(0),
			newStateKeys,
			newStateKeysLen,
			subscriberKeys,
			rollback = false;

		initialize === void(0) ? false : initialize;

		if(!initialize && (newState === void(0) || newState === null || Object.keys(newState).length === 0)){
			return;
		}
		var DomainModel = !!newState ? Object.getPrototypeOf(newState).constructor.classType === "DomainModel" : false;

		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangedHandler. If a callback was passed in
		//it would be assigned to newState
		if(DomainModel) {
			//This means previous state has been requested
			//so set nextState to the previous state
			nextState = extend(newState);
			//revert the current appState to the previous state of the previous state
			prevState = newState.previousState;
			rollback = true;
		} else {
			if(caller in watchList){
				newStateKeys = Object.keys(newState);
				newStateKeysLen = newStateKeys.length;
				subscriberKeys = {};

				for(var i= 0; i < newStateKeysLen; i++){
					if(watchList[caller][newStateKeys[i]]){
						subscriberKeys[watchList[caller][newStateKeys[i]]] = true;
					}
				}
				watchedDataContext = {};
				watchedDataContext.name = caller;
				watchedDataContext.subscribers = Object.keys(subscriberKeys);
				//If there are no subscriber reset watchedDataContext
				watchedDataContext = !!watchedDataContext.subscribers.length ? watchedDataContext : void(0);
			}

			if(caller !== appNamespace){
				nextState[caller] = newState;
				nextState = extend(thisAppState.state, nextState);
			} else {
				//appDataContext is calling function
				if(initialize) {
					nextState = transitionState(caller, true, extend(thisAppState.state, newState));
				} else {
					nextState = extend(thisAppState.state, newState);
				}
			}
			prevState = reprocessing ? thisAppState.previousState : thisAppState;
			nextState = transitionState(caller, caller === appNamespace, nextState, thisAppState.state, watchedDataContext);
		}
		if(!!prevState){
			Object.freeze(prevState);
		}
		//prevState = prevState || {};

		//Create a new App state context.
		thisAppState = new ApplicationDataContext(nextState, prevState, disableUndo);
		if(!!thisAppState.getValidState && !rollback && !reprocessing) {
				var validationObj = thisAppState.getValidState(thisAppState.state, thisAppState.previousState);
				var validationKeys = Object.keys(validationObj);
				for (var keyIdx = validationKeys.length - 1; keyIdx >= 0; keyIdx--) {
					if(Object.prototype.toString.call(validationObj[validationKeys[keyIdx]]) !== '[object Object]' && 
						Object.prototype.toString.call(validationObj[validationKeys[keyIdx]]) !== '[object Array]' &&
						validationObj[validationKeys[keyIdx]] !== thisAppState.state[validationKeys[keyIdx]]){
						reprocessing = true;
						thisAppState.setState(extend(thisAppState.state, validationObj));
						reprocessing = false;
						break;
					}
				};
		}	
		//All the work is done! -> Notify the View
		//Provided for the main app to return from init() to the View
		if(!reprocessing){
			Object.freeze(thisAppState);
			Object.freeze(thisAppState.state);
			stateChangedHandler(thisAppState, caller, callback);
			return thisAppState;
		}
	};
	var dependents = [];
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	thisAppState = new ApplicationDataContext({}, void(0), disableUndo, true);
	domain = thisAppState.getDomainDataContext();
	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			thisAppState[dataContext] = new dataContexts[dataContext]({}, {}, {}, true);
			if('dependsOn' in domain[dataContext]){
				dependents.push(dataContext);
				for(var i = 0, len = domain[dataContext].dependsOn.length; i < len; i++){
					watchedProps = domain[dataContext].dependsOn[i].property.split('.');
					if(watchedProps.length > 1){
						watchList[watchedProps[0]] = watchList[watchedProps[0]] || {};
						watchList[watchedProps[0]][watchedProps[1]] = watchList[watchedProps[0]][watchedProps[1]] || [];
						if(watchList[watchedProps[0]][watchedProps[1]].indexOf(dataContext) === -1){
							watchList[watchedProps[0]][watchedProps[1]].push(dataContext);
						}
					}
				}
			}
		}
	}
	dependents.forEach(function(dependent){
		var dep = getDependencies2(thisAppState, domain[dependent])
		thisAppState[dependent] = new dataContexts[dependent](thisAppState[dependent], dep, {}, true);
	});
	thisAppState = new ApplicationDataContext(extend(thisAppState), void(0), disableUndo);
	return Object.freeze(thisAppState);//.getInitialState(); 
};