/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({
  getDependencies: function(){
    return {
      selectedPerson: { 
        property: 'persons.selected', 
        onStateChange: this.resetSelected
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
    console.log('nextState');
    console.log(nextState);
    console.log('prevState');
    console.log(prevState);
    return {selected: void(0)};
  },

  hobbies: {
    pseudo: true, //true because its not calculated but is supplied externally
    get: function(){
      return this.state.selectedPerson.hobbies;
    }
  },
  
  //runs everytime transition to state occurs
  // getValidState: function(nextState, prevState){
  //   return {
  //     selected: this.resetSelected(nextState, prevState),
  //   };
  // },

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
