/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';
var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

//var PersonModel = IMVVM.createModel(PersonSpec);

/*
		//inject descriptor
		{ 
			Person: {
				args: [this.personStateChangeHandler],
				const:function(args){
					return App.PersonModel(args[0]);
				},
				prop: this.selected //This is where the context gets set - Probably should check if its an Array
			}
		},
		//watch
		watch: [{property: 'hobbies.selected', alias: 'selectedHobby'},
			{property: 'online'}],
*/

MyApp.PersonsViewModel = (function(App, IMVVM){
  var PersonsViewModel = IMVVM.createViewModel({
  	select: function(id/*, callback*/){
			var nextState = this.extend(this);
			nextState.collection = nextState.collection.map(function(person){
				if(person.id === id){
					nextState.selected = this.Person(person);
					return nextState.selected;
				}
				return person;
			}.bind(this));
			this.raiseStateChanged(nextState);
		},
		addPerson: function(value){
			var nextState = this.extend(this);
			var name;

			if(value && value.length > 0){
				name = value.split(" ");
				//Cannot initialize by passing in calculated prop value
				//i.e. fullname
				nextState.selected = this.Person({
					firstName: name[0],
					lastName: name.slice(1).join(" ")
				}, true);
				nextState.collection = nextState.collection.slice(0);
				nextState.collection = nextState.collection.concat(nextState.selected);
				this.raiseStateChanged(nextState);
			}
		},
		deletePerson: function(uid){
			var nextState = this.extend(this);
			
			nextState.collection = nextState.collection.filter(function(person){
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
			this.raiseStateChanged(nextState);
		},
		init: function(/*args*/){
			var nextState = {};
			nextState.collection = App.DataService.getData().map(function(state, idx){
				if ( idx === 0 ){
					nextState.selected = this.Person(state);
					return nextState.selected;
				}
				return this.Person(state, false);
			}.bind(this));

			return this.DataContext(nextState);
		},
		personStateChangedHandler: function(self) {
			return function(newState){
				var nextState = self.extend(self);
				var personNextState;
				nextState.collection = nextState.collection.map(function(person){
					if(person.id === this.state.id){
						personNextState = self.extend(person, newState);
						nextState.selected = self.Person(personNextState);
						return nextState.selected;
					}
					return person;
				}.bind(this));
				self.raiseStateChanged(nextState);
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

		imOnline: {
			enumerable: false, //not required to be true because it is dependent
			get: function() { return this.state.dependencies.online; }
		},

		selectedHobby: {
			enumerable: false, //not required to be true because it is dependent
			get: function() { return this.state.dependencies.selectedHobby; }
		},

  });
  return PersonsViewModel;
}(MyApp, IMVVM));