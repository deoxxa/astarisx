var page = require('page');
var utils = require('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, stateChangedHandler, enableUndo) {

	if(typeof stateChangedHandler !== 'function'){
		throw new TypeError('stateChangedHandler must be a function!');
	}

	if(enableUndo === void(0)){
		enableUndo = false;
	}

	var ApplicationDataContext,
		appState = {},
		dataContexts = {},
		domain,
		links = {},
		watchedDataContexts = {},
		dataContext,
		transientState = {},
		processedState = {},
		watchedState,
		watchedItem,
		watchedProp,
		watchedDataContext,
		link,
		calledBack = false,
		routingEnabled = false,
		routeHash = {},
		routeMapping = {},
		routePath,
		external = false,
		internal = true;

	var appStateChangedHandler = function(caller, newState, newAppState, callback) {

		var nextState = {},
			prevState = void(0),
			redoState = void(0),
			newStateKeys,
			keyIdx,
			transientStateKeysLen,
			dataContext,
			linkedDataContext,
			processedStateKeys = [],
			processedStateKeysLen,
			watchedField,
			subscribers,
			subscriber;

		if(typeof newAppState === 'function'){
			callback = newAppState;
			newAppState = {};
		}

		newState = newState || {};
		newStateKeys = Object.keys(newState);

		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangedHandler. If a callback was passed in
		//it would be assigned to newState
		if(Object.getPrototypeOf(newState).constructor.classType === "DomainViewModel") {

			nextState = extend(newState);
			prevState = newState.previousState;
			redoState = newAppState;
			//Need to reset ViewModel with instance object so that setState is associated with
			//the current ViewModel. This reason this ccurs is that when a ViewModel is created it
			//assigns a setState function to all instance fields and binds itself to it. When undo is called
			//the data is rolled back but viewModels are not recreated and therefore the setState functions
			//are associated with outdated viewModels and returns unexpected output. So to realign the ViewModels
			//with setState we recreate them.
			for(dataContext in domain){
				nextState[dataContext] = new dataContexts[dataContext](nextState[dataContext]);
			}

			//relink
			for(dataContext in domain){
				if(domain.hasOwnProperty(dataContext)){
					for(linkedDataContext in links[dataContext]){
						if(links[dataContext].hasOwnProperty(linkedDataContext)){
							nextState[dataContext].state[links[dataContext][linkedDataContext]] =
								(linkedDataContext in domain) ? extend(nextState[linkedDataContext].state) :
									nextState[linkedDataContext];
						}
					}
				}
			}

			if(typeof callback === 'function'){
				appState = new ApplicationDataContext(nextState, prevState, redoState,
					enableUndo, routingEnabled);
				callback(appState);
				return;
			}

		} else {

			if(!!newStateKeys.length){
				if(caller === appNamespace){
					nextState = extend(newState);
				} else {
					nextState[caller] = extend(newState);
				}
			}
			transientState = extend(nextState, transientState, newAppState);
			transientStateKeys = Object.keys(transientState);
			if(transientStateKeys.length === 0){
				return;
			}

			transientStateKeysLen = transientStateKeys.length - 1;

			for (keyIdx = transientStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(transientStateKeys[keyIdx] in domain){
					nextState[transientStateKeys[keyIdx]] = extend(appState[transientStateKeys[keyIdx]], transientState[transientStateKeys[keyIdx]]);
					nextState[transientStateKeys[keyIdx]] = new dataContexts[transientStateKeys[keyIdx]](nextState[transientStateKeys[keyIdx]]);
				} else {
					nextState[transientStateKeys[keyIdx]] = transientState[transientStateKeys[keyIdx]];
				}
			};

			processedState = extend(processedState, nextState);

			//Triggers
			nextState = extend(appState, processedState);

			transientState = {};
			for (keyIdx = transientStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(transientStateKeys[keyIdx] in watchedDataContexts){
					for(watchedField in watchedDataContexts[transientStateKeys[keyIdx]]){
						if(watchedDataContexts[transientStateKeys[keyIdx]].hasOwnProperty(watchedField)){
							if(newStateKeys.indexOf(watchedField) !== -1){
								subscribers = watchedDataContexts[transientStateKeys[keyIdx]][watchedField];
								for(subscriber in subscribers){
									if(subscribers.hasOwnProperty(subscriber)){
										//Cross reference dataContext link Phase
										if(subscriber in links){
											for(dataContext in links[subscriber]){
												if(links[subscriber].hasOwnProperty(dataContext)){
													nextState[subscriber].state[links[subscriber][dataContext]] =
														(dataContext in domain) ? extend(nextState[dataContext].state) :
															nextState[dataContext];
												}
												if(dataContext in links){
													for(dataContext2 in links[dataContext]){
														if(links[dataContext].hasOwnProperty(dataContext2)){
															nextState[dataContext].state[links[dataContext][dataContext2]] =
																(dataContext2 in domain) ? extend(nextState[dataContext2].state) :
																	nextState[dataContext2];
														}
													}
												}
											}
										}
										transientState = extend(transientState,
											subscribers[subscriber].call(appState[subscriber],
											nextState[transientStateKeys[keyIdx]][watchedField],
											appState[transientStateKeys[keyIdx]][watchedField],
											watchedField, transientStateKeys[keyIdx],
											nextState.path, appState.path));
									}
								}
							}
						}
					}
				}
			};
			if(!!Object.keys(transientState).length){
				appStateChangedHandler(void(0), {}, transientState);
				return;
			}
			//Link Phase
			processedStateKeys = Object.keys(processedState);
			processedStateKeysLen = processedStateKeys.length - 1;
			for (keyIdx = processedStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(caller === appNamespace){
					if(processedStateKeys[keyIdx] in links[appNamespace]){
						for(dataContext in links[appNamespace][processedStateKeys[keyIdx]]){
							if(links[appNamespace][processedStateKeys[keyIdx]].hasOwnProperty(dataContext)){
								nextState[dataContext].state[links[appNamespace][processedStateKeys[keyIdx]][dataContext]] =
									nextState[processedStateKeys[keyIdx]];
							}
							if(dataContext in links){
								for(dataContext2 in links[dataContext]){
									if(links[dataContext].hasOwnProperty(dataContext2)){
										nextState[dataContext].state[links[dataContext][dataContext2]] =
											(dataContext2 in domain) ? extend(nextState[dataContext2].state) :
												nextState[dataContext2];
									}
								}
							}
						}
					}
				} else {
					if(processedStateKeys[keyIdx] in links){
						for(dataContext in links[processedStateKeys[keyIdx]]){
							if(links[processedStateKeys[keyIdx]].hasOwnProperty(dataContext)){
								nextState[processedStateKeys[keyIdx]].state[links[processedStateKeys[keyIdx]][dataContext]] =
									nextState[dataContext];
							}
							if(dataContext in links){
								for(dataContext2 in links[dataContext]){
									if(links[dataContext].hasOwnProperty(dataContext2)){
										nextState[dataContext].state[links[dataContext][dataContext2]] =
											nextState[dataContext2];
									}
								}
							}
						}
					}
				}
	    }

			if(appState.canRevert && calledBack){
				prevState = appState.previousState;
			} else {
				prevState = appState;
			}
		}

		if(!!prevState){
			Object.freeze(prevState);
		}

		appState = new ApplicationDataContext(nextState, prevState, redoState,
			enableUndo, routingEnabled);
		Object.freeze(appState);
		Object.freeze(appState.state);

		if(typeof callback === 'function'){
			calledBack = true;
			callback(appState);
			return;
		}
		//All the work is done! -> Notify the View
		stateChangedHandler(appState);
		calledBack = false;
		transientState = {};
		processedState = {};

		if(routingEnabled){
			if(('path' in appState) && !external){
				/*
					--> || caller === appNamespace
					When the Domain invokes a state change just replace the state
					--> nextState.enableUndo is adhoc dynamic undo flag
				*/
				internal = true;
				if(nextState.enableUndo || appState.canRevert || caller === appNamespace){
					page.replace(appState.path);
				} else {
					page(appState.path);
				}
			}
			external = false;
		}
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	appState = new ApplicationDataContext(void(0), void(0), void(0), enableUndo, routingEnabled);
  appState.state = appState.state || {};

	domain = appState.constructor.originalSpec.getDomainDataContext();
	delete appState.constructor.originalSpec.getDomainDataContext;

	//Initialize all dataContexts
	for(dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].call(this, appStateChangedHandler.bind(this, dataContext));
			appState.state[dataContext] = new dataContexts[dataContext](appState.state[dataContext], true);
    }
  }

  //Store links
	for(dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			if('getWatchedState' in appState[dataContext].constructor.originalSpec){
				watchedState = appState[dataContext].constructor.originalSpec.getWatchedState();
				for(watchedItem in watchedState){
					if(watchedState.hasOwnProperty(watchedItem)){
						if(watchedItem in domain || watchedItem in appState.state){
							if('alias' in watchedState[watchedItem]){
								if(!(dataContext in links)){
									links[dataContext] = {};
								}
								links[dataContext][watchedItem] = watchedState[watchedItem].alias;

								if(!(watchedItem in domain)){
									if(!(appNamespace in links)){
										links[appNamespace] = {};
									}
									if(!(dataContext in links[appNamespace])){
										links[appNamespace][watchedItem] = {};
									}
									links[appNamespace][watchedItem][dataContext] = watchedState[watchedItem].alias;
								}
							}
							for(watchedProp in watchedState[watchedItem].fields){
								if(watchedState[watchedItem].fields.hasOwnProperty(watchedProp)){
									if(watchedItem in domain){
										watchedDataContext = {};
										if(!(watchedItem in watchedDataContexts)){
											watchedDataContexts[watchedItem] = {};
										}
										watchedDataContext[watchedProp] = {};
										watchedDataContext[watchedProp][dataContext] =
											watchedState[watchedItem].fields[watchedProp];
										watchedDataContexts[watchedItem] = watchedDataContext;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	//apply links
	for(dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			for(link in links[dataContext]){
			  if(links[dataContext].hasOwnProperty(link)){
					appState[dataContext].state[links[dataContext][link]] = appState[link];
			  }
			}
		}
	}

	//reinitialize with all data in place
	for(dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			appState.state[dataContext] =
				new dataContexts[dataContext](appState.state[dataContext]);

			if('getRoutes' in appState[dataContext].constructor.originalSpec){
				routingEnabled = true;
				routeHash = appState[dataContext].constructor.originalSpec.getRoutes();
				for(routePath in routeHash){
					if(routeHash.hasOwnProperty(routePath)){
						routeMapping[routeHash[routePath].path] = routeHash[routePath].handler;
						page(routeHash[routePath].path, function(dataContextName, route,
								pathKey, ctx){
							external = true;
							if(!internal) {
								routeMapping[route].call(appState[dataContextName], ctx.params,
								ctx.path, pathKey, ctx);
							}
							internal = false;
						}.bind(this, dataContext, routeHash[routePath].path, routePath));
					}
				}
				delete appState[dataContext].constructor.originalSpec.getRoutes;
			}
    }
  }

	appState = new ApplicationDataContext(appState, void(0), void(0),
			enableUndo, routingEnabled);

	if(routingEnabled){
		//Setup 'pageNotFound' route
		page('*', function(){
			external = true;
			appState.setState({'pageNotFound':true});
			internal = false;
		});
		//Initilize first path
		page.replace(appState.path);
		//Need a set internal = true to intialise
		//so that it does not update state again and
		//add previousState
		internal = true;
		page.start({click: false, dispatch: false});
		external = false;
	}

	Object.freeze(appState.state);
	Object.freeze(appState);
	return appState;
};
