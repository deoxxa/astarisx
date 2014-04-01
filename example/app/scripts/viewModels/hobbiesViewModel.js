/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({
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
  resetSelected: function(nextState, prevState) {
    if(prevState._selectedPerson && nextState._selectedPerson){
      if(nextState._selectedPerson.id !== prevState._selectedPerson.id &&
        nextState.selected !== void(0)){
        return void(0);
      }
    }
    return nextState.selected;
  },

  hobbies: {
    adapter: true, //true because its not calculated but is supplied externally
    get: function(){
      return this.state._selectedPerson.hobbies;
    }
  },
  
  //runs everytime transition to state occurs
  getValidState: function(nextState, prevState){
    return {
      selected: this.resetSelected(nextState, prevState),
    };
  },

  busyText: {
    adapter: true, //true because its not calculated but is supplied externally
    get: function(){
      return this.state._busy ? 'Im Busy! Go away...' : 'Not doing too much.';
    }
  },

  selected: {
    get: function(){
      return this.state.selected;
    }
  },
});
