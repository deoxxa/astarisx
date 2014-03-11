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
	var Main = function(applicationNamespace, appDataContext, dataContexts, dependencies, stateChangedHandler/*, restArgs*/) {

		if(typeof stateChangedHandler !== 'function'){
			throw new TypeError();
		}
		
		dependencies = dependencies || [];

		var restArgs = arguments.length >= 5 ? Array.prototype.slice.call(arguments).slice(5) : void 0;
		
		var appDataContextName = applicationNamespace,
			dataContextObjs = {},
			subscribers,
			watchedProps,
			subscribersList;

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

		var watchedStateChangedHandler = function(caller, processed, callerState){
			/* "this" bound to nextState variable at initialisation */
			var nextState = this,
				callerNextState = {},
				props,
				watchers,
				watchedValue;

			callerNextState[caller] = callerState;
			callerNextState = extend(nextState, callerNextState);

			//Update watchers
			dataContexts.forEach(function(dataContext){				
				//Only update if the PM has already been processed and it has
				//a dependency on the caller data context
				if(dataContext.name !== caller && ('watch' in dataContext) &&
					processed.indexOf(dataContext.name) !== -1 &&
					dataContext.watchers.indexOf(caller) !== -1){
					watchers = {};
					dataContext.watch.forEach(function(dependency){
						props = dependency.property.split('.');
						props.forEach(function(prop, idx){
							if(idx === 0){
								watchedValue = callerNextState[prop];
							} else {
								watchedValue = watchedValue[prop];
							}
						});
						if('alias' in dependency){
							watchers[dependency.alias] = watchedValue;
						} else {
							watchers[props.slice(-1)[0]] = watchedValue;
						}
					});
					//Need to inject watchers so that the state for this object can change
					//if required. Can't use appState as that is provided after the object is created
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], watchers,
						watchedStateChangedHandler.bind(nextState, dataContext.name, processed));
				}
			});
		};

		var transitionState = function(nextState){
			var processed = [],//stores datacontexts already processed
				props,
				watchers,
				watchedValue,
				initialize;

			if(nextState === void 0){
				initialize = true;
				nextState = {};
			}
			//Update state and watchers
			dataContexts.forEach(function(dataContext){
				processed.push(dataContext.name);
				if('watch' in dataContext){
					watchers = {};
					dataContext.watch.forEach(function(dependency){
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
							watchers[dependency.alias] = watchedValue;
						} else {
							watchers[props.slice(-1)[0]] = watchedValue;
						}
					});
				}
				//Need to inject watchers so that the state for this object can change
				//if required. Can't use appState as that is provided after the object is created
				if(initialize){
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], watchers,
					watchedStateChangedHandler.bind(nextState, dataContext.name, processed)).init(dataContext.initArgs);
				} else {
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], watchers,
					watchedStateChangedHandler.bind(nextState, dataContext.name, processed));
				}
				
			});

			return nextState;
		};

		var appStateChangedHandler = function(callerDataContext, appState, newState, callback) {
			var appContext,
				nextState = {};

			//Check to see if appState is a ready made state object. If so
			//pass it straight to the stateChangedHandler. If a callback was passed in
			//it would be assigned to newState
			if(appState instanceof ApplicationDataContext && (newState === void 0 || typeof newState === 'function')) {
				//This means previous state has been requested
				//so set nextState to the previous state
				nextState = extend(appState);
				callback = newState;
				newState = void 0;
				//revert the current appState to the previous state of the previous state
				appState = appState.previousState;
			} else if(callerDataContext !== appDataContextName){
				nextState[callerDataContext] = newState;
				nextState = extend(appState, nextState);
			} else {
				//appDataContextName is calling function
				if(Object.keys(appState).length === 0){
					nextState = extend(transitionState(), newState);
				} else {
					nextState = extend(appState, newState);	
				}
			}

			nextState = transitionState(nextState);

			//Create a new App state. Only pass in previous state if it is actually an ApplicationDataContext
			appContext = new ApplicationDataContext(nextState, appState instanceof ApplicationDataContext ? appState : void 0);

			//All the work is done! -> Notify the View
			stateChangedHandler(appContext, callback);

			//Provided for the main app to return from init() to the View
			return appContext;
		};
		//Dependency Injection
		var args = [appStateChangedHandler.bind(this, appDataContextName)];
		args.push.apply(args, dependencies);
		var ApplicationDataContext = appDataContext.apply(this, args);
		ApplicationDataContext.prototype.extend = extend;

		//Initilise all the viewModels and store the data context Objects
		dataContexts.forEach(function(dataContext){
			//Dependency Injection
			args = [appStateChangedHandler.bind(this, dataContext.name)];
			args.push.apply(args, dataContext.dependencies);
			dataContextObjs[dataContext.name] = dataContext.viewModel.apply(this, args);
			dataContextObjs[dataContext.name].prototype.extend = extend;

			//Store dependent's data context names for later use in updateDependencies
			//Only store names of viewModels and not of the Application model
			//because the latest Application Model props are always available to all PMs
			if('watch' in dataContext){
				subscribers = {};
				for(var i = 0, len = dataContext.watch.length; i < len; i++){
					watchedProps = dataContext.watch[i].property.split('.');
					if(watchedProps.length > 1){
						subscribers[watchedProps[0]] = true;
					}
				}
				subscribersList = Object.keys(subscribers);
				if(subscribersList.length > 0){
					dataContext.watchers = subscribersList;
				}
			}
		});

		return new ApplicationDataContext().init(restArgs);
	};
	return Main;
}());