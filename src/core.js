
var utils = require('./utils');
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
		watchedDataContexts = {},
		watchedDomainProps = {};

	var appStateChangedHandler = function(caller, newState, callback) {
		
		var nextState = {},
			prevState = {},
			newStateKeys;

		newState = newState || {};
		newStateKeys = Object.keys(newState);
		if(newStateKeys.length === 0){
			return;
		}

		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangedHandler. If a callback was passed in
		//it would be assigned to newState
		if(Object.getPrototypeOf(newState).constructor.classType === "DomainViewModel") {
			nextState = extend(newState);
			prevState = newState.previousState;

			for(var dc in watchedDataContexts){
				nextState[dc] = new dataContexts[dc](nextState);
			}

		} else {

			if(caller !== appNamespace){
				
				nextState[caller] = extend(appState[caller], newState);
				nextState[caller] = new dataContexts[caller](extend(appState, nextState)); //All this should really do is create
				//a viewModel with the prototype and enable calling initial and onStateChange functions
				
				//for each subscriber call onStateChanging(next.hobbies.state) => pass in nextState
				//also call if for datacontext that is invoking the change
				nextState = extend(appState, nextState);

				if(caller in watchedDataContexts){
					watchedDataContexts[caller].forEach(function(vm){
						if(appState[vm].onWatchedDataContextChanged){
							nextState[vm] = extend(nextState[vm], appState[vm].onWatchedDataContextChanged(caller, nextState[caller]));
						}
						nextState[vm] = new dataContexts[vm](nextState);
					});
					nextState[caller] = new dataContexts[caller](extend(appState, nextState));
					nextState = extend(appState, nextState);
				}

			} else {
				//app called
				var tmp = {};
				nextState = extend(appState, newState);
				newStateKeys.forEach(function(key){
					if(key in watchedDomainProps){
						watchedDomainProps[key].forEach(function(prop){
							tmp[prop] = true;
						});
					}
				});
				Object.keys(tmp).forEach(function(vm){
					if(appState[vm].onWatchedDomainPropsChanged){
						nextState[vm] = extend(nextState[vm], appState[vm].onWatchedDomainPropsChanged(nextState.state));
					}
					nextState[vm] = new dataContexts[vm](nextState);
				})
				nextState = extend(appState, nextState);

			}
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
	appState = new ApplicationDataContext(void(0), void(0), enableUndo, true);

	domain = appState.getDomainDataContext();

	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].call(this, appStateChangedHandler.bind(this, dataContext)).bind(this, dataContext);
			appState[dataContext] = new dataContexts[dataContext](appState, true);

			if('watchDataContexts' in appState[dataContext]){
				appState[dataContext].watchDataContexts.forEach(function(dataContextName){
					if(dataContextName in domain){
						if(!(dataContextName in watchedDataContexts)){
							watchedDataContexts[dataContextName] = [dataContext]
						} else {
							watchedDataContexts[dataContextName].push(dataContext);
						}						
					}
				});
			}

			if('watchDomainProps' in appState[dataContext]){
				appState[dataContext].watchDomainProps.forEach(function(propName){
					if(propName in appState.state){
						if(!(propName in watchedDomainProps)){
							watchedDomainProps[propName] = [dataContext]
						} else {
							watchedDomainProps[propName].push(dataContext);
						}
					}
				});
			}
		}
	}

	appState = new ApplicationDataContext(appState, void(0), enableUndo, false);
	Object.freeze(appState.state);
	Object.freeze(appState);
	return appState;
};