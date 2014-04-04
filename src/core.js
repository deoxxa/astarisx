
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

	var depProp;

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

	var _getDependencies = function(nextState, dataContext){
		var deps = {},
			props,
			watchedValue;

		if(!dataContext){
			return {};
		}

		dataContext = ('dependsOn' in dataContext) ? dataContext : {dependsOn: dataContext};

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
		return deps;
	};


	var transitionState = function(caller, nextState, prevState, watchedDataContext){

		nextState = nextState || {};
		prevState = prevState || {};

		var processed = false,
			dependencies,
			tempDeps,
			nextVal;

		if(caller !== appNamespace){
			nextState[caller] = new dataContexts[caller](nextState[caller], 
				_getDependencies(nextState, domain[caller]), prevState[caller]);					
		}

		if(watchedDataContext){
			if(!!dependsOn){
				tempDeps = _getDependencies(nextState, dependsOn);
				nextState = extend(nextState, tempDeps);
				for(var depKey in dependsOn){
					if(dependsOn.hasOwnProperty(depKey) && ('onStateChange' in dependsOn[depKey])){
						nextVal = {};
						nextVal[depKey] = nextState[depKey];
						nextState = extend(nextState, dependsOn[depKey].onStateChange(nextVal));
					}
				}
			}
			nextState = new ApplicationDataContext(extend(nextState, tempDeps), prevState, enableUndo);
			watchedDataContext.subscribers.forEach(function(subscriber){
				if(subscriber !== appNamespace){
					nextState[subscriber] = new dataContexts[subscriber](nextState[subscriber],
					_getDependencies(nextState, domain[subscriber]), prevState[subscriber]);
				}
			});
		}

		return nextState;
	};

	var appStateChangedHandler = function(caller, newState, callback) {
		
		if((newState === void(0) || newState === null || Object.keys(newState).length === 0)){
			return;
		}

		var nextState = {},
			prevState = {},
			watchedDataContext = void(0),
			newStateKeys,
			newStateKeysLen,
			subscriberKeys;

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
				nextState = extend(appState.state, nextState);

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
											onStateChange.call(appState.state[tempArr[m2].dataContext], tmpNextState);

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
				nextState = extend(appState.state, newState);
			}
			prevState = appState;
			nextState = transitionState(caller, nextState, appState.state, watchedDataContext);
		}
		if(!!prevState){
			Object.freeze(prevState);
		}
		//Create a new App state context.
		appState = new ApplicationDataContext(nextState, prevState, enableUndo);
		//All the work is done! -> Notify the View
		//Provided for the main app to return from init() to the View
		Object.freeze(appState);
		Object.freeze(appState.state);
		stateChangedHandler(appState, caller, callback);
		return appState;
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	appState = new ApplicationDataContext({}, void(0), enableUndo, true);
	dependsOn = appState.getDependencies ? getConfig(appState.getDependencies(), 'property') : void(0);
	if(dependsOn){
		dependents.push(appNamespace);
		for(depProp in dependsOn){
			if(dependsOn.hasOwnProperty(depProp)){
				watchedProps = dependsOn[depProp].property.split('.');
				watchedPropsLen = watchedProps.length;
				watchListPropA = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
				watchListPropB = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
				watchList[watchListPropA] = watchList[watchListPropA] || {};
				watchList[watchListPropA][watchListPropB] = watchList[watchListPropA][watchListPropB] || [];
				if(watchList[watchListPropA][watchListPropB].indexOf(appNamespace) === -1){
					watchList[watchListPropA][watchListPropB].push({dataContext:appNamespace, alias: depProp});
				}
			}
		}
	}

	domain = getConfig(appState.getDomainDataContext(), 'viewModel');
	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].viewModel.call(this, appStateChangedHandler.bind(this, dataContext));
			appState[dataContext] = new dataContexts[dataContext]({}, {}, {}, true);
			if(appState[dataContext].getDependencies){
				dependents.push(dataContext);
				domain[dataContext].dependsOn = getConfig(appState[dataContext].getDependencies(), 'property');
				for(depProp in domain[dataContext].dependsOn){
					if(domain[dataContext].dependsOn.hasOwnProperty(depProp)){
						watchedProps = domain[dataContext].dependsOn[depProp].property.split('.');
						watchedPropsLen = watchedProps.length;
						watchListPropA = watchedPropsLen > 1 ? watchedProps[0] : appNamespace;
						watchListPropB = watchedPropsLen > 1 ? watchedProps[1] : watchedProps[0];
						watchList[watchListPropA] = watchList[watchListPropA] || {};
						watchList[watchListPropA][watchListPropB] = watchList[watchListPropA][watchListPropB] || [];
						if(watchList[watchListPropA][watchListPropB].indexOf(dataContext) === -1){
							watchList[watchListPropA][watchListPropB].push({dataContext:dataContext, alias: depProp});
						}
					}
				}
			}
		}
	}
	dependents.forEach(function(dependent){
		if(dependent !== appNamespace){
				appState[dependent] = new dataContexts[dependent](appState[dependent],
					_getDependencies(appState, domain[dependent]), {});
		}
	});
	
	appState = new ApplicationDataContext(extend(appState, _getDependencies(appState, dependsOn)), void(0), enableUndo);
	Object.freeze(appState.state);
	return Object.freeze(appState);
};