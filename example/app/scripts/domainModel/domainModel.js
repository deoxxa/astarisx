/*jshint unused: vars */
/*jshint unused: false */
/* global IMVVM, HobbiesViewModel, PersonsViewModel */

'use strict';

var DomainModel = IMVVM.createDomainModel({

  //dataContext keys define the dataContext names that will appear in
  //the Viewand and associates a ViewModel.
  getDomainDataContext: function(){
    return {
      hobbies: HobbiesViewModel,
      persons: PersonsViewModel
    };
  },

  getInitialState: function(){ //optional
    return {
      online: true,
      busy: false
    };
  },

  getDependencies: function(){
    return {
      selectedHobby: { 
        property: 'hobbies.selected', 
        onStateChange: this.toggleBusyState
      }
    }
  },

  toggleBusyState: function(nextState){
    if(!!nextState.selectedHobby){
      return {busy: true};
    } else {
      return {busy: false};
    }
  },

  undo: function(){
    this.setState(this.previousState);
  },

  personCount: {
    get: function(){
      return this.persons ? this.persons.collection.length : 0;
    }
  },
  personName: {
    get: function(){
      return this.persons ? this.persons.selected.firstName: 'no one';
    }
  },


  busy: {
    get: function(){
      return this.state.busy;
    },
  },

  online: {
    get: function(){
      return this.state.online;
    },
    set: function(newValue){
      this.setState({'online': newValue });
    }
  },

});