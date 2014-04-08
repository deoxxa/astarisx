
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
			//This means previous state has been requested
			//so set nextState to the previous state
			nextState = extend(newState);
			//revert the current appState to the previous state of the previous state
	// 			nextState.persons.state.$hobbies = nextState.hobbies;
	// nextState.hobbies.state.$persons = nextState.persons;
			prevState = newState.previousState;
		} else {

			if(caller !== appNamespace){
				
				nextState[caller] = extend(appState[caller], newState);
				nextState[caller] = new dataContexts[caller](nextState[caller]); //All this should really do is create
				//a viewModel with the prototype and enable calling initial and onStateChange functions
				
				//for each subscriber call onStateChanging(next.hobbies.state) => pass in nextState
				//also call if for datacontext that is invoking the change
				nextState = extend(appState, nextState);

				//At this point assign nextState to all subscribers
				nextState.persons.state.$hobbies = nextState.hobbies;
				nextState.hobbies.state.$persons = nextState.persons;

				if(caller === 'persons' && ('$persons' in nextState.hobbies.state) && !Object.isFrozen(nextState.hobbies.state)){
					Object.defineProperty(nextState.hobbies.state, '$persons', {
						configurable: true,
						enumerable: true,
						get: function(){ 
							return appState.persons; 
						},
						set: function(persons) {
							if(appState.hobbies.onWatchedStateChanged){
								nextState.hobbies = extend(nextState.hobbies, nextState.hobbies.onWatchedStateChanged(caller, persons));
								nextState.hobbies = new dataContexts.hobbies(nextState.hobbies);
								nextState = extend(appState, nextState);
								nextState.persons.state.$hobbies = nextState.hobbies;
								nextState.hobbies.state.$persons = nextState.persons;
							}
						}
					});
				}
			} else {
				nextState = extend(appState, newState);
			}
			prevState = appState;
		}

		nextState.hobbies.state.$persons = nextState.persons;
		nextState.persons.state.$hobbies = nextState.hobbies;

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
			stateChangedHandler(appState, caller, callback);
		}

		//All the work is done! -> Notify the View
		//Provided for the main app to return from init() to the View
		Object.freeze(appState);
		Object.freeze(appState.state);

		//stateChangedHandler(appState, caller, callback);
		return appState;
	};
	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	appState = new ApplicationDataContext({}, void(0), enableUndo, true);

	domain = configure(appState.getDomainDataContext(), 'viewModel');

	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			appState[dataContext] = new dataContexts[dataContext]({}, true);
		}
	}

	appState.persons.state.$hobbies = appState.hobbies;
	appState.hobbies.state.$persons = appState.persons;

	appState.persons.state.$hobbies = new dataContexts.hobbies(appState.hobbies);
	appState.hobbies.state.$persons = new dataContexts.persons(appState.persons);
		
	appState = new ApplicationDataContext(appState, void(0), enableUndo, false);
	Object.freeze(appState.state);
	return Object.freeze(appState);
};