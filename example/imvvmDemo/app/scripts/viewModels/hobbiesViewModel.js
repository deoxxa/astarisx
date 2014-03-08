/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

MyApp.HobbiesViewModel = (function(Utils){ 
	
	var HobbiesViewModel = function(stateChangedHandler){
		
		var extend = Utils.extend;
		var raiseStateChanged = stateChangedHandler;
		var appState = void 0;

		var DataContext = function(state, dependencies, raiseDependencyStateChanged) {
			
			state = state || {};
			dependencies = dependencies || {};
			
			var _selected = state.selected;
			var _selectedPerson = dependencies.selectedPerson ? dependencies.selectedPerson : {};
			var _hobbies = dependencies.selectedPerson ? dependencies.selectedPerson.hobbies : [];
			var dependencyStateChanged = false;
			//Reset selected item if a new Person is selected
			if(state.selectedPerson && state.selectedPerson.id !== _selectedPerson.id && _selected !== void 0){
				_selected = void 0;
				dependencyStateChanged = true;
			}

			var dataContext = Object.create(DataContext.prototype, {

				appContext : {
					configurable: true,
					enumerable: false,
					set: function(context){
						appState = context;
						delete this.appContext;
					}
				},

				collectionItems: { 
					configurable: false,
					enumerable: false,
					writable: false, 
					value: _hobbies
				},

				// selectedPersonId: { 
				// 	configurable: false,
				// 	enumerable: true, //only need to make deps enum === true if you need it in this PM...see reset above
				// 	writable: false, 
				// 	value: _selectedPerson.id
				// },
				
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

			//Call this at the end so that it is not called multiple times
			if(dependencyStateChanged){
				raiseDependencyStateChanged(dataContext);
				//check if I need to do this for memory leaks ???
				raiseDependencyStateChanged = null;
			}
			return dataContext;
		};

		DataContext.prototype = {
			select: function(value){
				var nextState = extend(this);
				nextState.selected = this.collectionItems.filter(function(hobby){
					return hobby === value;
				})[0];
				raiseStateChanged(appState, nextState);
			},
			addHobby: function(/*value*/){
				this.selectedPerson.addHobby("test");
			},
			init: function(/*args*/){
				return new DataContext();
			},
		};
		return DataContext;
	};
	return HobbiesViewModel;
}(IMVVM.Utils));