
var utils = require('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, stateChangedHandler, enableUndo, initialize) {

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

	// var getDeps = function(nextState, dataContext){
	// 	var dependencies = {},
	// 		props,
	// 		watchedValue;

	// 	if(!dataContext){
	// 		return {};
	// 	}

	// 	dataContext = ('dependsOn' in dataContext) ? dataContext : {dependsOn: dataContext};

	// 	for(var dependency in dataContext.dependsOn){
	// 		if(dataContext.dependsOn.hasOwnProperty(dependency)){
	// 			watchedValue = {};
	// 			props = dataContext.dependsOn[dependency].property.split('.');
	// 			props.forEach(function(prop, idx){
	// 				if(idx === 0){
	// 					watchedValue = nextState[prop];
	// 				} else {
	// 					watchedValue = watchedValue ? watchedValue[prop] : void(0);
	// 				}
	// 			});
	// 			dependencies[dependency] = watchedValue;			
	// 		}
	// 	};
	// 	return dependencies;
	// };


	// var transitionState = function(caller, nextState, prevState){

	// 	nextState = nextState || {};

	// 	var processed = false,
	// 		tempDeps,
	// 		nextVal;

	// 	if(caller !== appNamespace){
	// 		nextState[caller] = new dataContexts[caller](nextState.state[caller]/*, getDeps(nextState, domain[caller])*/, initialize);
	// 	}

	// 	// if(subscribers){
	// 	// 	if(!!dependsOn){
	// 	// 		tempDeps = getDeps(nextState, dependsOn);
	// 	// 		nextState = extend(nextState, tempDeps);
	// 	// 		for(var depKey in dependsOn){
	// 	// 			if(dependsOn.hasOwnProperty(depKey) && ('onStateChange' in dependsOn[depKey])){
	// 	// 				nextVal = {};
	// 	// 				nextVal[depKey] = nextState[depKey];
	// 	// 				nextState = extend(nextState, dependsOn[depKey].onStateChange(nextVal));
	// 	// 			}
	// 	// 		}
	// 	// 	}
	// 	// 	nextState = new ApplicationDataContext(extend(nextState, tempDeps), prevState, enableUndo);
	// 	// 	subscribers.forEach(function(subscriber){
	// 	// 		if(subscriber !== appNamespace){
	// 	// 			nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber],
	// 	// 			getDeps(nextState, domain[subscriber]));
	// 	// 		}
	// 	// 	});
	// 	// }

	// 	return nextState;
	// };

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
			prevState = newState.previousState;
		} else {
			// if(caller in watchList){
				
			// 	newStateKeys = Object.keys(newState);
			// 	newStateKeysLen = newStateKeys.length;
			// 	subscriberNames = {};

			// 	for (var i = newStateKeysLen - 1; i >= 0; i--){
			// 		if(watchList[caller][newStateKeys[i]]){
			// 			for(var j = watchList[caller][newStateKeys[i]].length - 1; j >= 0; j--){
			// 				subscriberNames[watchList[caller][newStateKeys[i]][j].dataContext] = true;
			// 			}
			// 		}
			// 	}

			// 	subscribers = Object.keys(subscriberNames);
			// 	hasSubscribers = !!subscribers.length;
			// }

			if(caller !== appNamespace){

				nextState[caller] = extend(appState.state[caller].state, newState);
				nextState[caller] = new dataContexts[caller](nextState[caller]); //All this should really do is create
				//a viewModel with the prototype and enable calling initial and onStateChange functions
				
				//for each subscriber call onStateChanging(next.hobbies.state) => pass in nextState
				//also call if for datacontext that is invoking the change
				nextState = extend(appState, nextState);

				//At this point assign nextState to all subscribers
				nextState.persons.state.$hobbies = nextState.hobbies;
				nextState.hobbies.state.$persons = nextState.persons;
				nextState.persons.previousState.$hobbies = appState.hobbies.state;
				nextState.hobbies.previousState.$persons = appState.persons.state;

				if(caller === 'persons'){
					nextState.hobbies = extend(appState.state.hobbies.state, nextState.hobbies.onStateChanged());
					nextState.hobbies = new dataContexts.hobbies(nextState.hobbies);
					nextState.persons.state.$hobbies = nextState.hobbies;
					nextState.hobbies.state.$persons = nextState.persons;
					nextState.persons.previousState.$hobbies = appState.hobbies.state;
					nextState.hobbies.previousState.$persons = appState.persons.state;
				}
				// Object.freeze(nextState.persons.state);
				// Object.freeze(nextState.hobbies.state);
				//for each subscriber call onStateChanged(appState.hobbies.state) => pass in previousState
				//also call if for datacontext that is invoking the change
				
				//nextState[caller] = nextState;
				
				// if(hasSubscribers){

				// 	subscribers.forEach(function(sub){
						
				// 		for(idxKey=newStateKeysLen-1; idxKey >= 0; idxKey--){

				// 			if(watchList[caller][newStateKeys[idxKey]]){

				// 				var depFldArr = watchList[caller][newStateKeys[idxKey]];						
								
				// 				for(idxDepFld = depFldArr.length - 1; idxDepFld >= 0; idxDepFld--){

				// 					dependsOnObj = depFldArr[idxDepFld].dataContext === appNamespace ? dependsOn : 
				// 						domain[depFldArr[idxDepFld].dataContext].dependsOn;

				// 					if(dependsOnObj[depFldArr[idxDepFld].alias].onStateChange){

				// 						tmpNextState[depFldArr[idxDepFld].alias] = nextState[caller][newStateKeys[idxKey]];
				// 						changeState = dependsOnObj[depFldArr[idxDepFld].alias].
				// 							onStateChange.call(appState.state[depFldArr[idxDepFld].dataContext], tmpNextState);

				// 						if(Object.prototype.toString.call(changeState) === '[object Object]'){

				// 							if(depFldArr[idxDepFld].dataContext === appNamespace){
				// 								nextState = extend(nextState, changeState);
				// 							} else {
				// 								nextState[depFldArr[idxDepFld].dataContext] =
				// 									extend(nextState[depFldArr[idxDepFld].dataContext], changeState);
				// 							}
				// 						}
				// 					}
				// 				}
				// 			}
				// 		}
				// 	});
				// }
			} else {
				nextState = extend(appState, newState);

				//At this point assign nextState to all subscribers
				// nextState.state.$hobbies = nextState.hobbies;
				// nextState.state.$persons = nextState.persons;
			}
			prevState = appState;
			//nextState = extend(appState, nextState);
			//nextState = transitionState(caller, nextState, appState.state);
			//nextState = extend(appState, new dataContexts[caller](nextState[caller]));
		}
		if(!!prevState){
			Object.freeze(prevState);
		}
		//Create a new App state context.
		appState = new ApplicationDataContext(nextState, prevState, enableUndo);

		//appState.persons.state.hobbies = appState.hobbies;

		//All the work is done! -> Notify the View
		//Provided for the main app to return from init() to the View
		Object.freeze(appState);
		Object.freeze(appState.state);
		stateChangedHandler(appState, caller, callback);
		return appState;
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	appState = new ApplicationDataContext({}, void(0), enableUndo, false);
	// dependsOn = appState.getDependencies ? configure(appState.getDependencies(), 'property') : void(0);
	// if(dependsOn){
	// 	dependents.push(appNamespace);
	// 	for(depProp in dependsOn){
	// 		if(dependsOn.hasOwnProperty(depProp)){
	// 			watchedProps = dependsOn[depProp].property.split('.');
	// 			watchedPropsLen = watchedProps.length;
	// 			watchListPropA = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
	// 			watchListPropB = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
	// 			watchList[watchListPropA] = watchList[watchListPropA] || {};
	// 			watchList[watchListPropA][watchListPropB] = watchList[watchListPropA][watchListPropB] || [];
	// 			if(watchList[watchListPropA][watchListPropB].indexOf(appNamespace) === -1){
	// 				watchList[watchListPropA][watchListPropB].push({dataContext:appNamespace, alias: depProp});
	// 			}
	// 		}
	// 	}
	// }

	domain = configure(appState.getDomainDataContext(), 'viewModel');

	//var test = domain.persons.viewModel.originalSpec.getDependencies();

	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			appState[dataContext] = new dataContexts[dataContext]({}, true);
			if(appState[dataContext].getDependencies){
				// dependents.push(dataContext);
				// domain[dataContext].dependsOn = configure(appState[dataContext].getDependencies(), 'property');
				// for(depProp in domain[dataContext].dependsOn){
				// 	if(domain[dataContext].dependsOn.hasOwnProperty(depProp)){
				// 		watchedProps = domain[dataContext].dependsOn[depProp].property.split('.');
				// 		watchedPropsLen = watchedProps.length;
				// 		watchListPropA = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
				// 		watchListPropB = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
				// 		watchList[watchListPropA] = watchList[watchListPropA] || {};
				// 		watchList[watchListPropA][watchListPropB] = watchList[watchListPropA][watchListPropB] || [];
				// 		if(watchList[watchListPropA][watchListPropB].indexOf(dataContext) === -1){
				// 			watchList[watchListPropA][watchListPropB].push({dataContext:dataContext, alias: depProp});
				// 		}
				// 	}
				// }
			}
		}
	}
	//move this within if statement above
	Object.defineProperty(appState.persons.state, '$hobbies', {
		configurable: false,
		enumerable: true,
		get: function(){ return appState.hobbies; }
	});
	Object.freeze(appState.persons.state);
	Object.defineProperty(appState.hobbies.state, '$persons', {
		configurable: false,
		enumerable: true,
		get: function(){ return appState.persons; }
	});
	Object.freeze(appState.hobbies.state);
	//move this within if statement above
	Object.defineProperty(appState.persons.previousState, '$hobbies', {
		configurable: false,
		enumerable: true,
		get: function(){ return {}; }
	});
	Object.freeze(appState.persons.previousState);
	Object.defineProperty(appState.hobbies.previousState, '$persons', {
		configurable: false,
		enumerable: true,
		get: function(){ return {}; }
	});
	Object.freeze(appState.hobbies.previousState);
	
	// Object.defineProperty(appState.state, '$hobbies', {
	// 	enumerable: true,
	// 	get: function(){ return appState.hobbies; }
	// });

	// Object.defineProperty(appState.state, '$persons', {
	// 	enumerable: true,
	// 	get: function(){ return appState.persons; }
	// });

	/*dependents.forEach(function(dependent){
		if(dependent !== appNamespace){
				appState[dependent] = new dataContexts[dependent](appState[dependent], getDeps(appState, domain[dependent]));
		}
	});*/
	
	appState = new ApplicationDataContext(appState, void(0), enableUndo, false);
	Object.freeze(appState.state);
	return Object.freeze(appState);
};