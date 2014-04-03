/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({
  getDependencies: function(){
    return {
      selectedPerson: { 
        property: 'persons.selected', 
        //onStateChange: 
      },
      busy: 'busy'
    }
  },
  select: function(value){
    var nextState = {};
    nextState.selected = this.hobbies.filter(function(hobby){
      return hobby === value;
    })[0];
    this.setState(nextState);
  },
  
  addHobby: function(value){
    this.state.selectedPerson.addHobby(value);
  },
  
  deleteHobby: function(value){
    this.state.selectedPerson.deleteHobby(value);
  },

  //When a dependency changes reset the selected hobby to undefined
  resetSelected: function(nextState, prevState) {
    if(prevState.selectedPerson && nextState.selectedPerson){
      if(nextState.selectedPerson.id !== prevState.selectedPerson.id &&
        nextState.selected !== void(0)){
        return void(0);
      }
    }
    return nextState.selected;
  },

  hobbies: {
    pseudo: true, //true because its not calculated but is supplied externally
    get: function(){
      return this.state.selectedPerson.hobbies;
    }
  },
  
  //runs everytime transition to state occurs
  getValidState: function(nextState, prevState){
    return {
      selected: this.resetSelected(nextState, prevState),
    };
  },

  busyText: {
    pseudo: true, //true because its not calculated but is supplied externally
    get: function(){
      return this.state.busy ? 'Im Busy! Go away...' : 'Not doing too much.';
    }
  },

  selected: {
    get: function(){
      return this.state.selected;
    }
  },
});
