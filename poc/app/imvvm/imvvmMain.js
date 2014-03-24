/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var IMVVM = IMVVM || {};

IMVVM.uuid = function () {
	/*jshint bitwise:false */
	var i, random;
	var uuid = '';

	for (i = 0; i < 32; i++) {
		random = Math.random() * 16 | 0;
		if (i === 8 || i === 12 || i === 16 || i === 20) {
			uuid += '-';
		}
		uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
			.toString(16);
	}

	return uuid;
};

IMVVM.Main = (function(){
	var Main = function(applicationNamespace, appDataContext, dataContexts, stateChangedHandler/*, restArgs*/) {

		if(typeof stateChangedHandler !== 'function'){
			throw new TypeError();
		}

		var restArgs = arguments.length >= 4 ? Array.prototype.slice.call(arguments).slice(5) : void 0;
		
		var appDataContextName = applicationNamespace,
			dataContextObjs = {},
			watchedProps,
			watchList = {};

		var thisAppState = void 0;

		var extend = function () {
			var newObj = {};
			for (var i = 0; i < arguments.length; i++) {
				var obj = arguments[i];
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						newObj[key] = obj[key];
					}
				}
			}
			return newObj;
		};

		var transitionState = function(nextState, prevState, watchedDataContext){
			var processed = false,
				props,
				dependencies,
				watchedValue,
				initialize;

			prevState = prevState || {};

			if(nextState === void 0){
				initialize = true;
				nextState = {};
			}
			//Update state and dependencies
			dataContexts.forEach(function(dataContext){
				dependencies = {};
				if('dependsOn' in dataContext){
					dataContext.dependsOn.forEach(function(dependency){
						watchedValue = {};
						props = dependency.property.split('.');
						props.forEach(function(prop, idx){
							if(idx === 0){
								watchedValue = nextState[prop];
							} else {
								watchedValue = watchedValue ? watchedValue[prop] : void 0;
							}
						});
						if('alias' in dependency){
							dependencies[dependency.alias] = watchedValue;
						} else {
							dependencies[props.slice(-1)[0]] = watchedValue;
						}
					});
				}
				//Need to inject dependencies so that the state for this object can change
				//if required. Can't use appState as that is provided after the object is created
				if(initialize){
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], dependencies, prevState[dataContext.name]).init(dataContext.initArgs);
				} else {
					nextState[dataContext.name] = new dataContextObjs[dataContext.name](nextState[dataContext.name], dependencies, prevState[dataContext.name]);
				}

				if(watchedDataContext){
					if(processed && watchedDataContext.watchers.indexOf(dataContext.name) !== -1){
						var dataContext2 = dataContexts.filter(function(dc){
							return dc.name === watchedDataContext.name;
						})[0];
						dependencies = {};
						if('dependsOn' in dataContext2){
							dataContext2.dependsOn.forEach(function(dependency){
								watchedValue = {};
								props = dependency.property.split('.');
								props.forEach(function(prop, idx){
									if(idx === 0){
										watchedValue = nextState[prop];
									} else {
										watchedValue = watchedValue ? watchedValue[prop] : void 0;
									}
								});
								if('alias' in dependency){
									dependencies[dependency.alias] = watchedValue;
								} else {
									dependencies[props.slice(-1)[0]] = watchedValue;
								}
							});
						}
						nextState[dataContext2.name] = new dataContextObjs[dataContext2.name](nextState[dataContext2.name], dependencies, prevState[dataContext2.name]);
					}
					processed = processed ? processed : dataContext.name === watchedDataContext.name;
				}
			});

			return nextState;
		};

		var appStateChangedHandler = function(callerDataContext, newState, callback) {
			var appContext,
				nextState = {},
				prevState = void 0;
			var depArray = [];

			if(callerDataContext in watchList){
				var newkeys = Object.keys(newState);
				var len = newkeys.length;
				var t = [];
				var temp = {};

				//If newkeys.length === 1 do something

				for(var i= 0;i<len;i++){
					t = watchList[callerDataContext][newkeys[i]] ? t.concat(watchList[callerDataContext][newkeys[i]]) : t;
				}
				t.forEach(function(val){
					temp[val] = true;
				});
				depArray = Object.keys(temp);
			}
			var testWatch = !!depArray.length;

			//console.log(testWatch);

			var AppViewModel = !!newState ? Object.getPrototypeOf(newState).constructor.classType === "AppViewModel" : false;
			
			//Check to see if appState is a ready made state object. If so
			//pass it straight to the stateChangedHandler. If a callback was passed in
			//it would be assigned to newState
			if(AppViewModel) {
				//This means previous state has been requested
				//so set nextState to the previous state
				nextState = extend(newState);
				//revert the current appState to the previous state of the previous state
				prevState = newState.previousState;

			} else {
				if(callerDataContext !== appDataContextName){
					nextState[callerDataContext] = newState;
					nextState = extend(thisAppState, nextState);
				} else {
					//appDataContextName is calling function
					if(typeof callback === 'boolean' && callback/*Object.keys(newState).length === 0*/){ //initialise State
						nextState = extend(transitionState(), newState);
					} else {
						nextState = extend(thisAppState, newState);
					}
				}
				prevState = thisAppState;
			}

			var tempp = {};
			tempp.name = callerDataContext;
			tempp.watchers = depArray;
			// console.log('tempp.watchers');
			// console.log(tempp.watchers);
			nextState = transitionState(nextState, thisAppState, testWatch ? tempp: void 0);

			//Create a new App state context. Only pass in previous state if it is actually an ApplicationDataContext
			appContext = new ApplicationDataContext(nextState, prevState).state;
			Object.freeze(appContext);

			//All the work is done! -> Notify the View
			stateChangedHandler(appContext, callback);

			thisAppState = appContext;
			//Provided for the main app to return from init() to the View
			return appContext;
		};

		var ApplicationDataContext = appDataContext.call(this, appStateChangedHandler.bind(this, appDataContextName));

		//Initilise all the viewModels and store the data context Objects
		dataContexts.forEach(function(dataContext){

			dataContextObjs[dataContext.name] = dataContext.viewModel.call(this, appStateChangedHandler.bind(this, dataContext.name));

			//Store dependent's data context names for later use in updateDependencies
			//Only store names of viewModels and not of the Application ViewModel
			//because the latest Application ViewModel props are always available to all ViewModels
			if('dependsOn' in dataContext){
				//subscribers = {};
				for(var i = 0, len = dataContext.dependsOn.length; i < len; i++){
					watchedProps = dataContext.dependsOn[i].property.split('.');
					if(watchedProps.length > 1){
						//subscribers[watchedProps[0]] = true;

						
						watchList[watchedProps[0]] = watchList[watchedProps[0]] || {};
						watchList[watchedProps[0]][watchedProps[1]] = watchList[watchedProps[0]][watchedProps[1]] || [];
						if(watchList[watchedProps[0]][watchedProps[1]].indexOf(dataContext.name) === -1){
							watchList[watchedProps[0]][watchedProps[1]].push(dataContext.name);
						}
						




					}
				}
				// console.log('watchList');
				// console.log(watchList);
				// subscribersList = Object.keys(subscribers);
				// if(subscribersList.length > 0){
				// 	dataContext.watchers = subscribersList;
				// }
			}
			//console.log(subscribersList);
		});
		return new ApplicationDataContext().init(restArgs);
	};
	return Main;
}());