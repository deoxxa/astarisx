var page = require('page');
var utils = require('./utils');
var extend = utils.extend;
var updateStatic = utils.updateStatic;
var uuid = utils.uuid;
var isArray = utils.isArray;
var isControllerViewModel = utils.isControllerViewModel;
var ApplicationDataContext;

var StateManager = function(component, appCtx/*, initCtxArgs... */) {
	
	var namespace = uuid(),
		controllerViewModel,
		stateChangeHandler,
		viewKey,
		node,
		enableUndo,
		routingEnabled,
		staticState = {}, //Only applicable to ControllerViewModel
		hasStatic = false, //Only applicable to ControllerViewModel
		dataContexts = {},
		domain,
		links = {},
		watchedDataContexts = {},
		viewModel,
		transientState = {},
		processedState = {},
		watchedState,
		watchedItem,
		watchedProp,
		watchedDataContext,
		link,
		calledBack = false,
		routeHash = {},
		routeMapping = {},
		routePath,
		external = false,
		internal = false,
		stateMgr = this;

	//Ensures that UI shouldComponentUpdate will not be overridden
	var shouldComponentUpdateIsNull = component.shouldComponentUpdate === null;
	var initCtxArgs = Array.prototype.slice.call(arguments, 2);

	stateMgr.appState = {};
	stateMgr.listeners = {};
	stateMgr.handlers = {};
	stateMgr.hasListeners = false;		

	controllerViewModel = appCtx.controllerViewModel;
	enableUndo = 'enableUndo' in appCtx ? appCtx.enableUndo : false;
	routingEnabled = 'enableRouting' in appCtx ? appCtx.enableRouting : false;
	stateMgr.signInUrl = appCtx.signInUrl;

	stateChangeHandler = function(applicationDataContext){
    	component.setState({appContext: applicationDataContext});
  };

  notifyViews = function(notify){
  	var temp, updateUI;
		
		if(stateMgr.hasListeners){
			stateChangeEvent = new CustomEvent("stateChange", {
				"detail": {
					"appContext": stateMgr.appState,
					"shouldUpdate": true
				}
			});
			passiveStateChangeEvent = new CustomEvent("stateChange", {
				"detail": {
					"appContext": stateMgr.appState,
					"shouldUpdate": false
				}
			});
			
			//Notify views of a state change. If a view is specified in $notify
			//then update specified views. Notify other without rendering them.
		  if(notify){
				if(isArray(notify)){
		  		temp = {};
		  		updateUI = !(notify.indexOf("*") === -1);
		  		//notify specific views
          notify.forEach(function (viewKey) {
          	if(viewKey === "*"){
          		//Ensure UI IS rendered
	        		if(shouldComponentUpdateIsNull){
					    	component.shouldComponentUpdate = function(){
					    		return true;
					    	}
				    	};
          	} else if(viewKey in stateMgr.listeners) {
              stateMgr.listeners[viewKey].dispatchEvent(stateChangeEvent);
            	temp[viewKey] = true;
            }
          });

	        //notify other views but do not render component
	        if(!updateUI){
	        	//Ensure UI IS NOT rendered
	        	if(shouldComponentUpdateIsNull){
				    	component.shouldComponentUpdate = function(){
				    		return false;
				    	}
			    	};
	        }
			    for(var k in stateMgr.listeners){
			  		if(stateMgr.listeners.hasOwnProperty(k) && !!!temp[k]){
			  			stateMgr.listeners[k].dispatchEvent(passiveStateChangeEvent);
			  		}
			  	}
		  		temp = void(0);
        } else {
					if(notify === "*"){
						//Ensure UI IS rendered
	        	if(shouldComponentUpdateIsNull){
				    	component.shouldComponentUpdate = function(){
				    		return true;
				    	}
			    	};
					} else {
						//Ensure UI IS NOT rendered
	        	if(shouldComponentUpdateIsNull){
				    	component.shouldComponentUpdate = function(){
				    		return false;
				    	}
			    	};
					}
					for(var k2 in stateMgr.listeners){
			  		if(stateMgr.listeners.hasOwnProperty(k2)){
			  			if(k2 === notify){
								stateMgr.listeners[k2].dispatchEvent(stateChangeEvent);
			  			} else {
			  				stateMgr.listeners[k2].dispatchEvent(passiveStateChangeEvent);
			  			}
			  		}
			  	}
				}
			} else {
				// Notify all views
				// Ensure UI IS rendered
	      if(shouldComponentUpdateIsNull){
		    	component.shouldComponentUpdate = function(){
		    		return true;
		    	}
	    	};
		    for(var k3 in stateMgr.listeners){
		  		if(stateMgr.listeners.hasOwnProperty(k3)){
		  			stateMgr.listeners[k3].dispatchEvent(stateChangeEvent);
		  		}
		  	}
			}
			stateChangeEvent = void(0);
			passiveStateChangeEvent = void(0);
		} else {
			// No listeners
			// Ensure UI is rendered
	    if(shouldComponentUpdateIsNull){
	    	component.shouldComponentUpdate = function(){
	    		return true;
	    	}
    	};
		}
		stateChangeHandler(stateMgr.appState);
  };

	var appStateChangeHandler = function(caller, newState, newAppState, remember, callback, delay, revert) {
		var nextState = {},
      prevState = void(0),
      redoState = void(0),
      newStateKeys,
      newStateKeysLen,
      newAppStateKeysLen,
      keyIdx,
      transientStateKeysLen,
      transientStateKeys,
      dataContext,
      dataContext2,
      linkedDataContext,
      processedStateKeys = [],
      processedStateKeysLen,
      watchedField,
      subscribers,
      subscriber,
      pushStateChanged = false,
      willUndo = false,
      stateChangeEvent,
      passiveStateChangeEvent;

    //If reverting to previousState remove any processedState from the prior call
    //This occurs because of the callback batching process
    processedState = revert ? {} : processedState;

    if(typeof remember === 'function'){
    	delay = void(0);
    	if(callback !== void(0) && !isNaN(callback)){
    		delay = callback.toFixed();
    	};
    	callback = remember;
    	if(typeof newAppState === 'boolean'){
    		remember = newAppState;
    		newAppState = {};
    	} else {
    		remember = true;
    	}
    } else if (typeof newAppState === 'function'){
    	delay = void(0);
    	if(remember !== void(0) && !isNaN(remember)){
    		delay = remember.toFixed();
    	};
    	callback = newAppState;
    	newAppState = {};
  		remember = true;
    } else if (typeof newState === 'function'){
    	delay = void(0);
    	if(newAppState !== void(0) && !isNaN(newAppState)){
    		delay = newAppState.toFixed();
    	};
    	remember = true;
    	callback = newState;
    	newState = {};
    	newAppState = {};
    }

    if(remember === void(0)){
    	remember = true;
    }
		
		newState = newState || {};
		newStateKeys = Object.keys(newState);
		newStateKeysLen = newStateKeys.length;

		newAppState = newAppState || {};
		newAppStateKeysLen = Object.keys(newAppState).length;

		//This covers setState with no args or with void(0) or with {} as argument
    if(!!!newStateKeysLen && !!!newAppStateKeysLen){
    	if(typeof callback === 'function'){
				
				if(!remember){
					stateMgr.appState = new ApplicationDataContext(stateMgr.appState.$state,
						stateMgr.appState.$previousState, redoState,
						enableUndo, routingEnabled, false, //nextState.$path !== stateMgr.appState.$path,
						!external || nextState.$pageNotFound, remember);
				}

				if(delay !== void(0) && !isNaN(delay)){
					calledBack = false;
					notifyViews(processedState.$notify);
					transientState = {};
					processedState = {};

					window.setTimeout(function(){
					  if(caller === namespace){
	            callback.call(stateMgr.appState, void(0), stateMgr.appState);
	          } else {
	            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
	          }
		      }, delay);
				} else {
					calledBack = true;
				  if(caller === namespace){
            callback.call(stateMgr.appState, void(0), stateMgr.appState);
          } else {
            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
          }
				}
    	} else {
    		calledBack = false;
    		notifyViews(processedState.$notify);
				transientState = {};
				processedState = {};
    	}
    	return;
    }

		//Check to see if appState is a ready made $state object. If so
		//pass it straight to the stateChangeHandler. If a callback was passed in
		//it would be assigned to newState
		if(isControllerViewModel(newState)) {
			willUndo = true;
			nextState = extend(newState, staticState);
			prevState = newState.$previousState;
			redoState = newAppState;
			//Need to reset ViewModel with instance object so that setState is associated with
			//the current ViewModel. This reason this occurs is that when a ViewModel is created it
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
							nextState[dataContext].$state[links[dataContext][linkedDataContext]] =
								(linkedDataContext in domain) ? extend(nextState[linkedDataContext]) :
									nextState[linkedDataContext];
						}
					}
				}
			}

			if(typeof callback === 'function'){
				try {
					//Pass in $dataContextUpdated to callback
		      nextState = extend(nextState, {$dataContextUpdated: newState.$state.$dataContextUpdated});

					stateMgr.appState = new ApplicationDataContext(nextState, prevState, redoState,
					enableUndo, routingEnabled, nextState.$path !== stateMgr.appState.$path,
					!external || nextState.$pageNotFound, remember);
					
	        if(delay !== void(0) && !isNaN(delay)){
	        	calledBack = false;
	        	notifyViews(processedState.$notify);
						transientState = {};
						processedState = {};
						window.setTimeout(function(){
               callback.call(stateMgr.appState, void(0), stateMgr.appState);
			      }, delay);
					} else {
						calledBack = true;
            callback.call(stateMgr.appState, void(0), stateMgr.appState);
					}
				} catch(e) {
					calledBack = false;
					transientState = {};
					processedState = {};					
					callback(e);
				}
        return;
			}
		
		} else {
			
			if(hasStatic){
				staticState = updateStatic(staticState, newState, newAppState);
			}

			if(!!newStateKeysLen){
				if(caller === namespace){
					nextState = extend(newState);
				} else {
					nextState[caller] = extend(newState);
				}
			}

			//If newAppState included the current caller dataContext then newAppState stomped on
			//nextState. Below I merge the current caller state into one object then use that
			//to extend the transientState 
			if(caller !== void(0) && caller in newAppState){
				var mergedNextState = {};
				mergedNextState[caller] = extend(nextState[caller], newAppState[caller]);
				transientState = extend(newAppState, mergedNextState, transientState);
			} else {
				transientState = extend(newAppState, nextState, transientState);
			}


			transientStateKeys = Object.keys(transientState);
			if(transientStateKeys.length === 0){
				if(typeof callback === 'function'){
					if(!remember){
						stateMgr.appState = new ApplicationDataContext(stateMgr.appState.$state,
							stateMgr.appState.$previousState, redoState,
							enableUndo, routingEnabled, false, //nextState.$path !== stateMgr.appState.$path,
							!external || nextState.$pageNotFound, remember);
					}

					if(delay !== void(0) && !isNaN(delay)){
						calledBack = false;
						notifyViews(processedState.$notify);
						transientState = {};
						processedState = {};
						window.setTimeout(function(){
						  if(caller === namespace){
		            callback.call(stateMgr.appState, void(0), stateMgr.appState);
		          } else {
		            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
		          }
			      }, delay);
					} else {
						calledBack = true;
					  if(caller === namespace){
	            callback.call(stateMgr.appState, void(0), stateMgr.appState);
	          } else {
	            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
	          }
						return;
					}
				} else {
					return;
				}
			}

			transientStateKeysLen = transientStateKeys.length - 1;
			for (keyIdx = transientStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(transientStateKeys[keyIdx] in domain){
					nextState[transientStateKeys[keyIdx]] = extend(stateMgr.appState[transientStateKeys[keyIdx]], transientState[transientStateKeys[keyIdx]]);
					nextState[transientStateKeys[keyIdx]] = new dataContexts[transientStateKeys[keyIdx]](nextState[transientStateKeys[keyIdx]]);
				} else {
					nextState[transientStateKeys[keyIdx]] = transientState[transientStateKeys[keyIdx]];
				}
			};
			processedState = extend(processedState, nextState);
			//Triggers
			nextState = extend(stateMgr.appState, processedState);

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
													nextState[subscriber].$state[links[subscriber][dataContext]] =
														(dataContext in domain) ? extend(nextState[dataContext]) :
															nextState[dataContext];
												}
												if(dataContext in links){
													for(dataContext2 in links[dataContext]){
														if(links[dataContext].hasOwnProperty(dataContext2)){
															nextState[dataContext].$state[links[dataContext][dataContext2]] =
																(dataContext2 in domain) ? extend(nextState[dataContext2]) :
																	nextState[dataContext2];
														}
													}
												}
											}
										}
										transientState = extend(transientState,
											subscribers[subscriber].call(stateMgr.appState[subscriber],
											nextState[transientStateKeys[keyIdx]][watchedField],
											stateMgr.appState[transientStateKeys[keyIdx]][watchedField],
											watchedField, transientStateKeys[keyIdx],
											nextState.$path, stateMgr.appState.$path));
									}
								}
							}
						}
					}
				}
			};

			if(!!Object.keys(transientState).length){
				appStateChangeHandler(void(0), {}, transientState, remember, callback, delay);
				return;
			}
			//Link Phase
			processedStateKeys = Object.keys(processedState);
			processedStateKeysLen = processedStateKeys.length - 1;
			for (keyIdx = processedStateKeysLen; keyIdx >= 0; keyIdx--) {
				if(caller === namespace && (namespace in links)){
					if(processedStateKeys[keyIdx] in links[namespace]){
						for(dataContext in links[namespace][processedStateKeys[keyIdx]]){
							if(links[namespace][processedStateKeys[keyIdx]].hasOwnProperty(dataContext)){
								nextState[dataContext].$state[links[namespace][processedStateKeys[keyIdx]][dataContext]] =
                  (processedStateKeys[keyIdx] in domain) ? extend(nextState[processedStateKeys[keyIdx]]) :
                        nextState[processedStateKeys[keyIdx]];
							}
							if(dataContext in links){
								for(dataContext2 in links[dataContext]){
									if(links[dataContext].hasOwnProperty(dataContext2)){
										nextState[dataContext].$state[links[dataContext][dataContext2]] =
											(dataContext2 in domain) ? extend(nextState[dataContext2]) :
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
								nextState[processedStateKeys[keyIdx]].$state[links[processedStateKeys[keyIdx]][dataContext]] =
									(dataContext in domain) ? extend(nextState[dataContext]) : nextState[dataContext];
							}
							if(dataContext in links){
								for(dataContext2 in links[dataContext]){
									if(links[dataContext].hasOwnProperty(dataContext2)){
										nextState[dataContext].$state[links[dataContext][dataContext2]] =
											(dataContext2 in domain) ? extend(nextState[dataContext2]) :
                        nextState[dataContext2];
									}
								}
							}
						}
					}
				}
	    }

			if(stateMgr.appState.$canRevert && calledBack){
				prevState = stateMgr.appState.$previousState;
        if(hasStatic && stateMgr.appState.$canAdvance &&
        	staticState._staticUpdated && staticState._onlyStatic){
          redoState = stateMgr.appState.$nextState;
        }

			} else if(hasStatic && staticState._staticUpdated && staticState._onlyStatic){
        if(stateMgr.appState.$canRevert){
        	prevState = stateMgr.appState;
        }
        if(stateMgr.appState.$canAdvance){
        	redoState = stateMgr.appState.$nextState;
        }
      } else {
				prevState = stateMgr.appState;
			}
		}

		if(!!prevState){
			Object.freeze(prevState);
		}

		//check the paths to see of there has been an path change
		pushStateChanged = nextState.$path !== stateMgr.appState.$path;

		try {
			//Add $dataContextUpdated to appState
      if(willUndo){
        nextState = extend(nextState, {$dataContextUpdated: newState.$state.$dataContextUpdated});
      } else {
        nextState = extend(nextState, {$dataContextUpdated: processedState});
      }

			stateMgr.appState = new ApplicationDataContext(nextState, prevState, redoState,
			enableUndo, routingEnabled, pushStateChanged,
			!external || nextState.$pageNotFound, remember);	

			Object.freeze(stateMgr.appState);
			Object.freeze(stateMgr.appState.$state);

			if(typeof callback === 'function'){
				if(delay !== void(0) && !isNaN(delay)){
					calledBack = false;
					notifyViews(processedState.$notify);
					transientState = {};
					processedState = {};
					window.setTimeout(function(){
					  if(caller === namespace){
	            callback.call(stateMgr.appState, void(0), stateMgr.appState);
	          } else {
	            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
	          }
		      }, delay);
				} else {
					calledBack = true;
				  if(caller === namespace){
            callback.call(stateMgr.appState, void(0), stateMgr.appState);
          } else {
            callback.call(stateMgr.appState[caller], void(0), stateMgr.appState);
          }
					return;
				}
			}
		} catch(e) {
			if(typeof callback === 'function'){
				calledBack = false;
				transientState = {};
				processedState = {};
				callback(e);
				return;
			}
		}

		// Internal call routing
		if(routingEnabled && stateMgr.appState.$pushState){
			if(('$path' in stateMgr.appState) && !external){
				internal = true;
				if(pushStateChanged && !stateMgr.appState.$forceReplace){
					page(stateMgr.appState.$path);
				} else {
					page.replace(stateMgr.appState.$path);
				}
			}
			external = false;
		}
		
		/***************/
		/* All the work is done! -> Notify the UI
		/* and any other mounted Views
		/***************/
		calledBack = false;
  	notifyViews(nextState.$notify);
		transientState = {};
		processedState = {};
	};
	/***************/
	/* Initialize Application Data Context
	/***************/
  try {
  	ApplicationDataContext = controllerViewModel.call(this, appStateChangeHandler.bind(this, namespace));
  	stateMgr.appState = new ApplicationDataContext(void(0), void(0), void(0), enableUndo, routingEnabled);
    // stateMgr.appState.$state = stateMgr.appState.$state || {};
  } catch (e) { 
  	if (e instanceof TypeError) {
    	throw new TypeError('Please assign a ControllerViewModel to the "controllerViewModel" prop in React.renderComponent');
  	} else {
  		throw e;
  	}
  }

	domain = stateMgr.appState.constructor.originalSpec.getViewModels();
	delete Object.getPrototypeOf(stateMgr.appState).getViewModels;
	
	//Initialize all dataContexts
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			dataContexts[viewModel] = domain[viewModel].call(this, appStateChangeHandler.bind(this, viewModel));
			stateMgr.appState.$state[viewModel] = new dataContexts[viewModel](stateMgr.appState.$state[viewModel], true);
    }
  }

  //Store links
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			if('getWatchedState' in stateMgr.appState[viewModel].constructor.originalSpec){
				watchedState = stateMgr.appState[viewModel].constructor.originalSpec.getWatchedState();
				for(watchedItem in watchedState){
					if(watchedState.hasOwnProperty(watchedItem)){
						if(watchedItem in domain || watchedItem in stateMgr.appState){
							if('alias' in watchedState[watchedItem]){
								if(!(viewModel in links)){
									links[viewModel] = {};
								}
								links[viewModel][watchedItem] = watchedState[watchedItem].alias;

								if(!(watchedItem in domain)){
									if(!(namespace in links)){
										links[namespace] = {};
									}
									if(!(viewModel in links[namespace])){
										links[namespace][watchedItem] = {};
									}
									links[namespace][watchedItem][viewModel] = watchedState[watchedItem].alias;
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
										watchedDataContext[watchedProp][viewModel] =
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
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			for(link in links[viewModel]){
			  if(links[viewModel].hasOwnProperty(link)){
					stateMgr.appState[viewModel].$state[links[viewModel][link]] = 
            (link in domain) ? extend(stateMgr.appState[link]) : stateMgr.appState[link];
			  }
			}
		}
	}

	//reinitialize with all data in place
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			stateMgr.appState.$state[viewModel] =
				new dataContexts[viewModel](stateMgr.appState.$state[viewModel]);

			if('getRoutes' in stateMgr.appState[viewModel].constructor.originalSpec){
				routeHash = stateMgr.appState[viewModel].constructor.originalSpec.getRoutes();
				for(routePath in routeHash){
					if(routeHash.hasOwnProperty(routePath)){
						routeMapping[routeHash[routePath].path] = routeHash[routePath].handler;
						page(routeHash[routePath].path, function(dataContextName, route,
								pathKey, ctx){
							external = true;
							if(!internal) {
								routeMapping[route].call(stateMgr.appState[dataContextName], ctx.params,
								ctx.path, pathKey, ctx, ('show' in stateMgr.appState) ? stateMgr.appState.show.bind(stateMgr.appState): void(0));
							}
							internal = false;
						}.bind(this, viewModel, routeHash[routePath].path, routePath));
					}
				}
				delete Object.getPrototypeOf(stateMgr.appState[viewModel]).getRoutes;
    	}

    	//This is if astarisx-animate mixin is used
			if('getDisplays' in stateMgr.appState[viewModel].constructor.originalSpec){
				try {
					stateMgr.appState.addDisplays(stateMgr.appState[viewModel].constructor.originalSpec.getDisplays(), viewModel);
					delete Object.getPrototypeOf(stateMgr.appState[viewModel]).getDisplays;
				} catch (e) { 
			  	if (e instanceof TypeError) {
			    	throw new TypeError('Please ensure that Astarisx-Animate is mixed into the ControllerViewModel.');
			  	} else {
			  		throw e;
			  	}
			  }
			}
		}
  }

	//This is if astarisx-animate mixin is used
	if('getDisplays' in stateMgr.appState.constructor.originalSpec){
		stateMgr.appState.addDisplays(stateMgr.appState.constructor.originalSpec.getDisplays());
		delete Object.getPrototypeOf(stateMgr.appState).getDisplays;
	}
	delete Object.getPrototypeOf(stateMgr.appState).addDisplays;

	if('getTransitions' in stateMgr.appState.constructor.originalSpec){
		stateMgr.appState.addTransitions(stateMgr.appState.constructor.originalSpec.getTransitions());
		delete Object.getPrototypeOf(stateMgr.appState).getTransitions;
	}
	delete Object.getPrototypeOf(stateMgr.appState).addTransitions;

	stateMgr.appState = new ApplicationDataContext(stateMgr.appState, void(0), void(0),
			enableUndo, routingEnabled);

	if(routingEnabled){
		//Setup 'pageNotFound' route
		page(function(ctx){
			external = true;
			stateMgr.appState.setState({'$pageNotFound':true});
			internal = false;
		});
		//Initilize first path
		internal = true;
		page.replace(stateMgr.appState.$path);
		page.start({click: false, dispatch: false});
		external = false;
	}

	hasStatic = stateMgr.appState.constructor.getDescriptor().hasStatic;
	if(hasStatic){
		staticState = updateStatic(stateMgr.appState.constructor.getDescriptor().statics, stateMgr.appState.$state);
	}

  Object.freeze(stateMgr.appState.$state);
  Object.freeze(stateMgr.appState);

  stateChangeHandler(stateMgr.appState);
  if('dataContextWillInitialize' in stateMgr.appState.constructor.originalSpec){
    stateMgr.appState.constructor.originalSpec.dataContextWillInitialize.apply(stateMgr.appState, initCtxArgs);
    delete Object.getPrototypeOf(stateMgr.appState).dataContextWillInitialize;
  }

};

StateManager.prototype.currentState = function(){
  return this.appState;
};

StateManager.prototype.unmountView = function(component){
	var viewKey = component.props.$viewKey || component._rootNodeID;	
	if(this.listeners === null || this.listeners === void(0)){
		this.handlers = null;
		this.hasListeners = false;
		return;
	}
	this.listeners[viewKey].removeEventListener("stateChange", this.handlers[viewKey]);
	delete this.listeners[viewKey];
	delete this.handlers[viewKey];
	if(!!!Object.keys(this.listeners).length){
		this.hasListeners = false;
	}
}

StateManager.prototype.mountView = function(component){
		var viewKey = component.props.$viewKey || component._rootNodeID;
		var node = component.getDOMNode();
		var shouldUpdate = true;

		//Do not override shouldComponentUpdate if exists
		if(component.shouldComponentUpdate === null){
	    component.shouldComponentUpdate = function(){
	    	var retVal = shouldUpdate;
        shouldUpdate = false;
	    	return retVal;
	    }
		}
		this.handlers[viewKey] = function(e){
			shouldUpdate = e.detail.shouldUpdate === void(0) ? true : e.detail.shouldUpdate;
			component.setState({appContext: e.detail.appContext});
		};
		// if node is null i.e. return 'null' from render(). then create a dummy element
		// to attach the event listener to
		this.listeners[viewKey] = !!node ? node : document.createElement("div");
  	this.listeners[viewKey].addEventListener("stateChange", this.handlers[viewKey]);
  	this.hasListeners = true;
}

StateManager.prototype.dispose = function(){
  
  var emptyState = new ApplicationDataContext(void(0), void(0), void(0), false, false);
	var resetState = {};
	var viewModels = this.appState.constructor.originalSpec.getViewModels();
	if(!!this.signInUrl){
		page.replace(this.signInUrl);
	}
	//first check if Animation mixin is being used
	//if it is then reset the display
	if('resetDisplay' in this.appState){
		this.appState.resetDisplay();
	}
		
	//remove listners
	for(var viewKey in this.listeners){
		if(this.listeners.hasOwnProperty(viewKey)){
			this.listeners[viewKey].removeEventListener("stateChange", this.handlers[viewKey]);
		}
	}
	
	//reset dataContexts
	for(viewModel in viewModels){
		if(viewModels.hasOwnProperty(viewModel)){
			resetState[viewModel] = this.appState[viewModel].__dispose();
    }
  }
  resetState = extend(this.appState, emptyState, resetState);
	try {
  	this.appState = new ApplicationDataContext(resetState, void(0), void(0), false, false);
    // this.appState.$state = this.appState.$state || {};
  } catch (e) { 
  	if (e instanceof TypeError) {
    	throw new TypeError('Something went wrong');
  	} else {
  		throw e;
  	}
  }

	delete this.appState.constructor.originalSpec.__processedSpec__;
	for(viewModel in viewModels){
		if(viewModels.hasOwnProperty(viewModel)){
			delete this.appState[viewModel].constructor.originalSpec.__processedSpec__;
		}
	}
	this.listeners = null;
	this.handlers = null;
	this.hasListeners = false;

};

module.exports = StateManager;

