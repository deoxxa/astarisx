var page = require('page');
var utils = require('./utils');
var extend = utils.extend;
var updateStatic = utils.updateStatic;
var uuid = require('./utils').uuid;

var StateManager = function(component, appCtx, initCtxObj) {
	
	var namespace = uuid(),
		ApplicationDataContext,
		controllerViewModel,
		stateChangeHandler,
		viewKey,
		node,
		enableUndo,
		routingEnabled,
		staticState = {},
		hasStatic = false,
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
		self = this;

		self.appState = {};
		self.listeners = {};
		self.handlers = {};
		self.hasListeners = false;		

		controllerViewModel = appCtx.controllerViewModel;
		enableUndo = 'enableUndo' in appCtx ? appCtx.enableUndo : false;
		routingEnabled = 'enableRouting' in appCtx ? appCtx.enableRouting : false;
		stateChangeHandler = function(applicationDataContext){
	    component.setState({appContext: applicationDataContext});
	  };

	var appStateChangeHandler = function(caller, newState, newAppState, remember, callback, delay) {
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
			subscriber,
			pushStateChanged = false,
			willUndo = false,
			stateChangeEvent;

    if(arguments.length < 2){
      newState = self.appState;
    }

    if(typeof remember === 'function'){
    	delay = callback;
      callback = remember;
      remember = true;
    } else if(typeof newAppState === 'function'){
    	delay = remember;
			callback = newAppState;
			newAppState = {};
		} else if (typeof newAppState === 'boolean'){
      remember = newAppState;
      newAppState = {};
    }

    if(remember === void(0)){
    	remember = true;
    }
		newState = newState || {};
		newStateKeys = Object.keys(newState);

		//Check to see if appState is a ready made state object. If so
		//pass it straight to the stateChangeHandler. If a callback was passed in
		//it would be assigned to newState
		if(Object.getPrototypeOf(newState).constructor.classType === "ControllerViewModel") {
			willUndo = true;
			nextState = extend(newState, staticState);
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
				try {
						self.appState = new ApplicationDataContext(nextState, prevState, redoState,
						enableUndo, routingEnabled, nextState.path !== self.appState.path,
						!external || nextState.pageNotFound, remember);

	        calledBack = true;
	        if(!!delay){
						window.setTimeout(function(){
						  if(caller === namespace){
                callback.call(self.appState, void(0), self.appState);
              } else {
                callback.call(self.appState[caller], void(0), self.appState);
              }
			      }, delay);
					} else {
					  if(caller === namespace){
              callback.call(self.appState, void(0), self.appState);
            } else {
              callback.call(self.appState[caller], void(0), self.appState);
            }
					}
				} catch(e) {
					callback(e);
				}
        return;
			}
		} else {

			if(hasStatic){
				staticState = updateStatic(staticState, newState);
			}

			if(!!newStateKeys.length){
				if(caller === namespace){
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
					nextState[transientStateKeys[keyIdx]] = extend(self.appState[transientStateKeys[keyIdx]], transientState[transientStateKeys[keyIdx]]);
					nextState[transientStateKeys[keyIdx]] = new dataContexts[transientStateKeys[keyIdx]](nextState[transientStateKeys[keyIdx]]);
				} else {
					nextState[transientStateKeys[keyIdx]] = transientState[transientStateKeys[keyIdx]];
				}
			};

			processedState = extend(processedState, nextState);

			//Triggers
			nextState = extend(self.appState, processedState);

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
											subscribers[subscriber].call(self.appState[subscriber],
											nextState[transientStateKeys[keyIdx]][watchedField],
											self.appState[transientStateKeys[keyIdx]][watchedField],
											watchedField, transientStateKeys[keyIdx],
											nextState.path, self.appState.path));
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
								nextState[dataContext].state[links[namespace][processedStateKeys[keyIdx]][dataContext]] =
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

			if(self.appState.canRevert && calledBack){
				prevState = self.appState.previousState;
			} else if(hasStatic && staticState._staticUpdated && staticState._onlyStatic){
        if(self.appState.canRevert){
        	prevState = self.appState.previousState;
        }
        if(self.appState.canAdvance){
        	redoState = self.appState.nextState;
        }
      } else {
				prevState = self.appState;
			}
		}

		if(!!prevState){
			Object.freeze(prevState);
		}

		//check the paths to see of there has been an path change
		pushStateChanged = nextState.path !== self.appState.path;

		try {
			//Add dataContextWillUpdate
      if(willUndo){
        nextState = extend(nextState, {dataContextWillUpdate: newState.state.dataContextWillUpdate});
      } else {
        nextState = extend(nextState, {dataContextWillUpdate: processedState});
      }

			self.appState = new ApplicationDataContext(nextState, prevState, redoState,
			enableUndo, routingEnabled, pushStateChanged,
			!external || nextState.pageNotFound, remember);	

			Object.freeze(self.appState);
			Object.freeze(self.appState.state);

			if(typeof callback === 'function'){
				calledBack = true;
				if(!!delay){
					window.setTimeout(function(){
					  if(caller === namespace){
	            callback.call(self.appState, void(0), self.appState);
	          } else {
	            callback.call(self.appState[caller], void(0), self.appState);
	          }
		      }, delay);
				} else {
				  if(caller === namespace){
            callback.call(self.appState, void(0), self.appState);
          } else {
            callback.call(self.appState[caller], void(0), self.appState);
          }
					return;
				}
			}
		} catch(e) {
			if(typeof callback === 'function'){
				callback(e);
				return;
			}
		}

		// Internal call routing
		if(routingEnabled && self.appState.pushState){
			if(('path' in self.appState) && !external){
				internal = true;
				if(pushStateChanged && !self.appState.forceReplace){
					page(self.appState.path);
				} else {
					page.replace(self.appState.path);
				}
			}
			external = false;
		}
		
		/***************/
		/* All the work is done! -> Notify the UI
		/* and any other mounted Views
		/***************/
		calledBack = false;
		transientState = {};
		processedState = {};
  	
  	if(self.hasListeners){
			stateChangeEvent = new CustomEvent("stateChange", {"detail": self.appState});
		  if(nextState.notify){
		  	//Only notify specific views
				if(Object.prototype.toString.call(nextState.notify) === '[object Array]'){
					nextState.notify.forEach(function(viewKey){
						if(viewKey === "*"){
							stateChangeHandler(self.appState);
						} else if(viewKey in self.listeners){
							self.listeners[viewKey].dispatchEvent(stateChangeEvent);
						}
					});
				} else {
					if(nextState.notify === "*"){
						stateChangeHandler(self.appState);
					} else if(nextState.notify in self.listeners){
						self.listeners[nextState.notify].dispatchEvent(stateChangeEvent);
					}
				}
			} else {
				// Notify all the views
		    stateChangeHandler(self.appState);
		    for(var k in self.listeners){
		  		if(self.listeners.hasOwnProperty(k)){
		  			self.listeners[k].dispatchEvent(stateChangeEvent);
		  		}
		  	}
			}
			stateChangeEvent = void(0);
		} else {
			stateChangeHandler(self.appState);
		}
	};
	/***************/
	/* Initialize Application Data Context
	/***************/
  try {
  	ApplicationDataContext = controllerViewModel.call(this, appStateChangeHandler.bind(this, namespace));
  	self.appState = new ApplicationDataContext(void(0), void(0), void(0), enableUndo, routingEnabled);
    self.appState.state = self.appState.state || {};
  } catch (e) { 
  	if (e instanceof TypeError) {
    	throw new TypeError('Please assign a ControllerViewModel to the "controllerViewModel" prop in React.renderComponent');
  	} else {
  		throw e;
  	}
  }

  this.viewModels = self.appState.constructor.originalSpec.getViewModels();
	domain = this.viewModels;
	delete self.appState.__proto__.getViewModels;

	//Initialize all dataContexts
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			dataContexts[viewModel] = domain[viewModel].call(this, appStateChangeHandler.bind(this, viewModel));
			self.appState.state[viewModel] = new dataContexts[viewModel](self.appState.state[viewModel], true);
    }
  }

  //Store links
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			if('getWatchedState' in self.appState[viewModel].constructor.originalSpec){
				watchedState = self.appState[viewModel].constructor.originalSpec.getWatchedState();
				for(watchedItem in watchedState){
					if(watchedState.hasOwnProperty(watchedItem)){
						if(watchedItem in domain || watchedItem in self.appState){
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
					self.appState[viewModel].state[links[viewModel][link]] = self.appState[link];
			  }
			}
		}
	}

	//reinitialize with all data in place
	for(viewModel in domain){
		if(domain.hasOwnProperty(viewModel)){
			self.appState.state[viewModel] =
				new dataContexts[viewModel](self.appState.state[viewModel]);

			if('getRoutes' in self.appState[viewModel].constructor.originalSpec){
				routeHash = self.appState[viewModel].constructor.originalSpec.getRoutes();
				for(routePath in routeHash){
					if(routeHash.hasOwnProperty(routePath)){
						routeMapping[routeHash[routePath].path] = routeHash[routePath].handler;
						page(routeHash[routePath].path, function(dataContextName, route,
								pathKey, ctx){
							external = true;
							if(!internal) {
								if(self.appState.canRevert && self.appState.pageNotFound){
                  ctx.rollbackRequest = true;
									ctx.revert = function(){
                    this.revert.bind(this);
                    this.setState({},{path:ctx.path});
                  }.bind(self.appState);
                }
								routeMapping[route].call(self.appState[dataContextName], ctx.params,
								ctx.path, pathKey, ctx, ('show' in self.appState) ? self.appState.show.bind(self.appState): void(0));
							}
							internal = false;
						}.bind(this, viewModel, routeHash[routePath].path, routePath));
					}
				}
				delete self.appState[viewModel].__proto__.getRoutes;
    	}

    	//This is if astarisx-animate mixin is used
			if('getDisplays' in self.appState[viewModel].constructor.originalSpec){
				self.appState.addDisplays(self.appState[viewModel].constructor.originalSpec.getDisplays(), viewModel);
				delete self.appState[viewModel].__proto__.getDisplays;
			}
		}
  }

	//This is if astarisx-animate mixin is used
	if('getDisplays' in self.appState.constructor.originalSpec){
		self.appState.addDisplays(self.appState.constructor.originalSpec.getDisplays());
		delete self.appState.__proto__.getDisplays;
	}
	delete self.appState.__proto__.addDisplays;

	if('getTransitions' in self.appState.constructor.originalSpec){
		self.appState.addTransitions(self.appState.constructor.originalSpec.getTransitions());
		delete self.appState.__proto__.getTransitions;
	}
	delete self.appState.__proto__.addTransitions;

	self.appState = new ApplicationDataContext(self.appState, void(0), void(0),
			enableUndo, routingEnabled);

	if(routingEnabled){
		//Setup 'pageNotFound' route
		page(function(ctx){
			external = true;
			self.appState.setState({'pageNotFound':true});
			internal = false;
		});
		//Initilize first path
		internal = true;
		page.replace(self.appState.path);
		page.start({click: false, dispatch: false});
		external = false;
	}

	hasStatic = self.appState.constructor.originalSpec.__processedSpec__.hasStatic;
	if(hasStatic){
		staticState = updateStatic(self.appState.constructor.originalSpec.__processedSpec__.statics, self.appState.state);
	}

  Object.freeze(self.appState.state);
  Object.freeze(self.appState);

  if('dataContextWillInitialize' in self.appState.constructor.originalSpec){
    self.appState.constructor.originalSpec.dataContextWillInitialize.call(self.appState, initCtxObj);
    delete self.appState.__proto__.dataContextWillInitialize;
  }

};

