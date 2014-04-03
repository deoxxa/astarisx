/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({
  getDependencies: function(){
    return {
      _selectedPerson: { 
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
    this.state._selectedPerson.addHobby(value);
  },
  
  deleteHobby: function(value){
    this.state._selectedPerson.deleteHobby(value);
  },

  //When a dependency changes reset the selected hobby to undefined

  resetSelected: function(newValue) {
    console.log('newValue');
    console.log(newValue);

    console.log('prevState');
    console.log(this);

    if(this.selected !== void(0)){
      return {selected: void(0)};
    }
  },

  hobbies: {
    pseudo: true, //true because its not calculated but is supplied externally
    get: function(){
      return this.state._selectedPerson.hobbies;
    }
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
