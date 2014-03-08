/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

/* PersonsViewModel*/
MyApp.PersonsViewModel = (function(Utils, DataService, PersonModel){
	var PersonsViewModel = function(stateChangedHandler) {
		
		var Person;
		var raiseStateChanged = stateChangedHandler;
		var appState = void 0;
		var extend = Utils.extend;

		/* private methods */
		function onStateChanged(dataContext) {
			return function(oldState, newState){				
				var nextState = Utils.extend(dataContext);
				var personNextState;
				nextState.collection = nextState.collection.map(function(person){
					if(person.id === oldState.id){
						personNextState = extend(person, newState);
						nextState.selected = Person(personNextState, true);
						return nextState.selected;
					}
					return person;
				});
				raiseStateChanged(appState, nextState);
			};
		}

		Person = PersonModel(onStateChanged);

		var DataContext = function(state, dependencies/*, raiseDependencyStateChanged*/) {

			state = state || {};
			dependencies = dependencies || {};
			
			var _collection = state.collection || [];

			var dataContext = Object.create(DataContext.prototype, {
				/*
					Make all required fields enumerable and any fields
					that are depended upon by other viewModels. Calculated fields
					and dependent fields should not be enumerable. A dependent field will
					need to be enum === true if it is used in the state object. See reset in hobbiesModel.
				*/

				//required - self destruct
				appContext : {
					configurable: true,
					enumerable: false, //Do not want this to persist during state transition
					set: function(context){
						appState = context;
						delete this.appContext;
					}
				},

				collection: {
					configurable: false,
					enumerable: true, //This must be true to persist during state transition
					writable: false, 
					value: _collection
				},

				selected: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: state.selected
				},

				selectedHobby: {
					configurable: false,
					enumerable: false, //not required to be true because it is dependent
					writable: false,
					value: dependencies.selectedHobby
				},

				imOnline: {
					configurable: false,
					enumerable: false, //not required to be true because it is dependent
					writable: false,
					value: dependencies.online
				},
			});

			//specify the dataContext 'context' for notifications
			if(dataContext.selected && ('context' in dataContext.selected)){
				dataContext.selected.context = dataContext;	
				Object.freeze(dataContext.selected);
			}
			if(dataContext.collection){
				Object.freeze(dataContext.collection);
			}
			return dataContext;
		};

		DataContext.prototype = {
			select: function(id/*, callback*/){
				var nextState = Utils.extend(this);
				nextState.collection = nextState.collection.map(function(person){
					if(person.id === id){
						nextState.selected = Person(person, true);
						return nextState.selected;
					}
					return person;
				});
				raiseStateChanged(appState, nextState);
			},

			init: function(/*args*/){
				var nextState = {};
				nextState.collection = DataService.getData().map(function(state, idx){
					if ( idx === 0 ){
						nextState.selected = Person(state, true);
						return nextState.selected;
					}
					return Person(state);
				});
				return new DataContext(nextState);
			}
		};
		return DataContext;
	};
	return PersonsViewModel;
}(IMVVM.Utils, MyApp.DataService, MyApp.PersonModel));