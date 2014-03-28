/*jshint camelcase:false */
/* global IMVVM */

'use strict';

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
			});
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
		nextState.selected = void 0;
		if(nextState.collection.length > 0){
			if (this.selected.id === uid){
				nextState.selected = this.Person(nextState.collection[0]);
			} else {
				nextState.selected = this.Person(this.selected);
			}
		}
		this.setState(nextState);
	},

	init: function(/*args*/){
		var nextState = {};
		nextState.collection = DataService.getData().map(function(person, idx){
			if (idx === 0){
				nextState.selected = this.Person(person);
				return nextState.selected;
			}
			return this.Person(person, false);
		}.bind(this));
		return this.DataContext(nextState);
	},

	personStateChangedHandler: function(nextState, prevState/*, callback*/){
		var persons = {};
		persons.collection = this.collection.map(function(person){
			if(person.id === prevState.id){
				persons.selected = this.Person(nextState);
				return persons.selected;
			}
			return person;
		}.bind(this));
		this.setState(persons);
	},

	Person: function(){
		return PersonModel(this.personStateChangedHandler).apply(this, arguments);
	},

	collection: {
    get: function(){ return this.state.collection; },
  },

	selected: {
		get: function() { return this.state.selected; }
	},

});
