/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

MyApp.PersonModel = (function(IMVVM){
	var Person = function (stateChangedHandler) {
		var dataContext = function(state, withContext) {

			var raiseStateChanged;

			if(typeof state === 'boolean'){
				withContext = state;
				state = {};
			} else {
				state = state || {};
				withContext = withContext === void 0 ? false : withContext;				
			}

			//Initialise defaults
			var _id = state.id || IMVVM.Utils.uuid();
			var _age;

			function _calculateAge(dob) { // dob is a date
			    var ageDate = new Date(Date.now() - dob.getTime()); // miliseconds from epoch
			    return Math.abs(ageDate.getFullYear() - 1970);
			}
			//Calculated field
			if(state.dob && state.dob.length === 10){
				_age = _calculateAge(new Date(state.dob)) + " years old";
			}
			var model = {

				/*
					This property will self distruct.
					Once 'context' is set, it deletes itself!
				*/
				context: {
					configurable: true,
					enumerable: false,
					set: function(context){
						raiseStateChanged = stateChangedHandler(context);
						delete this.context;
					}
				},

				//immutable
				id: {
					configurable: false,
					enumerable: true,
					writable: false,
					value: _id
				},

				firstName: {
					configurable: false,
					enumerable: true,
					get: function(){ return state.firstName; },
					set: function(newValue){
						var nextState = {};
						nextState.firstName = newValue.length === 0 ? void 0 : newValue;
						raiseStateChanged(this, nextState);
					}
				},

				lastName: {
					configurable: false,
					enumerable: true,
					get: function(){ return state.lastName; },
					set: function(newValue){
						var nextState = {};
						nextState.lastName = newValue.length === 0 ? void 0 : newValue;
						raiseStateChanged(this, nextState);
					}
				},
				
				fullName: {
					configurable: false,
					enumerable: false,
					get: function(){						
						if(this.lastName === void 0){
							return this.firstName;
						}
						return this.firstName + " " + this.lastName; 
					},
					set: function(newValue){
						var nextState = {};
						var nameArr = newValue.split(" ");
						var isSpace = newValue.slice(-1)[0] === " ";
						var firstname = nameArr[0];
						var lastname = nameArr.slice(1).join(" ");
						
						nextState.firstName = firstname.length === 0 ? void 0 : firstname;
						nextState.lastName = lastname.length === 0 && !isSpace ? void 0 : lastname;

						raiseStateChanged(this, nextState);
					}
				},

				occupation: {
					configurable: false,
					enumerable: true,
					get: function(){
						return state.occupation;
					},
					set: function(newValue){
						raiseStateChanged(this, {'occupation': newValue });
					}
				},
				
				dob: {
					configurable: false,
					enumerable: true,
					get: function(){
						return state.dob;
					},
					set: function(newValue){
						raiseStateChanged(this, {'dob': newValue });
					}
				},

				age: {
					configurable: false,
					enumerable: false,
					writable: false,
					value: _age
				},
				
				gender: {
					configurable: false,
					enumerable: true,
					get: function(){ return state.gender; },
					set: function(newValue){
						raiseStateChanged(this, {'gender': newValue});
					}
				},

				hobbies: {
					configurable: false,
					enumerable: true,
					//Explicitly set array to immutable
					//must ensure object is initialised before freeze
					get: function(){ return Object.freeze(state.hobbies); },
					set: function(newArray){
						raiseStateChanged(this, {'hobbies': newArray});
					}
				},

			};

			if(!withContext){
				//Automaticalle deletes this property when not needed
				delete model.context;
			}
			return Object.create(Person.prototype, model);
		};
		return dataContext;
	};
	
	Person.prototype = {
		addHobby: function(value){
			var arr = this.hobbies.slice(0);
			this.hobbies = arr.concat(value);
		}
	};

	return Person;
}(IMVVM));