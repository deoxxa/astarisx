/* Polyfill CustomEvent - might look at synthetic Events*/
// (function () {
//   function CustomEvent ( event, params ) {
//     params = params || { bubbles: false, cancelable: false, detail: undefined };
//     var evt = document.createEvent( 'CustomEvent' );
//     evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
//     return evt;
//    };

//   CustomEvent.prototype = window.Event.prototype;

//   window.CustomEvent = CustomEvent;
// })();

var page = require('page');
var utils = require('./utils');
var extend = utils.extend;
var updateStatic = utils.updateStatic;
var __NAMESPACE__ = '__IMVVM__';
var initViewState, unmountView;

var initAppState = (function(appNamespace){
	var ApplicationDataContext,
		appState = {},
		initialized = false,
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
		animationEnabled = false,
		viewHash = {},
		viewMapping = {},
		view,
		defaultAppViewDisplay = "Application",
		viewPath,
		external = false,
		internal = false,
		controllerViewModel;

	var listeners = {}, hasListeners = false;
  var enableUndo, routingEnabled;

	var viewStateChangeHandler = function(e){
    this.setState({appContext: e.detail});
  };

  unmountView = function(component){
  	var viewKey = component.props.viewKey || component._rootNodeID;
  	listeners[viewKey].removeEventListener("stateChange");
  	delete listeners[viewKey];
  	if(!!!Object.keys(listeners).length){
  		hasListeners = false;
  	}
  }

	initViewState = function(component) {
		var stateChangeHandler;
		if(!initialized){
		  initialized = true;
			controllerViewModel = component.props.controllerViewModel;
			enableUndo = component.props.enableUndo === void(0) ? false : component.props.enableUndo;
			routingEnabled = component.props.enableRouting === void(0) ? false : component.props.enableRouting;
			stateChangeHandler = function(applicationDataContext){
		    component.setState({appContext: applicationDataContext});
		  };
	  } else {
	  	if(component !== void(0)){
	  		var viewKey = component.props.viewKey || component._rootNodeID;
	  		listeners[viewKey] = component.getDOMNode();
		  	listeners[viewKey].addEventListener("stateChange", viewStateChangeHandler.bind(component));
		  	hasListeners = true;
		  	return;
	  	}
	  	return appState;
	  }

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
	      newState = appState;
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
						appState = new ApplicationDataContext(nextState, prevState, redoState,
							enableUndo, routingEnabled, nextState.path !== appState.path,
							!external || nextState.pageNotFound, remember);

		        calledBack = true;
		        if(!!delay){
							window.setTimeout(function(){
								callback(void(0), appState);
				      }, delay);
						} else {
							callback(void(0), appState);
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
					appStateChangeHandler(void(0), {}, transientState, remember, callback, delay);
					return;
				}
				//Link Phase
				processedStateKeys = Object.keys(processedState);
				processedStateKeysLen = processedStateKeys.length - 1;
				for (keyIdx = processedStateKeysLen; keyIdx >= 0; keyIdx--) {
					if(caller === appNamespace && (appNamespace in links)){
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
				} else if(hasStatic && staticState._staticUpdated && staticState._onlyStatic){
	        if(appState.canRevert){
	        	prevState = appState.previousState;
	        }
	        if(appState.canAdvance){
	        	redoState = appState.nextState;
	        }
	      } else {
					prevState = appState;
				}
			}

			if(!!prevState){
				Object.freeze(prevState);
			}

			//check the paths to see of there has been an path change
			pushStateChanged = nextState.path !== appState.path;

			try {
				//Add dataContextWillUpdate
	      if(willUndo){
	        nextState = extend(nextState, {dataContextWillUpdate: newState.state.dataContextWillUpdate});
	      } else {
	        nextState = extend(nextState, {dataContextWillUpdate: processedState});
	      }

				appState = new ApplicationDataContext(nextState, prevState, redoState,
				enableUndo, routingEnabled, pushStateChanged,
				!external || nextState.pageNotFound, remember);	

				Object.freeze(appState);
				Object.freeze(appState.state);

				if(typeof callback === 'function'){
					calledBack = true;
					if(!!delay){
						window.setTimeout(function(){
							callback(void(0), appState);
			      }, delay);
					} else {
						callback(void(0), appState);
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
			if(routingEnabled && appState.pushState){
				if(('path' in appState) && !external){
					internal = true;
					if(pushStateChanged && !appState.forceReplace){
						page(appState.path);
					} else {
						page.replace(appState.path);
					}
				}
				external = false;
			}
			
			/***************/
			/* All the work is done! -> Notify the ControllerView
			/* and any other mounted Views
			/***************/
			calledBack = false;
			transientState = {};
			processedState = {};
	  	
	  	if(hasListeners){
				stateChangeEvent = new CustomEvent("stateChange", {"detail": appState});
			  if(nextState.notify){
			  	//Only notify specific views
					if(Object.prototype.toString.call(nextState.notify) === '[object Array]'){
						nextState.notify.forEach(function(viewKey){
							if(viewKey === "*"){
								stateChangeHandler(appState);
							} else if(viewKey in listeners){
								listeners[viewKey].dispatchEvent(stateChangeEvent);
							}
						});
					} else {
						if(nextState.notify === "*"){
							stateChangeHandler(appState);
						} else if(nextState.notify in listeners){
							listeners[nextState.notify].dispatchEvent(stateChangeEvent);
						}
					}
				} else {
					// Notify all the views
			    stateChangeHandler(appState);
			    for(var k in listeners){
			  		if(listeners.hasOwnProperty(k)){
			  			listeners[k].dispatchEvent(stateChangeEvent);
			  		}
			  	}
				}
				stateChangeEvent = void(0);
			} else {
				stateChangeHandler(appState);
			}
		};
		/***************/
		/* Initialize Application Data Context
		/***************/
	  try {
	  	ApplicationDataContext = controllerViewModel.call(this, appStateChangeHandler.bind(this, appNamespace));
	  	appState = new ApplicationDataContext(void(0), void(0), void(0), enableUndo, routingEnabled);
	    appState.state = appState.state || {};
	  } catch (e) { 
	  	if (e instanceof TypeError) {
	    	throw new TypeError('Please assign a ControllerViewModel to the "controllerViewModel" prop in React.renderComponent');
	  	} else {
	  		throw e;
	  	}
	  }

		domain = appState.constructor.originalSpec.getViewModels();
		delete appState.constructor.originalSpec.getViewModels;

		//Initialize all dataContexts
		for(viewModel in domain){
			if(domain.hasOwnProperty(viewModel)){
				dataContexts[viewModel] = domain[viewModel].call(this, appStateChangeHandler.bind(this, viewModel));
				appState.state[viewModel] = new dataContexts[viewModel](appState.state[viewModel], true);
	    }
	  }

	  //Store links
		for(viewModel in domain){
			if(domain.hasOwnProperty(viewModel)){
				if('getWatchedState' in appState[viewModel].constructor.originalSpec){
					watchedState = appState[viewModel].constructor.originalSpec.getWatchedState();
					for(watchedItem in watchedState){
						if(watchedState.hasOwnProperty(watchedItem)){
							if(watchedItem in domain || watchedItem in appState){
								if('alias' in watchedState[watchedItem]){
									if(!(viewModel in links)){
										links[viewModel] = {};
									}
									links[viewModel][watchedItem] = watchedState[watchedItem].alias;

									if(!(watchedItem in domain)){
										if(!(appNamespace in links)){
											links[appNamespace] = {};
										}
										if(!(viewModel in links[appNamespace])){
											links[appNamespace][watchedItem] = {};
										}
										links[appNamespace][watchedItem][viewModel] = watchedState[watchedItem].alias;
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
						appState[viewModel].state[links[viewModel][link]] = appState[link];
				  }
				}
			}
		}

		//reinitialize with all data in place
		for(viewModel in domain){
			if(domain.hasOwnProperty(viewModel)){
				appState.state[viewModel] =
					new dataContexts[viewModel](appState.state[viewModel]);

				if('getRoutes' in appState[viewModel].constructor.originalSpec){
					routeHash = appState[viewModel].constructor.originalSpec.getRoutes();
					for(routePath in routeHash){
						if(routeHash.hasOwnProperty(routePath)){
							routeMapping[routeHash[routePath].path] = routeHash[routePath].handler;
							page(routeHash[routePath].path, function(dataContextName, route,
									pathKey, ctx){
								external = true;
								if(!internal) {
									if(appState.canRevert && appState.pageNotFound){
	                  ctx.rollbackRequest = true;
										ctx.revert = function(){
	                    this.revert.bind(this);
	                    this.setState({},{path:ctx.path});
	                  }.bind(appState);
	                }
									routeMapping[route].call(appState[dataContextName], ctx.params,
									ctx.path, pathKey, ctx, appState.transitionTo.bind(appState));
								}
								internal = false;
							}.bind(this, viewModel, routeHash[routePath].path, routePath));
						}
					}
					delete appState[viewModel].constructor.originalSpec.getRoutes;
	    	}

				if('getViews' in appState[viewModel].constructor.originalSpec){
					animationEnabled = true;
					viewHash = appState[viewModel].constructor.originalSpec.getViews();
					for(view in viewHash){
						if(viewHash.hasOwnProperty(view)){
							viewPath = ('path' in viewHash[view]) ? viewHash[view].path : void(0);
							viewMapping[(viewHash[view].viewDisplay || viewModel) + "." + view] = {
								viewKey: (viewHash[view].viewDisplay || viewModel) + "." + view,
								viewContext: viewModel,
								viewDisplay: (viewHash[view].viewDisplay || viewModel),
								viewName: view,
								component: viewHash[view].component,
								viewPath: ('path' in viewHash[view]) ? viewHash[view].path : void(0),
								pathIsFunc: (viewPath && typeof viewPath === 'function'),
								displayIn: viewHash[view].displayIn,
					      displayOut: viewHash[view].displayOut,
					      itemIn: viewHash[view].itemIn,
					      itemOut: viewHash[view].itemOut
							};
						}
					}
					delete appState[viewModel].constructor.originalSpec.getViews;
				}
			}
	  }

		if('getViews' in appState.constructor.originalSpec){
			animationEnabled = true;
			viewHash = appState.constructor.originalSpec.getViews();
			for(view in viewHash){
				if(viewHash.hasOwnProperty(view)){
					viewPath = ('path' in viewHash[view]) ? viewHash[view].path : void(0);
					viewMapping[(viewHash[view].viewDisplay || defaultAppViewDisplay) + "." + view] = {
						viewKey: (viewHash[view].viewDisplay || defaultAppViewDisplay) + "." + view,
						viewDisplay: (viewHash[view].viewDisplay || defaultAppViewDisplay),
						viewName: view,
						component: viewHash[view].component,
						viewPath: ('path' in viewHash[view]) ? viewHash[view].path : void(0),
						pathIsFunc: (viewPath && typeof viewPath === 'function'),
						displayIn: viewHash[view].displayIn,
			      displayOut: viewHash[view].displayOut,
			      itemIn: viewHash[view].itemIn,
			      itemOut: viewHash[view].itemOut
					};
				}
			}
			delete appState.constructor.originalSpec.getViews;
		}
		
	  if(animationEnabled){
	  	appState.addViews(viewMapping);
			viewMapping = void(0);
	  }
		delete appState.__proto__.addViews;

		if('getDefaultTransitions' in appState.constructor.originalSpec){
			appState.addTransitions(appState.constructor.originalSpec.getDefaultTransitions());
			delete appState.constructor.originalSpec.getDefaultTransitions;
		}
		delete appState.__proto__.addTransitions;

		appState = new ApplicationDataContext(appState, void(0), void(0),
				enableUndo, routingEnabled);

		if(routingEnabled){
			//Setup 'pageNotFound' route
			page(function(ctx){
				external = true;
				appState.setState({'pageNotFound':true});
				internal = false;
			});
			//Initilize first path
			internal = true;
			page.replace(appState.path);
			page.start({click: false, dispatch: false});
			external = false;
		}

		hasStatic = appState.constructor.originalSpec.__processedSpec__.hasStatic;
		if(hasStatic){
			staticState = updateStatic(appState.constructor.originalSpec.__processedSpec__.statics, appState.state);
		}

		if('dataContextWillInitialize' in appState.constructor.originalSpec){
			appState.constructor.originalSpec.dataContextWillInitialize.call(appState);
			delete appState.constructor.originalSpec.dataContextWillInitialize;
		}

	  for(viewModel in domain){
			if(domain.hasOwnProperty(viewModel)){
				if('dataContextWillInitialize' in appState[viewModel].constructor.originalSpec){
					appState[viewModel].constructor.originalSpec.dataContextWillInitialize.call(appState[viewModel]);
					delete appState[viewModel].constructor.originalSpec.dataContextWillInitialize;
				}
			}
		}

	  Object.freeze(appState.state);
	  Object.freeze(appState);
	  return appState;
	};
	return initViewState;
})(__NAMESPACE__);

module.exports = { 
	initAppState: initAppState,
	initViewState: initViewState,
	unmountView: unmountView
}