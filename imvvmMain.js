/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var IMVVM = IMVVM || {};

IMVVM.Main = (function(IMVVM, App){
	var Main = function(applicationNamespace, appDataContext, dataContexts, stateChangedHandler/*, restArgs*/) {

		if(typeof stateChangedHandler !== 'function'){
			throw new TypeError();
		}

		var restArgs = arguments.length >= 4 ? Array.prototype.slice.call(arguments).slice(4) : void 0;
		
		var extend = IMVVM.Utils.extend;
		
		var appDataContextName = applicationNamespace,
			dataContextObjs = {},
			dependents,
			dependentProps,
			dependencyKeys;

		var dependencyStateChangedHandler = function(caller, processed, callerState){
			/* "this" bound to nextState variable at initialisation */
			var nextState = this,
				callerNextState = {},
				props,
				dependencies,
				dependencyValue;

			callerNextState[caller] = callerState;
			callerNextState = extend(nextState, callerNextState);

			//Update dependencies
			dataContexts.forEach(function(dataContext){				
				//Only update if the PM has already been processed and it has
				//a dependency on the caller data context
				if(dataContext.name !== caller && ('dependsOn' in dataContext) &&
					processed.indexOf(dataContext.name) !== -1 &&
					dataContext.dependencies.indexOf(caller) !== -1){
					dependencies = {};
					dataContext.dependsOn.forEach(function(dependency){
						props = dependency.property.split('.');
						props.forEach(function(prop, idx){
							if(idx === 0){
								dependencyValue = callerNextState[prop];
							} else {
								dependencyValue = dependencyValue[prop];
							}
						});
						if('alias' in dependency){
							dependencies[dependency.alias] = dependencyValue;
						} else {
							dependencies[props.slice(-1)[0]] = dependencyValue;
						}
					});
					//Need to inject dependencies so that the state for this object can change
					//if required. Can't use appState as that is provided after the object is created
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], dependencies,
						dependencyStateChangedHandler.bind(nextState, dataContext.name, processed));
				}
			});
		};

		var transitionState = function(nextState){
			var processed = [],//stores datacontexts already processed
				props,
				dependencies,
				dependencyValue,
				initialize;

			if(nextState === void 0){
				initialize = true;
				nextState = {};
			}

			//Update state and dependencies
			dataContexts.forEach(function(dataContext){
				processed.push(dataContext.name);
				if('dependsOn' in dataContext){
					dependencies = {};
					dataContext.dependsOn.forEach(function(dependency){
						dependencyValue = {};
						props = dependency.property.split('.');
						props.forEach(function(prop, idx){
							if(idx === 0){
								dependencyValue = nextState[prop];
							} else {
								dependencyValue = dependencyValue ? dependencyValue[prop] : void 0;
							}
						});
						if('alias' in dependency){
							dependencies[dependency.alias] = dependencyValue;
						} else {
							dependencies[props.slice(-1)[0]] = dependencyValue;
						}
					});
				}
				//Need to inject dependencies so that the state for this object can change
				//if required. Can't use appState as that is provided after the object is created
				if(initialize){
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], dependencies,
					dependencyStateChangedHandler.bind(nextState, dataContext.name, processed)).init(dataContext.initArgs);
				} else {
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], dependencies,
					dependencyStateChangedHandler.bind(nextState, dataContext.name, processed));
				}
				
			});

			return nextState;
		};

		var raiseStateChangedHandler = function(callerDataContext, appState, newState, callback) {
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

		var ApplicationDataContext = appDataContext(raiseStateChangedHandler.bind(this, appDataContextName));

		//Initilise all the viewModels and store the data context Objects
		dataContexts.forEach(function(dataContext){
			dataContextObjs[dataContext.name] = dataContext.viewModel(raiseStateChangedHandler.bind(this, dataContext.name));
			
			//Store dependent's data context names for later use in updateDependencies
			//Only store names of viewModels and not of the Application model
			//because the latest Application Model props are always available to all PMs
			if('dependsOn' in dataContext){
				dependents = {};
				for(var i = 0, len = dataContext.dependsOn.length; i < len; i++){
					dependentProps = dataContext.dependsOn[i].property.split('.');
					if(dependentProps.length > 1){
						dependents[dependentProps[0]] = true;
					}
				}
				dependencyKeys = Object.keys(dependents);
				if(dependencyKeys.length > 0){
					dataContext.dependencies = dependencyKeys;
				}
			}
		});

		return new ApplicationDataContext().init(restArgs);
	};
	return Main;
}(IMVVM, MyApp));