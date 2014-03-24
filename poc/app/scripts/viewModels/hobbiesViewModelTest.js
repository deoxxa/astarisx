/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};
var IMVVM = IMVVM || {};


IMVVM.createViewModel = function(func, func2){
	var viewModel = function (stateChangedHandler, DataService, PersonModel) {

		
		


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
		
		func.prototype.extend = extend;
		func.prototype.raiseStateChanged = stateChangedHandler;
			

		return function(state, watchedProps, raiseWatchedStateChanged) {

			// console.log('state');
			// console.log(state);

			// console.log('watchedProps');
			// console.log(watchedProps);

			watchedProps = watchedProps || {};
			var watchedStateChanged = false;
			if(state && watchedProps){
				var _selected = state.selected;
				var _selectedPerson = watchedProps.selectedPerson ? watchedProps.selectedPerson : {};
				var _hobbies = watchedProps.selectedPerson ? watchedProps.selectedPerson.hobbies : [];
				var watchedStateChanged = false;
				//Reset selected item if a new Person is selected
				if(state.selectedPerson && state.selectedPerson.id !== _selectedPerson.id && _selected !== void 0){
					_selected = void 0;
					watchedStateChanged = true;
				}
			}

			var dataContext = func(state, watchedProps);
			if(DataService !== void 0){

				// console.log(func2);
				// console.log(PersonModel);
				func.prototype.DataService = DataService;
				func.prototype.Person = PersonModel(func2);
			}

			Object.defineProperty(dataContext, 'appContext', {
				configurable: true,
				enumerable: false,
				set: function(context){
					func.prototype.appState = context;
					delete this.appContext;
				}
			});
			
			//Call this at the end so that it is not called multiple times
			if(watchedStateChanged){
				raiseWatchedStateChanged(dataContext);
				//check if I need to do this for memory leaks ???
				raiseWatchedStateChanged = null;
			}
			return dataContext;
		}
	}
	return viewModel;
}

var DataContext = function(state, watchedProps) {

	state = state || {};
	watchedProps = watchedProps || {};
	
	var _selected = state.selected;
	var _selectedPerson = watchedProps.selectedPerson ? watchedProps.selectedPerson : {};
	var _hobbies = watchedProps.selectedPerson ? watchedProps.selectedPerson.hobbies : [];
	var watchedStateChanged = false;
	//Reset selected item if a new Person is selected
	if(state.selectedPerson && state.selectedPerson.id !== _selectedPerson.id && _selected !== void 0){
		_selected = void 0;
	}

	var dataContext = Object.create(DataContext.prototype, {

		collectionItems: { 
			configurable: false,
			enumerable: false,
			writable: false, 
			value: _hobbies
		},

		selectedPerson: { 
			configurable: false,
			enumerable: true, //only need to make deps enum === true if you need it in this PM...see reset above
			writable: false, 
			value: _selectedPerson
		},

		selected: {
			configurable: false,
			enumerable: true,
			writable: false,
			value: _selected
		},

	});

	//Need to freeze arrays
	return dataContext;
};

DataContext.prototype = {
	select: function(value){
		var nextState = this.extend(this);
		nextState.selected = this.collectionItems.filter(function(hobby){
			return hobby === value;
		})[0];
		this.raiseStateChanged(this.appState, nextState);
	},
	addHobby: function(value){
		this.selectedPerson.addHobby(value);
	},
	deleteHobby: function(value){
		this.selectedPerson.deleteHobby(value);
	},
	init: function(/*args*/){
		return new DataContext();
	},
};

MyApp.HobbiesViewModel = (function(IMVVM){ 
	var HobbiesViewModel = IMVVM.createViewModel(DataContext);
	return HobbiesViewModel;
}(IMVVM));


// MyApp.HobbiesViewModel = (function(){ 
// 	var HobbiesViewModel = function(stateChangedHandler/*, injected dependencies */){
		
// 		var raiseStateChanged = stateChangedHandler;
// 		var appState = void 0;

// 		var DataContext = function(state, dependencies, raiseWatchedStateChanged) {
			
// 			state = state || {};
// 			dependencies = dependencies || {};
			
// 			var _selected = state.selected;
// 			var _selectedPerson = dependencies.selectedPerson ? dependencies.selectedPerson : {};
// 			var _hobbies = dependencies.selectedPerson ? dependencies.selectedPerson.hobbies : [];
// 			var watchedStateChanged = false;
// 			//Reset selected item if a new Person is selected
// 			if(state.selectedPerson && state.selectedPerson.id !== _selectedPerson.id && _selected !== void 0){
// 				_selected = void 0;
// 				watchedStateChanged = true;
// 			}

// 			var dataContext = Object.create(DataContext.prototype, {

// 				appContext : {
// 					configurable: true,
// 					enumerable: false,
// 					set: function(context){
// 						appState = context;
// 						delete this.appContext;
// 					}
// 				},

// 				collectionItems: { 
// 					configurable: false,
// 					enumerable: false,
// 					writable: false, 
// 					value: _hobbies
// 				},

// 				// selectedPersonId: { 
// 				// 	configurable: false,
// 				// 	enumerable: true, //only need to make deps enum === true if you need it in this PM...see reset above
// 				// 	writable: false, 
// 				// 	value: _selectedPerson.id
// 				// },
				
// 				selectedPerson: { 
// 					configurable: false,
// 					enumerable: true, //only need to make deps enum === true if you need it in this PM...see reset above
// 					writable: false, 
// 					value: _selectedPerson
// 				},

// 				selected: {
// 					configurable: false,
// 					enumerable: true,
// 					writable: false,
// 					value: _selected
// 				},

// 			});

// 			//Need to freeze arrays

// 			//Call this at the end so that it is not called multiple times
// 			if(watchedStateChanged){
// 				raiseWatchedStateChanged(dataContext);
// 				//check if I need to do this for memory leaks ???
// 				raiseWatchedStateChanged = null;
// 			}
// 			return dataContext;
// 		};

// 		DataContext.prototype = {
// 			select: function(value){
// 				var nextState = this.extend(this);
// 				nextState.selected = this.collectionItems.filter(function(hobby){
// 					return hobby === value;
// 				})[0];
// 				raiseStateChanged(appState, nextState);
// 			},
// 			addHobby: function(value){
// 				this.selectedPerson.addHobby(value);
// 			},
// 			deleteHobby: function(value){
// 				this.selectedPerson.deleteHobby(value);
// 			},
// 			init: function(/*args*/){
// 				return new DataContext();
// 			},
// 		};
// 		return DataContext;
// 	};
// 	return HobbiesViewModel;
// }());