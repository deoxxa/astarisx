/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

MyApp.ApplicationViewModel = (function(IMVVM){
	
	var ApplicationViewModel = function(stateChangedHandler){
		
		var raiseStateChanged = stateChangedHandler;
		var extend = IMVVM.Utils.extend;

		var DataContext = function (state, prevState) {

			state = state || {};
			prevState = prevState || void 0;

			
			//var appDataContext = {};
			var _busy = state.busy === void 0 ? false : state.busy;
			var _online = state.online === void 0 ? false : state.online;

			var appDataContext = Object.create(DataContext.prototype, {
				previousState: { 
					configurable: false,
					enumerable: false,
					writable: false,
					value: prevState
				},
				/* 
					Does not need to be enumerable as the state for this is
					stored and set in applicationDataContext which will never change
				*/
				appName: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: state.appName
				},

				canUndo: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: !!prevState
				},

				busy: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: _busy
				},

				online: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: _online
				},

			});
			//create the next appState data context
			for(var k in state){
				if(state.hasOwnProperty(k)){
					if(Object.prototype.toString.call(state[k]) === '[object Object]' && 
						('appContext' in state[k])){
						appDataContext[k] = state[k];
						appDataContext[k].appContext = appDataContext;
						Object.freeze(appDataContext[k]);
					}
				}
			}

			return Object.freeze(appDataContext);
		};

		DataContext.prototype = {
			init: function(args){
				//Call transitionState with no params to initialize state 
				//and pass returned state to appState arg of raiseStateChanged
				//then more work will be done before returning with the new AppState
				//pass in any initial appState as second arg
				return raiseStateChanged({}, extend(args[0],{online: true }));
			}
		};
		
		return DataContext;
	};
	return ApplicationViewModel;
}(IMVVM));