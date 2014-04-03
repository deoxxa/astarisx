/*jshint unused: vars */
/*jshint unused: false */
/* global IMVVM, HobbiesViewModel, PersonsViewModel */

'use strict';

var DomainModel = IMVVM.createDomainModel({

  //run once
  getInitialState: function(){ //optional
    return {
      online: true,
      busy: false
    };
  },
  //runs to initialize calculated fields
  // getInitialCalculatedState: function(nextState, prevState){
  //   return {
  //     busy: false
  //   };
  // },

  // //runs last every time transition to new State (after all ViewModels have been updated)
  // getValidState: function(nextState, prevState){
  //   if(nextState.persons.selected.id !== prevState.persons.selected.id){
  //     nextState.hobbies.selected = void(0);
  //   }
  //     return nextState;
  //   //return void(0);
  //   // if(!!nextState.hobbies.selected){
  //   //   return {busy: true};
  //   // } else {
  //   //   return {busy: false};
  //   // }
  // },

  undo: function(){
    this.setState(this.previousState);
  },

  personCount: {
    get: function(){
      return this.persons ? this.persons.collection.length : 0;
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
  //dataContext keys define the dataContext names that will appear in
  //the View. viewModel refers to a ViewModel
  getDomainDataContext: function(){
    return {
      hobbies: {
        viewModel: HobbiesViewModel,
        onStateChange: 'Do something',
      },
      persons: PersonsViewModel,
    };
  }
});