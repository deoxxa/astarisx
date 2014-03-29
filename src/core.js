
var utils = require('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, initArgs, domain, stateChangedHandler, disableUndo) {

	if(typeof stateChangedHandler !== 'function'){
		throw new TypeError();
	}
	
	var thisAppState = {},
		dataContexts = {},
		watchedProps,
		watchList = {};

	disableUndo === void(0) ? false : disableUndo;
		
	var transitionState = function(nextState, prevState, watchedDataContext){
		var processed = false,
			dependencies,
			initialize;

		prevState = prevState || {};

		if(nextState === void(0)){
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
							watchedValue = watchedValue ? watchedValue[prop] : void(0);
						}
					});
					if('alias' in dependency){
						deps[dependency.alias] = watchedValue;
					} else {
						deps[props.join('$')] = watchedValue;
					}
				});
			}
			return deps;
		};

		for(var dataContext in domain){
			if(domain.hasOwnProperty(dataContext)){
				dependencies = getDependencies(domain[dataContext]);
				//Need to inject dependencies so that the state for this object can change
				//if required. Can't use appState as that is provided after the object is created
				if(initialize){
					nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext], dependencies, prevState[dataContext]).init(domain[dataContext].initArgs);
				} else {
					nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext], dependencies, prevState[dataContext]);
				}
				if(watchedDataContext){
					if(processed && watchedDataContext.subscribers.indexOf(dataContext) !== -1){
						dependencies = getDependencies(domain[watchedDataContext.name]);
						nextState[watchedDataContext.name] = new dataContexts[watchedDataContext.name](nextState[watchedDataContext.name], dependencies, prevState[watchedDataContext.name]);
					}
					processed = processed ? processed : dataContext === watchedDataContext.name;
				}					
			}
		}
		return nextState;
	};

	var appStateChangedHandler = function(caller, newState, callback, initialize) {
		var appContext = {},
			nextState = {},
			prevState = {},
			watchedDataContext = void(0),
			newStateKeys,
			newStateKeysLen,
			subscriberKeys;

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
					nextState = extend(transitionState(), newState);
				} else {
					nextState = extend(thisAppState.state, newState);
				}
			}
			prevState = thisAppState.state;
			nextState = transitionState(nextState, thisAppState.state, watchedDataContext);
		}
		prevState = prevState || {};
		Object.freeze(prevState);

		//Create a new App state context. Only pass in previous state if it is actually an ApplicationDataContext
		thisAppState = new ApplicationDataContext(nextState, prevState, disableUndo, initialize);
		appContext = thisAppState.state;
		
		if(!initialize && !disableUndo){
			appContext.previousState = thisAppState.previousState;
		}
		Object.freeze(appContext);
		//All the work is done! -> Notify the View
		stateChangedHandler(appContext, caller, callback);
		//Provided for the main app to return from init() to the View
		return appContext;
	};

	var ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));

	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			if('dependsOn' in domain[dataContext]){
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
	return new ApplicationDataContext().init(initArgs);
};