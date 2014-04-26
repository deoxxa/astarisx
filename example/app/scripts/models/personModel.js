/*jshint unused: false */
/* global IMVVM, DataService, HobbyModel */

'use strict';

var PersonModel = (function(){
  
  var Hobby = function(){
    return new HobbyModel().apply(this, arguments);
  };
  
  var uuid = function () {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
        .toString(16);
    }
    return uuid;
  };

  var calculateAge = function(dob){ // dob is a date
    var DOB = new Date(dob);
    var ageDate = new Date(Date.now() - DOB.getTime()); // miliseconds from 
    var age = Math.abs(ageDate.getFullYear() - 1970);
    return isNaN(age) ? 'Enter your Birthday' : age + ' years old';
  };

  var personModel = IMVVM.createModel({
  
    getInitialState: function(){

      var id, hobbies = [];
      
      id = this.id || uuid();
      
      hobbies = DataService.getHobbiesData(this.id).map(function(hobby){
        return new Hobby(hobby, true);
      }.bind(this));

      return {
        age: calculateAge(this.dob),
        id: id,
        hobbies: hobbies
      };
    },

    id: {
      get: function(){
        return this.state.id;
      }
    },

    firstName: {
      get: function(){ return this.state.firstName; },
      set: function(newValue){
        var nextState = {};
        nextState.firstName = newValue.length === 0 ? void(0) : newValue;
        this.setState(nextState);
      }
    },

    lastName: {
      get: function(){ return this.state.lastName; },
      set: function(newValue){
        var nextState = {};
        nextState.lastName = newValue.length === 0 ? void(0) : newValue;
        this.setState(nextState);
      }
    },
    
    fullName: {
      kind: 'pseudo',
      get: function(){
        if(this.lastName === void(0)){
          return this.firstName;
        }
        return this.firstName + ' ' + this.lastName;
      },
      set: function(newValue){
        var nextState = {};
        var nameArr = newValue.split(' ');
        var isSpace = newValue.slice(-1)[0] === ' ';
        var firstname = nameArr[0];
        var lastname = nameArr.slice(1).join(' ');
        
        nextState.firstName = firstname.length === 0 ? void(0) : firstname;
        nextState.lastName = lastname.length === 0 && !isSpace ? void(0) : lastname;

        this.setState(nextState);
      }
    },

    occupation: {
      aliasFor: 'job',
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
          nextState.age = calculateAge(newValue);
        }
        if(newValue.length === 0){
          nextState.age = 'C\'mon. When\'s your Birthday?';
        }
        nextState.dob = newValue;
        this.setState(nextState);
      }
    },
    
    //Calculated field <- dob
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
      kind: 'array',
      get: function(){ return this.state.hobbies; },
      set: function(newArray){
        this.setState({'hobbies': newArray});
      }
    },

    addHobby: function(value){
      var arr;
      for (var i = this.hobbies.length - 1; i >= 0; i--) {
        if(this.hobbies[i].name === value.name){
          return;
        }
      }
      arr = this.hobbies.slice(0);
      this.hobbies = arr.concat(value);
    },
    
    deleteHobby: function(value){
      this.hobbies = this.hobbies.filter(function(hobby){
        return hobby.id !== value;
      });
    },

  });
  return personModel;
}());

