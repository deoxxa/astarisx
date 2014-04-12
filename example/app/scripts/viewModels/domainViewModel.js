/*jshint unused: vars */
/*jshint unused: false */
/* global IMVVM, HobbiesViewModel, PersonsViewModel */

'use strict';

//Rename DomainModel to DomainViewModel
var DomainViewModel = IMVVM.createDomainViewModel({

  //dataContext keys define the dataContext names that will appear in
  //the View and associates a ViewModel.

  getInitialState: function(){ //optional
    return {
      online: true,
      busy: false
    };
  },

  // getWatchedState: function() {
  //   return {
  //     'hobbies': {
  //       //alias: 'hobbiesDC', //optional - if provided then will be added to prototype

  //     },
  //   }
  // },

  persons: {
    viewModel: PersonsViewModel,
    get: function(){
      return this.state.persons;
    }
  },

  hobbies: {
    viewModel: HobbiesViewModel,
    get: function(){
      return this.state.hobbies;
    }
  },

  undo: function(){
    this.setState(this.previousState);
  },

  personCount: {
    kind:'pseudo',
    get: function(){
      return this.persons ? this.persons.collection.length : 0;
    }
  },

  // personName: {
  //   get: function(){
  //     return this.persons ? this.persons.selected.firstName: 'no one';
  //   }
  // },

  // onWatchedStateChanged: function(nextState, dataContext){
  //   if(this.selected !== void(0) && dataContext === 'persons' &&
  //     nextState.selected.id !== this.state.$.persons.selected.id){
  //     return {selected: void(0)};
  //   }
  //   if(dataContext === void(0) && this.selected === void(0)){
  //     /* nextState.hobbies.selected */
  //     return { busy: false };
  //   }
  // },

  /* Two ways to set busy 
    1. with a callback. This exposes a set method, which is also accessible from the View
    2. From a trigger. Return state object i.e. {busy: true}, to domain model to process
  */
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