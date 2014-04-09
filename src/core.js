
var utils = require('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, stateChangedHandler, enableUndo) {

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

	var invokedWithCallback = false;

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

	var watchedState = {
		persons: ['hobbies'],
		hobbies: ['persons']
	}

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
			nextState = extend(newState);
			prevState = newState.previousState;
		} else {

			if(caller !== appNamespace){
				
				nextState[caller] = extend(appState[caller], newState);
				nextState[caller] = new dataContexts[caller](extend(appState, nextState)); //All this should really do is create
				//a viewModel with the prototype and enable calling initial and onStateChange functions
				
				//for each subscriber call onStateChanging(next.hobbies.state) => pass in nextState
				//also call if for datacontext that is invoking the change
				nextState = extend(appState, nextState);

				if(caller in watchedState){
					var list = watchedState[caller];
					list.forEach(function(vm){
						if(appState[vm].onWatchedStateChanged){
							nextState[vm] = extend(nextState[vm], appState[vm].onWatchedStateChanged(caller, nextState[caller]));
							// nextState[vm] = new dataContexts[vm](nextState);
							// nextState = extend(appState, nextState);
							
							// nextState[caller] = new dataContexts[caller](nextState);
							// nextState = extend(appState, nextState);

						}
						nextState[vm] = new dataContexts[vm](nextState);
					});
					nextState = extend(appState, nextState);
					
					nextState[caller] = new dataContexts[caller](nextState);
					nextState = extend(appState, nextState);
				}
				// if(appState.hobbies.onWatchedStateChanged){
				// 	nextState.hobbies = extend(nextState.hobbies, appState.hobbies.onWatchedStateChanged(caller, nextState[caller]));
				// 	nextState.hobbies = new dataContexts.hobbies(nextState);
				// 	nextState = extend(appState, nextState);
				// 	// nextState.hobbies.state.$persons = nextState.persons;
				// 	// nextState.persons.state.$hobbies = new dataContexts.hobbies(nextState);
				// }

				//At this point assign nextState to all subscribers
				// nextState.persons.state.$hobbies = nextState.hobbies;
				// nextState.hobbies.state.$persons = nextState.persons;

				// if(caller === 'persons' && ('$persons' in nextState.hobbies.state)){
				// 	Object.defineProperty(nextState.hobbies.state, '$persons', {
				// 		configurable: true,
				// 		enumerable: true,
				// 		get: function(){ 
				// 			return appState.persons; 
				// 		},
				// 		set: function(persons) {
				// 			if(appState.hobbies.onWatchedStateChanged){
				// 				nextState.hobbies = extend(nextState.hobbies, appState.hobbies.onWatchedStateChanged(caller, persons));
				// 				nextState.hobbies = new dataContexts.hobbies(nextState);
				// 				nextState = extend(appState, nextState);
				// 				// nextState.hobbies.state.$persons = nextState.persons;
				// 				// nextState.persons.state.$hobbies = new dataContexts.hobbies(nextState);
				// 			}
				// 		}
				// 	});
				// }

				// Object.defineProperty(nextState.hobbies.state, '$', {
				// 	configurable: true,
				// 	enumerable: true,
				// 	get: function(){ 
				// 		return nextState;
				// 	}
				// });
				

			} else {
				nextState = extend(appState, newState);
			}
			prevState = appState;
		}

		// if(appState.hobbies.onWatchedStateChanged){
		// 	nextState.hobbies = extend(nextState.hobbies, appState.hobbies.onWatchedStateChanged(caller, nextState[caller]));
		// 	nextState.hobbies = new dataContexts.hobbies(nextState);
		// 	nextState = extend(appState, nextState);
		// 	// nextState.hobbies.state.$persons = nextState.persons;
		// 	// nextState.persons.state.$hobbies = new dataContexts.hobbies(nextState);
		// }
		//nextState.hobbies.state.$persons = new dataContexts.persons(nextState);
		//nextState.persons.state.$hobbies = new dataContexts.hobbies(nextState);

		if(!!prevState){
			Object.freeze(prevState);
		}

		if(caller !== appNamespace && typeof callback === 'function'){
			//Create a new App state context.
			appState = new ApplicationDataContext(nextState, prevState, enableUndo);
			invokedWithCallback = true;
			callback(appState[caller]);
		} else {
			//Create a new App state context.
			appState = new ApplicationDataContext(nextState, invokedWithCallback ? prevState.previousState: prevState, enableUndo);
			invokedWithCallback = false;
			//All the work is done! -> Notify the View
			stateChangedHandler(appState, caller, callback);
		}

		Object.freeze(appState);
		Object.freeze(appState.state);
		//Provided for the main app to return to the View
		return appState;
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	appState = new ApplicationDataContext({}, void(0), enableUndo, true);

	domain = configure(appState.getDomainDataContext(), 'viewModel');

	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext)).bind(this, dataContext);
			appState[dataContext] = new dataContexts[dataContext](appState, true);
		}
	}

	appState = new ApplicationDataContext(appState, void(0), enableUndo, false);
	Object.freeze(appState.state);
	Object.freeze(appState);
	return appState;
};