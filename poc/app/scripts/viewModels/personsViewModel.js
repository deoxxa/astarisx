/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

MyApp.PersonsViewModel = (function(App, IMVVM){
  var PersonsViewModel = IMVVM.createViewModel({
  	select: function(id/*, callback*/){
			var nextState = {};
			nextState.collection = this.collection.map(function(person){
				if(person.id === id){
					nextState.selected = this.Person(person);
					return nextState.selected;
				}
				return person;
			}.bind(this));

			this.setState(nextState);
		},
		addPerson: function(value){
			var nextState = {};
			var name;

			if(value && value.length > 0){
				name = value.split(" ");
				//Cannot initialize by passing in calculated prop value
				//i.e. fullname
				nextState.selected = this.Person({
					firstName: name[0],
					lastName: name.slice(1).join(" ")
				}, true);
				nextState.collection = this.collection.slice(0);
				nextState.collection = nextState.collection.concat(nextState.selected);
				this.setState(nextState);
			}
		},
		deletePerson: function(uid){
			var nextState = {};
			nextState.collection = this.collection.filter(function(person){
				return person.id !== uid;
			});
			if(nextState.collection.length > 0){
				if (nextState.selected.id === uid){
					nextState.selected = this.Person(nextState.collection[0]);
				} else {
					nextState.selected = this.Person(nextState.selected);
				}
			} else {
				nextState.selected = void 0;
			}
			this.setState(nextState);
		},
		init: function(/*args*/){
			var nextState = {};
			nextState.collection = App.DataService.getData().map(function(state, idx){
				if ( idx === 0 ){
					nextState.selected = this.Person(state);
					return nextState.selected;
				}
				return Object.freeze(this.Person(state, false));
			}.bind(this));
			return this.DataContext(nextState);
		},
		getInitialState: function(state) {
			var _collection = state.collection || {};
			return {
				collection: Object.freeze(_collection) 
			};
		},
		personStateChangedHandler: function(viewModel) {
			return function(newState){
				var nextState = {};
				var personNextState;
				nextState.collection = viewModel.collection.map(function(person){
					if(person.id === this.state.id){
						personNextState = viewModel.extend(person, newState);
						nextState.selected = viewModel.Person(personNextState);
						return nextState.selected;
					}
					return person;
				}.bind(this));
				viewModel.setState(nextState);
			};
		},
		Person: function(someState){
			return App.PersonModel(this.personStateChangedHandler)(someState);
		},
		collection: {
	    enumerable: true,
	    //Must explicitly set array to immutable
	    //must ensure array is initialised before freeze
	    get: function(){ return this.state.collection },
	  },
		selected: {
			enumerable: true,
			get: function() { return this.state.selected; }
		},
  });
  return PersonsViewModel;
}(MyApp, IMVVM));