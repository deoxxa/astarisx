
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
		watchedDomainProps = {},
		hasWatchedDataContexts = false,
		hasWatchedDomainProps = false;

	var appStateChangedHandler = function(caller, newState, callback) {
		
		var nextState = {},
			prevState = {},
			newStateKeys;

		newState = newState || {};
		newStateKeys = Object.keys(newState);
		if(newStateKeys.length === 0){
			return;
		}

		nextState = extend(newState);

		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangedHandler. If a callback was passed in
		//it would be assigned to newState
		if(Object.getPrototypeOf(newState).constructor.classType === "DomainViewModel") {
			// nextState = extend(newState);
			prevState = newState.previousState;

			for(var dc in watchedDataContexts){
				nextState[dc] = new dataContexts[dc](nextState);
			}

		} else {

			if(caller !== appNamespace){
				nextState[caller] = extend(appState[caller], newState);
				nextState[caller] = new dataContexts[caller](extend(appState, nextState));
			} else {
				var global = true;
			}

			nextState = extend(appState, nextState);

			var processed = [];
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
	/*Need to look at DomainViewModel state and nextState and Domain Model and updating*/
	appState = new ApplicationDataContext(void(0), void(0), enableUndo, true);

	domain = appState.getDomainDataContext();

	if('getWatchList' in appState){
		appState.getWatchList.forEach(function(watchedItem){
			if(watchedItem in domain){
				if(!(watchedItem in watchedDataContexts)){
					watchedDataContexts[watchedItem] = [appNamespace]
				} else {
					watchedDataContexts[watchedItem].push(appNamespace);
				}
			}
			//  else if(watchedItem in appState.state){
			// 	if(!(watchedItem in watchedDomainProps)){
			// 		watchedDomainProps[watchedItem] = [appNamespace]
			// 	} else {
			// 		watchedDomainProps[watchedItem].push(appNamespace);
			// 	}
			// }
		});
	}


	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].call(this, appStateChangedHandler.bind(this, dataContext)).bind(this, dataContext);
			appState[dataContext] = new dataContexts[dataContext](appState);

			if('getWatchList' in appState[dataContext]){
				appState[dataContext].getWatchList.forEach(function(watchedItem){
					if(watchedItem in domain){
						if(!(watchedItem in watchedDataContexts)){
							watchedDataContexts[watchedItem] = [dataContext]
						} else {
							watchedDataContexts[watchedItem].push(dataContext);
						}
					} else if(watchedItem in appState.state){
						if(!(watchedItem in watchedDomainProps)){
							watchedDomainProps[watchedItem] = [dataContext]
						} else {
							watchedDomainProps[watchedItem].push(dataContext);
						}
					}
				});
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