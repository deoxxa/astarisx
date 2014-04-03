
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
		domain,
		reprocessing = false;



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

	var getDependencies = function(nextState, dataContext/*, dependent*/){
		var deps = {},
			props,
			watchedValue;

		if('dependsOn' in dataContext){
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
		}
		return deps;
	};


	var transitionState = function(caller, nextState, prevState, watchedDataContext){
		var processed = false,
			dependencies;

		nextState = nextState || {};
		prevState = prevState || {};

		var domainState = caller === void(0);
		// var getDependencies = function(dataContext, caller){
		// 	var deps = {},
		// 		props,
		// 		watchedValue;

		// 	if('dependsOn' in dataContext){
		// 		dataContext.dependsOn.forEach(function(dependency){
		// 			watchedValue = {};
		// 			props = dependency.property.split('.');
		// 			if(caller === true){
		// 				props.forEach(function(prop, idx){
		// 					if(idx === 0){
		// 						watchedValue = nextState[prop];
		// 					} else {
		// 						watchedValue = watchedValue ? watchedValue[prop] : void(0);
		// 					}
		// 				});
		// 				if('alias' in dependency){
		// 					deps[dependency.alias] = watchedValue;
		// 				} else {
		// 					deps[props.join('$')] = watchedValue;
		// 				}
		// 			} else if(caller === props[0]){
		// 				props.forEach(function(prop, idx){
		// 					if(idx === 0){
		// 						watchedValue = nextState[prop];
		// 					} else {
		// 						watchedValue = watchedValue ? watchedValue[prop] : void(0);
		// 					}
		// 				});
		// 				if('alias' in dependency){
		// 					deps[dependency.alias] = watchedValue;
		// 				} else {
		// 					deps[props.join('$')] = watchedValue;
		// 				}
		// 			}
		// 		});
		// 	}
		// 	return deps;
		// };


			//dependencies = getDependencies(nextState, domain[caller]);

			if(domainState){
				if(watchedDataContext){
					watchedDataContext.subscribers.forEach(function(subscriber){
						nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber],
							getDependencies(nextState, domain[subscriber]), prevState[subscriber]);
					});
				}	
			} else {
				nextState[caller] = new dataContexts[caller](nextState[caller], 
					getDependencies(nextState, domain[caller]), prevState[caller]);
				if(watchedDataContext){
					watchedDataContext.subscribers.forEach(function(subscriber){
						nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber],
							getDependencies(nextState, domain[subscriber], caller), prevState[subscriber]);
					});
				}	

			}



		// for(var dataContext in domain){
		// 	if(domain.hasOwnProperty(dataContext)){
		// 		dependencies = getDependencies(domain[dataContext]);
		// 		//Need to inject dependencies so that the state for this object can change
		// 		//if required. Can't use appState as that is provided after the object is created
		// 		if(initialize){
		// 			nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext], dependencies,
		// 				prevState[dataContext]).getInitialState();
		// 		} else {
		// 			nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext], dependencies,
		// 				prevState[dataContext]);
		// 		}
		// 		if(watchedDataContext){
		// 			if(processed && watchedDataContext.subscribers.indexOf(dataContext) !== -1){
		// 				dependencies = getDependencies(domain[watchedDataContext.name]);
		// 				nextState[watchedDataContext.name] = new dataContexts[watchedDataContext.name](nextState[watchedDataContext.name],
		// 					dependencies, prevState[watchedDataContext.name]);
		// 			}
		// 			processed = processed ? processed : dataContext === watchedDataContext.name;
		// 		}					
		// 	}
		// }
		return nextState;
	};

	var appStateChangedHandler = function(caller, newState, callback/*, initialize*/) {
		var nextState = {},
			prevState = {},
			watchedDataContext = void(0),
			newStateKeys,
			newStateKeysLen,
			subscriberKeys,
			rollback = false;

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
			rollback = true;
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

			if(caller !== appNamespace){
				nextState[caller] = newState;
				nextState = extend(thisAppState.state, nextState);
				if(watchedDataContext && watchedDataContext.subscribers){
					watchedDataContext.subscribers.forEach(function(sub){
						for(var ii= 0; ii < newStateKeysLen; ii++){
							if(watchList[caller][newStateKeys[ii]]){
								var tempArr = watchList[caller][newStateKeys[ii]];
								for(var m=0, ml =tempArr.length;m<ml;m++){
									if(domain[tempArr[m].dataContext].dependsOn[tempArr[m].alias].onStateChange){
										var tmpNextState = {};
										var tmpPrevState = {};
										tmpNextState[tempArr[m].alias] = nextState[caller][newStateKeys[ii]];
										tmpPrevState[tempArr[m].alias] = thisAppState.state[caller][newStateKeys[ii]];
										nextState[tempArr[m].dataContext] = domain[tempArr[m].dataContext].dependsOn[tempArr[m].alias].
											onStateChange(tmpNextState, tmpPrevState);										
									}
								}
							}
						}
					});
				}
			} else {
				nextState = extend(thisAppState.state, newState);
			}

			prevState = reprocessing ? thisAppState.previousState : thisAppState;
			nextState = transitionState(caller === appNamespace ? void(0) : caller, nextState, thisAppState.state, watchedDataContext);
		}
		if(!!prevState){
			Object.freeze(prevState);
		}

		//Create a new App state context.
		thisAppState = new ApplicationDataContext(nextState, prevState, disableUndo);
		if(!!thisAppState.getValidState && !rollback && !reprocessing) {
				// var validationObj = thisAppState.getValidState(thisAppState.state, thisAppState.previousState);
				// var validationKeys = Object.keys(validationObj);
				// for (var keyIdx = validationKeys.length - 1; keyIdx >= 0; keyIdx--) {
				// 	if(Object.prototype.toString.call(validationObj[validationKeys[keyIdx]]) !== '[object Object]' && 
				// 		Object.prototype.toString.call(validationObj[validationKeys[keyIdx]]) !== '[object Array]' &&
				// 		validationObj[validationKeys[keyIdx]] !== thisAppState.state[validationKeys[keyIdx]]){
				// 		reprocessing = true;
				// 		thisAppState.setState(extend(thisAppState.state, validationObj));
				// 		reprocessing = false;
				// 		break;
				// 	}
				// };
				var tempState = thisAppState.getValidState(nextState, prevState);
				if(tempState){
					reprocessing = true;

					thisAppState.setState(tempState);
					// thisAppState = new ApplicationDataContext(thisAppState.getValidState(thisAppState.state, thisAppState.previousState),
					// 	thisAppState.previousState, disableUndo);

					reprocessing = false;

				}
		}	
		//Create a new App state context.
		thisAppState = new ApplicationDataContext(nextState, prevState, disableUndo);

		//All the work is done! -> Notify the View
		//Provided for the main app to return from init() to the View
		if(!reprocessing){
			Object.freeze(thisAppState);
			Object.freeze(thisAppState.state);
			stateChangedHandler(thisAppState, caller, callback);
			return thisAppState;
		}
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	thisAppState = new ApplicationDataContext({}, void(0), disableUndo, true);
	domain = getConfig(thisAppState.getDomainDataContext(), 'viewModel');
	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			thisAppState[dataContext] = new dataContexts[dataContext]({}, {}, {}, true);
			if(thisAppState[dataContext].getDependencies){
				dependents.push(dataContext);
				domain[dataContext].dependsOn = getConfig(thisAppState[dataContext].getDependencies(), 'property');
				for(var dep in domain[dataContext].dependsOn){
					if(domain[dataContext].dependsOn.hasOwnProperty(dep)){
						watchedProps = domain[dataContext].dependsOn[dep].property.split('.');
						//if(watchedProps.length > 1){
						var watchedPropsLen = watchedProps.length;
						var watchListProp1 = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
						var watchListProp2 = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
						watchList[watchListProp1] = watchList[watchListProp1] || {};
						watchList[watchListProp1][watchListProp2] = watchList[watchListProp1][watchListProp2] || [];
						if(watchList[watchListProp1][watchListProp2].indexOf(dataContext) === -1){
							watchList[watchListProp1][watchListProp2].push({dataContext:dataContext, alias: dep});
						}
						// } else {
						// 	watchList[appNamespace] = watchList[appNamespace] || {};
						// 	watchList[appNamespace][watchedProps[0]] = watchList[appNamespace][watchedProps[0]] || [];
						// 	if(watchList[appNamespace][watchedProps[0]].indexOf(dataContext) === -1){
						// 		watchList[appNamespace][watchedProps[0]].push(dataContext);
						// 	}
						// }
					}
				}
			}
		}
	}
	dependents.forEach(function(dependent){
		thisAppState[dependent] = new dataContexts[dependent](thisAppState[dependent],
			getDependencies(thisAppState, domain[dependent]), {}/*, true*/);
	});
	thisAppState = new ApplicationDataContext(extend(thisAppState), void(0), disableUndo);
	return Object.freeze(thisAppState);
};