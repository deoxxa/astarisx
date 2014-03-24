/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

'use strict';

var MyApp = MyApp || {};
var IMVVM = IMVVM || {};

MyApp.PersonModel = (function(IMVVM){
	var PersonModel = IMVVM.createModel({
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
	  },

	  calculateAge: function(dob) { // dob is a date
	      var DOB = new Date(dob);
	      var ageDate = new Date(Date.now() - DOB.getTime()); // miliseconds from epoch
	      return Math.abs(ageDate.getFullYear() - 1970) + " years old";
	  },

	  //May need to rename this - also in IMVVMModelInterface
	  initialiseState: function(state, prevState){
	    return { 
	      id: state.id ? state.id : uuid(),
	      age: this.calculateAge(state.dob),
	      hobbies: state.hobbies || []
	    }
	  },

	  //immutable
	  id: {
	    enumerable: true,
	    get: function(){
	      return this.state.id;
	    }
	  },

	  firstName: {
	    enumerable: true,
	    get: function(){ return this.state.firstName; },
	    set: function(newValue){
	      var nextState = {};
	      nextState.firstName = newValue.length === 0 ? void 0 : newValue;
	      this.raiseStateChanged(nextState);
	    }
	  },

	  lastName: {
	    enumerable: true,
	    get: function(){ return this.state.lastName; },
	    set: function(newValue){
	      var nextState = {};
	      nextState.lastName = newValue.length === 0 ? void 0 : newValue;
	      this.raiseStateChanged(nextState);
	    }
	  },
	  
	  fullName: {
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

	      this.raiseStateChanged(nextState);
	    }
	  },

	  occupation: {
	    enumerable: true,
	    get: function(){
	      return this.state.occupation;
	    },
	    set: function(newValue){
	      this.raiseStateChanged({'occupation': newValue });
	    }
	  },
	  
	  dob: {
	    enumerable: true,
	    get: function(){
	      return this.state.dob;
	    },
	    set: function(newValue){
	      var nextState = {};
	      if(newValue.length === 10){
	        nextState.age = this.calculateAge(newValue);
	      }
	      nextState.dob = newValue;
	      this.raiseStateChanged(nextState);
	    }
	  },
	  
	  //Calculated field -> dob
	  age: {
	    enumerable: true,
	    get: function(){
	      return this.state.age;
	    }
	  },
	  
	  gender: {
	    enumerable: true,
	    get: function(){ return this.state.gender; },
	    set: function(newValue){
	      this.raiseStateChanged({'gender': newValue});
	    }
	  },

	  hobbies: {
	    enumerable: true,
	    //Must explicitly set array to immutable
	    //must ensure array is initialised before freeze
	    get: function(){ return this.state.hobbies },
	    set: function(newArray){
	      this.raiseStateChanged({'hobbies': newArray});
	    }
	  },
	});

	return PersonModel;
}(IMVVM));