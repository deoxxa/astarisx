
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
		watchedDataContexts = {};


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

			for(var dc2 in domain){
				if(domain.hasOwnProperty(dc2)){
					for(var loo in links[dc2]){
						if(links[dc2].hasOwnProperty(loo)){
							nextState[dc2].state[links[dc2][loo]] = (loo in domain) ? extend(nextState[loo].state) : nextState[loo];
						}
					}
				}
			}

		} else {
			if(!!newStateKeys.length){
				if(caller === appNamespace){
					nextState = extend(newState);
				} else {
					nextState[caller] = extend(newState);
				}
			}
			transState = extend(nextState, transState, newAppState);
			transStateKeys = Object.keys(transState);
			if(transStateKeys.length === 0){
				return;
			}

			if(typeof callback === 'function'){
				callback();
				return;
			}
			var tskIdx;
			var transStateKeysLen = transStateKeys.length - 1;
			
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
				appStateChangedHandler(void(0), {}, transState);
				return;
			}
			//Link Phase
			var processedStateKeys = Object.keys(processedState);
			var processedStateKeysLen = processedStateKeys.length - 1;
			var tempLinks;
			var lo, lo2;
			for (tskIdx = processedStateKeysLen; tskIdx >= 0; tskIdx--) {
				if(caller === appNamespace){
					if(processedStateKeys[tskIdx] in links[appNamespace]){
						for(lo in links[appNamespace][processedStateKeys[tskIdx]]){
							if(links[appNamespace][processedStateKeys[tskIdx]].hasOwnProperty(lo)){
								nextState[lo].state[links[appNamespace][processedStateKeys[tskIdx]][lo]] = nextState[processedStateKeys[tskIdx]];
							}
							if(lo in links){
								for(lo2 in links[lo]){
									if(links[lo].hasOwnProperty(lo2)){
										nextState[lo].state[links[lo][lo2]] = (lo2 in domain) ? extend(nextState[lo2].state) : nextState[lo2];
									}
								}
							}
						}
					}
				} else {
					if(processedStateKeys[tskIdx] in links){
						for(lo in links[processedStateKeys[tskIdx]]){
							if(links[processedStateKeys[tskIdx]].hasOwnProperty(lo)){
								nextState[processedStateKeys[tskIdx]].state[links[processedStateKeys[tskIdx]][lo]] = (lo in domain) ? extend(nextState[lo].state) : nextState[lo];
							}
							if(lo in links){
								for(lo2 in links[lo]){
									if(links[lo].hasOwnProperty(lo2)){
										nextState[lo].state[links[lo][lo2]] = (lo2 in domain) ? extend(nextState[lo2].state) : nextState[lo2];
									}
								}
							}
						}
					}
				}
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

	var watchedState;
	var watchedItem;
	var watchedProp;
	var tmp;

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
      			}
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
	
	appState = new ApplicationDataContext(appState, void(0), enableUndo);
	Object.freeze(appState.state);
	Object.freeze(appState);
	return appState;
};