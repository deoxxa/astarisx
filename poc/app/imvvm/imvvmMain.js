/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var IMVVM = IMVVM || {};

IMVVM.uuid = function () {
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
};

IMVVM.Main = function(appNamespace, appViewModel, initArgs, dataContexts, stateChangedHandler, noUndo) {

	if(typeof stateChangedHandler !== 'function'){
		throw new TypeError();
	}
	
	var appDataContextName = appNamespace,
		thisAppState = void 0,
		dataContextObjs = {},
		watchedProps,
		watchList = {};

	var extend = function () {
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
	};
		
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