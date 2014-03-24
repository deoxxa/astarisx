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

IMVVM.Main = (function(){
	var Main = function(applicationNamespace, appDataContext, dataContexts, stateChangedHandler/*, restArgs*/) {

		if(typeof stateChangedHandler !== 'function'){
			throw new TypeError();
		}

		var restArgs = arguments.length >= 4 ? Array.prototype.slice.call(arguments).slice(5) : void 0;
		
		var appDataContextName = applicationNamespace,
			dataContextObjs = {},
			dataContextHash = {},
			watchedProps,
			watchList = {};

		var thisAppState = void 0;

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
							deps[props.slice(-1)[0]] = watchedValue;
						}
					});
				}
				return deps;
			};

			//Update state and dependencies
			dataContexts.forEach(function(dataContext){
				dependencies = getDependencies(dataContext);
				//Need to inject dependencies so that the state for this object can change
				//if required. Can't use appState as that is provided after the object is created
				if(initialize){
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], dependencies, prevState[dataContext.name]).init(dataContext.initArgs);
				} else {
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], dependencies, prevState[dataContext.name]);
				}
				if(watchedDataContext){
					if(processed && watchedDataContext.subscribers.indexOf(dataContext.name) !== -1){
						dependencies = getDependencies(dataContextHash[watchedDataContext.name]);
						nextState[watchedDataContext.name] = new dataContextObjs[watchedDataContext.name](nextState[watchedDataContext.name], dependencies, prevState[watchedDataContext.name]);
					}
					processed = processed ? processed : dataContext.name === watchedDataContext.name;
				}
			});
			return nextState;
		};

		var appStateChangedHandler = function(callerDataContext, newState, callback) {
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
				nextState = extend(newState);
				//revert the current appState to the previous state of the previous state
				prevState = newState.previousState;

			} else {
				if(callerDataContext !== appDataContextName){
					nextState[callerDataContext] = newState;
					nextState = extend(thisAppState, nextState);
				} else {
					//appDataContextName is calling function
					if(typeof callback === 'boolean' && callback){ //initialise State
						nextState = extend(transitionState(), newState);
					} else {
						nextState = extend(thisAppState, newState);
					}
				}
				prevState = thisAppState;
			}

			nextState = transitionState(nextState, thisAppState, watchedDataContext);

			//Create a new App state context. Only pass in previous state if it is actually an ApplicationDataContext
			appContext = new ApplicationDataContext(nextState, prevState).state;
			Object.freeze(appContext);

			//All the work is done! -> Notify the View
			stateChangedHandler(appContext, callback);

			thisAppState = appContext;
			//Provided for the main app to return from init() to the View
			return appContext;
		};

		var ApplicationDataContext = appDataContext.call(this, appStateChangedHandler.bind(this, appDataContextName));

		//Initilise all the viewModels and store the data context Objects
		dataContexts.forEach(function(dataContext){
			dataContextObjs[dataContext.name] = dataContext.viewModel.call(this, appStateChangedHandler.bind(this, dataContext.name));
			//create a hash of dataContexts for quick access when required
			dataContextHash[dataContext.name] = dataContext;
			//Store dependent's data context names for later use in updateDependencies
			//Only store names of viewModels and not of the Application ViewModel
			//because the latest Application ViewModel props are always available to all ViewModels
			if('dependsOn' in dataContext){
				for(var i = 0, len = dataContext.dependsOn.length; i < len; i++){
					watchedProps = dataContext.dependsOn[i].property.split('.');
					if(watchedProps.length > 1){
						watchList[watchedProps[0]] = watchList[watchedProps[0]] || {};
						watchList[watchedProps[0]][watchedProps[1]] = watchList[watchedProps[0]][watchedProps[1]] || [];
						if(watchList[watchedProps[0]][watchedProps[1]].indexOf(dataContext.name) === -1){
							watchList[watchedProps[0]][watchedProps[1]].push(dataContext.name);
						}
					}
				}
			}
		});
		return new ApplicationDataContext().init(restArgs);
	};
	return Main;
}());