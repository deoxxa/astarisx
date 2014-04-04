
var utils = require('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, stateChangedHandler, disableUndo) {

	if(typeof stateChangedHandler !== 'function'){
		throw new TypeError();
	}
	
	var ApplicationDataContext,
		thisAppState = {},
		dataContexts = {},
		watchedProps,
		watchList = {},
		dependents = [],
		domain;

	var dep;
	var dependsOn;
	var watchedPropsLen;
	var watchListProp1;
	var watchListProp2;

	disableUndo === void(0) ? false : disableUndo;

	var getConfig = function(obj, propName){
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
	}

	var getDependencies2 = function(nextState, dataContext){
		var deps = {},
			props,
			watchedValue;
		dataContext = ('dependsOn' in dataContext) ? dataContext : {dependsOn: dataContext};
		//if('dependsOn' in dataContext){
			for(var dependency in dataContext.dependsOn){
				if(dataContext.dependsOn.hasOwnProperty(dependency)){
					watchedValue = {};
					props = dataContext.dependsOn[dependency].property.split('.');
					props.forEach(function(prop, idx){
						if(idx === 0){
							watchedValue = nextState[prop];
						} else {
							watchedValue = watchedValue ? watchedValue[prop] : void(0);
						}
					});
					deps[dependency] = watchedValue;			
				}
			};
		//}
		return deps;
	};


	var transitionState = function(caller, nextState, prevState, watchedDataContext){
		var processed = false,
			dependencies;

		nextState = nextState || {};
		prevState = prevState || {};

		//var domainState = subscriber === appNamespace;

			// if(domainState){
			// 	// if(watchedDataContext){
			// 	// 	watchedDataContext.subscribers.forEach(function(subscriber){
			// 	// 		nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber],
			// 	// 			getDependencies2(nextState, domain[subscriber]), prevState[subscriber]);
			// 	// 	});
			// 	// }	
			// } else {
				if(caller !== appNamespace){
					nextState[caller] = new dataContexts[caller](nextState[caller], 
						getDependencies2(nextState, domain[caller]), prevState[caller]);					
				}
				if(watchedDataContext){
					var tempDeps = {};
					if(!!dependsOn){
						tempDeps = getDependencies2(nextState, dependsOn);
						nextState = extend(nextState, tempDeps);
						for(var depKey in dependsOn){
							if(dependsOn.hasOwnProperty(depKey) && ('onStateChange' in dependsOn[depKey])){
								var nextVal = {};
								nextVal[depKey] = nextState[depKey];
								nextState = extend(nextState, dependsOn[depKey].onStateChange(nextVal));
							}
						}
					}
					nextState = new ApplicationDataContext(extend(nextState, tempDeps), prevState, disableUndo);
					watchedDataContext.subscribers.forEach(function(subscriber){
						if(subscriber !== appNamespace){
							nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber],
							getDependencies2(nextState, domain[subscriber]), prevState[subscriber]);
						}
					});
				}	

			// }
		return nextState;
	};

	var appStateChangedHandler = function(caller, newState, callback/*, initialize*/) {
		var nextState = {},
			prevState = {},
			watchedDataContext = void(0),
			newStateKeys,
			newStateKeysLen,
			subscriberKeys;

		//initialize === void(0) ? false : initialize;

		if(/*!initialize && */(newState === void(0) || newState === null || Object.keys(newState).length === 0)){
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
						for(var j = 0, jl = watchList[caller][newStateKeys[i]].length; j < jl;j++){
							subscriberKeys[watchList[caller][newStateKeys[i]][j].dataContext] = true;
						}
					}
				}
				watchedDataContext = {};
				watchedDataContext.name = caller;
				watchedDataContext.subscribers = Object.keys(subscriberKeys);
				//If there are no subscriber reset watchedDataContext
				watchedDataContext = !!watchedDataContext.subscribers.length ? watchedDataContext : void(0);
			}
			var ii;
			var m2;
			if(caller !== appNamespace){
				nextState[caller] = newState;
				nextState = extend(thisAppState.state, nextState);
				if(watchedDataContext && watchedDataContext.subscribers){
					watchedDataContext.subscribers.forEach(function(sub){
						for(ii=0; ii < newStateKeysLen; ii++){
							if(watchList[caller][newStateKeys[ii]]){
								var tempArr = watchList[caller][newStateKeys[ii]];
								var ml =tempArr.length;
								for(m2 = 0; m2 < ml; m2++){
									var dependsOn2 = tempArr[m2].dataContext === appNamespace ? dependsOn : 
										domain[tempArr[m2].dataContext].dependsOn;
									if(dependsOn2[tempArr[m2].alias].onStateChange){
										var tmpNextState = {};
										tmpNextState[tempArr[m2].alias] = nextState[caller][newStateKeys[ii]];
										var testing = dependsOn2[tempArr[m2].alias].
											onStateChange.call(thisAppState.state[tempArr[m2].dataContext], tmpNextState);
										if(Object.prototype.toString.call(testing) === '[object Object]'){
											if(tempArr[m2].dataContext === appNamespace){
												nextState = extend(nextState, testing);
											} else {
												nextState[tempArr[m2].dataContext] = extend(nextState[tempArr[m2].dataContext], testing);
											}
										}
									}
								}
							}
						}
					});
				}
			} else {
				nextState = extend(thisAppState.state, newState);
			}

			prevState = thisAppState;//reprocessing ? thisAppState.previousState : thisAppState;
			nextState = transitionState(caller, nextState, thisAppState.state, watchedDataContext);
		}
		if(!!prevState){
			Object.freeze(prevState);
		}

		//Create a new App state context.
		// thisAppState = new ApplicationDataContext(nextState, prevState, disableUndo);
		// if(!!thisAppState.getValidState && !rollback && !reprocessing) {
		// 		// var validationObj = thisAppState.getValidState(thisAppState.state, thisAppState.previousState);
		// 		// var validationKeys = Object.keys(validationObj);
		// 		// for (var keyIdx = validationKeys.length - 1; keyIdx >= 0; keyIdx--) {
		// 		// 	if(Object.prototype.toString.call(validationObj[validationKeys[keyIdx]]) !== '[object Object]' && 
		// 		// 		Object.prototype.toString.call(validationObj[validationKeys[keyIdx]]) !== '[object Array]' &&
		// 		// 		validationObj[validationKeys[keyIdx]] !== thisAppState.state[validationKeys[keyIdx]]){
		// 		// 		reprocessing = true;
		// 		// 		thisAppState.setState(extend(thisAppState.state, validationObj));
		// 		// 		reprocessing = false;
		// 		// 		break;
		// 		// 	}
		// 		// };
		// 		var tempState = thisAppState.getValidState(nextState, prevState);
		// 		if(tempState){
		// 			reprocessing = true;

		// 			thisAppState.setState(tempState);
		// 			// thisAppState = new ApplicationDataContext(thisAppState.getValidState(thisAppState.state, thisAppState.previousState),
		// 			// 	thisAppState.previousState, disableUndo);

		// 			reprocessing = false;

		// 		}
		// }	
		//Create a new App state context.
		thisAppState = new ApplicationDataContext(nextState, prevState, disableUndo);

		//All the work is done! -> Notify the View
		//Provided for the main app to return from init() to the View
		//if(!reprocessing){
			Object.freeze(thisAppState);
			Object.freeze(thisAppState.state);
			stateChangedHandler(thisAppState, caller, callback);
			return thisAppState;
		//}
	};
	// var dep;
	// var dependsOn;
	// var watchedPropsLen;
	// var watchListProp1;
	// var watchListProp2;
	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	thisAppState = new ApplicationDataContext({}, void(0), disableUndo, true);
	dependsOn = thisAppState.getDependencies ? getConfig(thisAppState.getDependencies(), 'property') : void(0);
	if(dependsOn){
		dependents.push(appNamespace);
		for(dep in dependsOn){
			if(dependsOn.hasOwnProperty(dep)){
				watchedProps = dependsOn[dep].property.split('.');
				watchedPropsLen = watchedProps.length;
				watchListProp1 = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
				watchListProp2 = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
				watchList[watchListProp1] = watchList[watchListProp1] || {};
				watchList[watchListProp1][watchListProp2] = watchList[watchListProp1][watchListProp2] || [];
				if(watchList[watchListProp1][watchListProp2].indexOf(appNamespace) === -1){
					watchList[watchListProp1][watchListProp2].push({dataContext:appNamespace, alias: dep});
				}
			}
		}
	}

	domain = getConfig(thisAppState.getDomainDataContext(), 'viewModel');
	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			thisAppState[dataContext] = new dataContexts[dataContext]({}, {}, {}, true);
			if(thisAppState[dataContext].getDependencies){
				dependents.push(dataContext);
				domain[dataContext].dependsOn = getConfig(thisAppState[dataContext].getDependencies(), 'property');
				for(dep in domain[dataContext].dependsOn){
					if(domain[dataContext].dependsOn.hasOwnProperty(dep)){
						watchedProps = domain[dataContext].dependsOn[dep].property.split('.');
						watchedPropsLen = watchedProps.length;
						watchListProp1 = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
						watchListProp2 = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
						watchList[watchListProp1] = watchList[watchListProp1] || {};
						watchList[watchListProp1][watchListProp2] = watchList[watchListProp1][watchListProp2] || [];
						if(watchList[watchListProp1][watchListProp2].indexOf(dataContext) === -1){
							watchList[watchListProp1][watchListProp2].push({dataContext:dataContext, alias: dep});
						}
					}
				}
			}
		}
	}
	dependents.forEach(function(dependent){
		if(dependent !== appNamespace){
				thisAppState[dependent] = new dataContexts[dependent](thisAppState[dependent],
					getDependencies2(thisAppState, domain[dependent]), {});
		}
	});
	var tempDeps = !!dependsOn ? getDependencies2(thisAppState, dependsOn) : {};
	thisAppState = new ApplicationDataContext(extend(thisAppState, tempDeps), void(0), disableUndo);
	return Object.freeze(thisAppState);
};