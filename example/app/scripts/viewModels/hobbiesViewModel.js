/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({
  select: function(value){
    var nextState = {};
    nextState.selected = this.persons$selected.hobbies.filter(function(hobby){
      return hobby === value;
    })[0];
    this.setState(nextState);
  },
  
  addHobby: function(value){
    this.persons$selected.addHobby(value);
  },
  
  deleteHobby: function(value){
    this.persons$selected.deleteHobby(value);
  },

  //When a dependency changes reset the selected hobby to undefined
  resetSelected: function(nextState, prevState) {
    if(prevState.persons$selected && nextState.persons$selected){
      if(nextState.persons$selected.id !== prevState.persons$selected.id &&
        nextState.selected !== void(0)){
        return void(0);
      }
    }
    return nextState.selected;
  },

  getInitialState: function(nextState, prevState){
    return {
      selected: this.resetSelected(nextState, prevState),
      appIsBusy: nextState.appIsBusy === void(0) ? false : nextState.appIsBusy
    };
  },

  selected: {
    get: function(){
      return this.state.selected;
    }
  },
});
