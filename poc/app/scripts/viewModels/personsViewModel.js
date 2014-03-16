/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};

var PersonModel = tempIMVVM.createModel(testSpec);

MyApp.PersonsViewModel = (function(){
	var PersonsViewModel = function(stateChangedHandler, DataService/*, PersonModel*/) {
		
		var raiseStateChanged = stateChangedHandler;
		var appState = void 0;

		/* private methods */
		function personStateChangedHandler(context) {
			return function(oldState, newState){





				var nextState = context.extend(context);
				var personNextState;
				nextState.collection = nextState.collection.map(function(person){
					if(person.id === oldState.id){
						personNextState = context.extend(person, newState);
						nextState.selected = Person(personNextState);
						return nextState.selected;
					}
					return person;
				});
				raiseStateChanged(appState, nextState);
			};
		}

		var Person = PersonModel(personStateChangedHandler);

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
				var nextState = this.extend(this);
				nextState.collection = nextState.collection.map(function(person){
					if(person.id === id){
						nextState.selected = Person(person);
						return nextState.selected;
					}
					return person;
				});
				raiseStateChanged(appState, nextState);
			},
			addPerson: function(value){
				var nextState = this.extend(this);
				var name;

				if(value && value.length > 0){
					name = value.split(" ");
					//Cannot initialize by passing in calculated prop value
					//i.e. fullname
					nextState.selected = Person({
						firstName: name[0],
						lastName: name.slice(1).join(" ")
					}, true);
					nextState.collection = nextState.collection.slice(0);
					nextState.collection = nextState.collection.concat(nextState.selected);
					raiseStateChanged(appState, nextState);
				}
			},
			deletePerson: function(uid){
				var nextState = this.extend(this);
				
				nextState.collection = nextState.collection.filter(function(person){
					return person.id !== uid;
				});
				if(nextState.collection.length > 0){
					if (nextState.selected.id === uid){
						nextState.selected = Person(nextState.collection[0]);
					} else {
						nextState.selected = Person(nextState.selected);
					}
				} else {
					nextState.selected = void 0;
				}
				raiseStateChanged(appState, nextState);
			},
			init: function(/*args*/){
				var nextState = {};
				nextState.collection = DataService.getData().map(function(state, idx){
					if ( idx === 0 ){
						nextState.selected = Person(state);
						return nextState.selected;
					}
					return Person(state, false);
				});

				console.log('nextState');
				console.log(nextState);


				return new DataContext(nextState);
			}
		};
		return DataContext;
	};
	return PersonsViewModel;
}());