StateManager.prototype.currentState = function(){
  return this.appState;
};

StateManager.prototype.unmountView = function(component){
	var viewKey = component.props.viewKey || component._rootNodeID;
	this.listeners[viewKey].removeEventListener("stateChange", this.handlers[viewKey]);
	delete this.listeners[viewKey];
	delete this.handlers[viewKey];
	if(!!!Object.keys(this.listeners).length){
		this.hasListeners = false;
	}
}

StateManager.prototype.mountView = function(component){
		var viewKey = component.props.viewKey || component._rootNodeID;
		this.handlers[viewKey] = function(e){
	    component.setState({appContext: e.detail});
		};
		var node = component.getDOMNode();
		// if node is null i.e. return 'null' from render(). then create a dummy element
		// to attach the event listener to
		this.listeners[viewKey] = !!node ? node : document.createElement("div");
  	this.listeners[viewKey].addEventListener("stateChange", this.handlers[viewKey]);
  	this.hasListeners = true;
}

StateManager.prototype.dispose = function(){
	//remove listners
	for(var viewKey in this.listeners){
		if(this.listeners.hasOwnProperty(viewKey)){
			this.listeners[viewKey].removeEventListener("stateChange", this.handlers[viewKey]);
		}
	}

	delete this.appState.constructor.originalSpec.__processedSpec__;
	for(viewModel in this.viewModels){
		if(this.viewModels.hasOwnProperty(viewModel)){			
			delete this.appState[viewModel].constructor.originalSpec.__processedSpec__;
		}
	}

	this.appState = null;
	this.listeners = null;
	this.handlers = null;
	this.hasListeners = false;

};

module.exports = StateManager;