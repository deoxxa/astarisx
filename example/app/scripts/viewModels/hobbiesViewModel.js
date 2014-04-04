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
  
  hobbies: {
    kind: 'pseudo',//kind: 'pseudo' because get is supplied from other source
                    //if referencing a dependency this kind = 'pseudo'
    get: function(){
      return this.state._selectedPerson.hobbies;
    }
  },

  busyText: {
    kind: 'pseudo', //kind: 'pseudo' because its not calculated but is supplied externally
    get: function(){
      return this.state.busy ? 'Im Busy! Go away...' : 'Not doing too much.';
    }
  },

  selected: {
    get: function(){
      return this.state.selected;
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
    if(this.selected !== void(0)){
      return { selected: void(0) };
    }
  },

});
