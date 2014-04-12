
var utils = require('./utils');
var extend = utils.extend;

exports.getInitialState = function(appNamespace, domainModel, stateChangedHandler, enableUndo) {

	if(typeof stateChangedHandler !== 'function'){
		throw new TypeError();
	}

	enableUndo === void(0) ? true : enableUndo;

	var ApplicationDataContext,
		appState = {},
		dataContexts = {},
		domain,
		links = {},
		watchedDataContexts = {},
		watchedDomainProps = {},
		hasWatchedDataContexts = false,
		hasWatchedDomainProps = false;


	var transState = {};
	var processedState = {};

	var appStateChangedHandler = function(caller, newState, newAppState, callback) {
		
		var nextState = {},
			prevState = {},
			newStateKeys;

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

			//Need to reset ViewModel with instance object so that setState is associated with
			//the current ViewModel. This reason this ccurs is that when a ViewModel is created it
			//assigns a setState function to all instance fields and binds itself to it. When undo is called
			//the data is rolled back but viewModels are not recreated and therefore the setState functions
			//are associated with outdated viewModels and returns unexpected output. So to realign the ViewModels
			//with setState we recreate them.
			for(var dc in domain){
				nextState[dc] = new dataContexts[dc](nextState);
			}

		} else {
			if(!!newStateKeys.length){
				nextState[caller] = extend(newState);
			}
			transState = extend(nextState, transState, newAppState);
			transStateKeys = Object.keys(transState);
			if(transStateKeys.length === 0){
				return;
			}


			if(typeof callback === 'function'){
				//appState = new ApplicationDataContext(nextState, prevState, enableUndo);
				//Create a new App state context.
				callback(/*caller !== appNamespace ? appState[caller] : appState*/);
				return;
			}
			var tskIdx;
			var transStateKeysLen = transStateKeys.length - 1;
			if(caller !== appNamespace){
				for (tskIdx = transStateKeysLen; tskIdx >= 0; tskIdx--) {
					if(transStateKeys[tskIdx] in domain){
						nextState[transStateKeys[tskIdx]] = extend(appState[transStateKeys[tskIdx]], transState[transStateKeys[tskIdx]]);
						nextState[transStateKeys[tskIdx]] = new dataContexts[transStateKeys[tskIdx]](nextState);
					} else {
						nextState[transStateKeys[tskIdx]] = transState[transStateKeys[tskIdx]];
					}
				};

				processedState = extend(processedState, nextState);

				//Triggers
				nextState = extend(appState, processedState);

				transState = {};
				for (tskIdx = transStateKeysLen; tskIdx >= 0; tskIdx--) {
					if(transStateKeys[tskIdx] in watchedDataContexts){
						for(var watchedField in watchedDataContexts[transStateKeys[tskIdx]]){
							if(watchedDataContexts[transStateKeys[tskIdx]].hasOwnProperty(watchedField)){
								if(newStateKeys.indexOf(watchedField) !== -1){
									var subscribers = watchedDataContexts[transStateKeys[tskIdx]][watchedField];
									for(var sub in subscribers){
										if(subscribers.hasOwnProperty(sub)){
											transState = extend(transState, subscribers[sub].call(appState[sub],
												nextState[transStateKeys[tskIdx]][watchedField],
												appState[transStateKeys[tskIdx]][watchedField], watchedField, transStateKeys[tskIdx]));
										}
									}
								}
							}
						}
					}
				};
				if(!!Object.keys(transState).length){
					//appState = extend(new ApplicationDataContext(nextState, void(0), enableUndo));
					appStateChangedHandler(caller, {}, transState);
					return;
				}
				var processedStateKeys = Object.keys(processedState);
				var processedStateKeysLen = processedStateKeys.length - 1;
				for (tskIdx = processedStateKeysLen; tskIdx >= 0; tskIdx--) {
					if(processedStateKeys[tskIdx] in links){
						for(var lo in links[processedStateKeys[tskIdx]]){
							if(links[processedStateKeys[tskIdx]].hasOwnProperty(lo)){
								nextState[processedStateKeys[tskIdx]].state[links[processedStateKeys[tskIdx]][lo]] = (lo in domain) ? nextState[lo].state : nextState[lo];
							}
							if(lo in links){
								for(var lo2 in links[lo]){
									if(links[lo].hasOwnProperty(lo2)){
										nextState[lo].state[links[lo][lo2]] = (lo2 in domain) ? nextState[lo2].state : nextState[lo2];
									}
								}
							}
						}
					}
		    }

		    

			} else {
				// var global = true;
			}


			prevState = appState;

		}

		if(!!prevState){
			Object.freeze(prevState);
		}
		

		appState = new ApplicationDataContext(nextState, prevState, enableUndo);
		Object.freeze(appState);
		Object.freeze(appState.state);
		//All the work is done! -> Notify the View
		stateChangedHandler(appState);
		
		transState = {};
		processedState = {};
		
		//Provided for the main app to return to the View
		return appState;
	};

	//Initialize Application Data Context
	ApplicationDataContext = domainModel.call(this, appStateChangedHandler.bind(this, appNamespace));
	/*Need to look at DomainViewModel state and nextState and Domain Model and updating*/
	appState = new ApplicationDataContext(void(0), void(0), enableUndo, true);
  appState.state = appState.state || {};

	domain = appState.getDomainDataContext();

	// if('linkTo' in appState){
	// 	Object.keys(appState.linkTo).forEach(function(watchedItem){
	// 		if(watchedItem in domain){
	// 			if(!(watchedItem in watchedDataContexts)){
	// 				watchedDataContexts[watchedItem] = [appNamespace]
	// 			} else {
	// 				watchedDataContexts[watchedItem].push(appNamespace);
	// 			}
	// 		}
	// 	});
	// }

	var watchedState;
	var watchedItem;
	var watchedProp;
	var tmp;
	// if('getWatchedState' in appState){
 //  	watchedState = appState.getWatchedState();
 //  	for(watchedItem in watchedState){
 //  		if(watchedState.hasOwnProperty(watchedItem)){
 //  			for(watchedProp in watchedState[watchedItem].fields){
 //  				if(watchedState[watchedItem].fields.hasOwnProperty(watchedProp)){
 //      			if(watchedItem in domain){
	// 						tmp = {};
	// 						if(!(watchedItem in watchedDataContexts)){
	// 							watchedDataContexts[watchedItem] = {};
	// 						}
	// 						tmp[watchedProp] = {};
	// 						tmp[watchedProp][appNamespace] = watchedState[watchedItem].fields[watchedProp];
	// 						watchedDataContexts[watchedItem] = tmp;							
	// 					}      					
 //  				}
 //  			}

	// 			if(watchedItem in appState.state){
	// 				if(!(watchedItem in watchedDomainProps)){
	// 					watchedDomainProps[watchedItem] = [appNamespace]
	// 				} else {
	// 					watchedDomainProps[watchedItem].push(appNamespace);
	// 				}
	// 			}

 //  		}
 //  	}
 //  }


	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			dataContexts[dataContext] = domain[dataContext].call(this, appStateChangedHandler.bind(this, dataContext)).bind(this, dataContext);
      appState.state[dataContext] = new dataContexts[dataContext](appState.state);

      if('getWatchedState' in appState[dataContext]){
      	watchedState = appState[dataContext].getWatchedState();
      	for(watchedItem in watchedState){
      		if(watchedState.hasOwnProperty(watchedItem)){
      			if(watchedItem in domain || watchedItem in appState.state){
	      			if('alias' in watchedState[watchedItem]){
		      			if(!(dataContext in links)){
		      				links[dataContext] = {};
		      			}
		      			links[dataContext][watchedItem] = watchedState[watchedItem].alias;
	      			}
	      			for(watchedProp in watchedState[watchedItem].fields){
	      				if(watchedState[watchedItem].fields.hasOwnProperty(watchedProp)){
			      			if(watchedItem in domain){
										tmp = {};
										if(!(watchedItem in watchedDataContexts)){
											watchedDataContexts[watchedItem] = {};
										}
										tmp[watchedProp] = {};
										tmp[watchedProp][dataContext] = watchedState[watchedItem].fields[watchedProp];
										watchedDataContexts[watchedItem] = tmp;
									}
	      				}
	      			}
      			} /*else if(watchedItem in appState.state){
							if('alias' in watchedState[watchedItem]){
		      			if(!(dataContext in links)){
		      				links[dataContext] = {};
		      			}
		      			links[dataContext][watchedItem] = watchedState[watchedItem].alias;
	      			}
	      			for(watchedProp in watchedState[watchedItem].fields){
	      				if(watchedState[watchedItem].fields.hasOwnProperty(watchedProp)){
			      			if(watchedItem in domain){
										tmp = {};
										if(!(watchedItem in watchedDataContexts)){
											watchedDataContexts[watchedItem] = {};
										}
										tmp[watchedProp] = {};
										tmp[watchedProp][dataContext] = watchedState[watchedItem].fields[watchedProp];
										watchedDataContexts[watchedItem] = tmp;
									}
	      				}
	      			}				
						}*/
      		}
      	}
      }
		}
	}

	for(var dataContext in domain){
		if(domain.hasOwnProperty(dataContext)){
			for(var k in links[dataContext]){
        if(links[dataContext].hasOwnProperty(k)){
          appState[dataContext].state[links[dataContext][k]] = (k in domain) ? extend(appState[k].state): appState[k];
        }
      }
		}
	}

	hasWatchedDataContexts = !!Object.keys(watchedDataContexts).length;
	hasWatchedDomainProps = !!Object.keys(watchedDomainProps).length;

	appState = new ApplicationDataContext(appState, void(0), enableUndo);
	Object.freeze(appState.state);
	Object.freeze(appState);
	return appState;
};