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

	  getInitialState: function(state, prevState){
	    var _hobbies = state.hobbies || [];

	    return { 
	      id: state.id ? state.id : uuid(),
	      age: this.calculateAge(state.dob),
	      hobbies: Object.freeze(_hobbies) //freeze arrays to make them immutable ->
	      //do that here and not in prop get call otherwise everytime get() is called Object.freeze is called
	    }
	  },

	  //immutable
	  id: {
	    get: function(){
	      return this.state.id;
	    }
	  },

	  firstName: {
	    get: function(){ return this.state.firstName; },
	    set: function(newValue){
	      var nextState = {};
	      nextState.firstName = newValue.length === 0 ? void 0 : newValue;
	      this.setState(nextState);
	    }
	  },

	  lastName: {
	    get: function(){ return this.state.lastName; },
	    set: function(newValue){
	      var nextState = {};
	      nextState.lastName = newValue.length === 0 ? void 0 : newValue;
	      this.setState(nextState);
	    }
	  },
	  
	  fullName: {
	    enumerable: false, //calculated fields should set enumerable to false
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

	      this.setState(nextState);
	    }
	  },

	  occupation: {
	    get: function(){
	      return this.state.occupation;
	    },
	    set: function(newValue){
	      this.setState({'occupation': newValue });
	    }
	  },
	  
	  dob: {
	    get: function(){
	      return this.state.dob;
	    },
	    set: function(newValue){
	      var nextState = {};
	      if(newValue.length === 10){
	        nextState.age = this.calculateAge(newValue);
	      }
	      nextState.dob = newValue;
	      this.setState(nextState);
	    }
	  },
	  
	  //Calculated field -> dob
	  age: {
	    get: function(){
	      return this.state.age;
	    }
	  },
	  
	  gender: {
	    get: function(){ return this.state.gender; },
	    set: function(newValue){
	      this.setState({'gender': newValue});
	    }
	  },

	  hobbies: {
	    //Must explicitly freeze array Object to make immutable
	    get: function(){ return this.state.hobbies },
	    set: function(newArray){
	      this.setState({'hobbies': newArray});
	    }
	  },
	});

	return PersonModel;
}(IMVVM));