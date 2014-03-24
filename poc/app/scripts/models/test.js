/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var MyApp = MyApp || {};
var IMVVM = IMVVM || {};


IMVVM.createModel = function(func){
	var model = function (stateChangedHandler) {
		return function(state, withContext){
			var dataContext = func(state);
			if(typeof state === 'boolean'){
				withContext = state;
				state = {};
			} else {
				state = state || {};
				//When creating an Object, withContext default is true
				withContext = withContext === void 0 ? true : withContext;
			}
			if(withContext){
				Object.defineProperty(dataContext, 'context', {
					configurable: true,
					enumerable: false,
					set: function(context){
						this.raiseStateChanged = stateChangedHandler(context);
						//Automatically delete this property when set
						delete this.context;
					}
				});
			}
			return dataContext;
		}
	}
	return model;
}

MyApp.PersonModel = (function(IMVVM){
	var PersonModel = IMVVM.createModel(function(state) {
		//Initialise defaults
		var _id = state.id || IMVVM.uuid();
		var _age;
		var _hobbies = state.hobbies || [];

		function _calculateAge(dob) { // dob is a date
		    var ageDate = new Date(Date.now() - dob.getTime()); // miliseconds from epoch
		    return Math.abs(ageDate.getFullYear() - 1970);
		}
		//Calculated field
		if(state.dob && state.dob.length === 10){
			_age = _calculateAge(new Date(state.dob)) + " years old";
		}
		var model = {

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
					this.raiseStateChanged(this, nextState);
				}
			},

			lastName: {
				configurable: false,
				enumerable: true,
				get: function(){ return state.lastName; },
				set: function(newValue){
					var nextState = {};
					nextState.lastName = newValue.length === 0 ? void 0 : newValue;
					this.raiseStateChanged(this, nextState);
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

					this.raiseStateChanged(this, nextState);
				}
			},

			occupation: {
				configurable: false,
				enumerable: true,
				get: function(){
					return state.occupation;
				},
				set: function(newValue){
					this.raiseStateChanged(this, {'occupation': newValue });
				}
			},
			
			dob: {
				configurable: false,
				enumerable: true,
				get: function(){
					return state.dob;
				},
				set: function(newValue){
					this.raiseStateChanged(this, {'dob': newValue });
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
					this.raiseStateChanged(this, {'gender': newValue});
				}
			},

			hobbies: {
				configurable: false,
				enumerable: true,
				//Explicitly set array to immutable
				//must ensure object is initialised before freeze
				get: function(){ return _hobbies },
				set: function(newArray){
					this.raiseStateChanged(this, {'hobbies': newArray});
				}
			},

		};

		Object.freeze(model.hobbies);
		return Object.create(PersonModel.prototype, model);
	});
	
	PersonModel.prototype = {
		addHobby: function(value){
			var arr;
			if(this.hobbies.indexOf(value) === -1){
				arr = this.hobbies.slice(0);
				this.hobbies = arr.concat(value);
			}
		},
		deleteHobby: function(value){
			this.hobbies = this.hobbies.filter(function(hobby){
				return hobby !== value;
			});
		}
	};

	return PersonModel;
}(IMVVM));