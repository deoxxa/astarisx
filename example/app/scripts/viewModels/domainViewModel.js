/*jshint unused: vars */
/*jshint unused: false */
/* global IMVVM, HobbiesViewModel, PersonsViewModel */

'use strict';

//Rename DomainModel to DomainViewModel
var DomainViewModel = IMVVM.createDomainViewModel({

  //dataContext keys define the dataContext names that will appear in
  //the View and associates a ViewModel.
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

  // getDependencies: function(){
  //   return {
  //     selectedHobby: { 
  //       property: 'hobbies.selected', 
  //       onStateChange: this.toggleBusyState
  //     }
  //   }
  // },

  //Will not need to call onStateChange
  //simply test the values within a get call
  /*
    busy: {
      get: function() {
        reutrn this.hobbies.selected ? true : false;
      }
    }
  */
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

  // personCount: {
  //   get: function(){
  //     return this.state.$persons ? this.state.$persons.collection.length : 0;
  //   }
  // },

  // personName: {
  //   get: function(){
  //     return this.persons ? this.persons.selected.firstName: 'no one';
  //   }
  // },
  watchDataContexts: ['hobbies'],

  busy: {
    get: function() {
      return this.hobbies.selected ? true : false;
    }
  },

  // busy: {
  //   get: function(){
  //     return this.state.busy;
  //   },
  //   set: function(newValue){
  //     console.log(newValue);
  //     this.setState({'busy': newValue });
  //   },
  // },

  online: {
    get: function(){
      return this.state.online;
    },
    set: function(newValue){
      this.setState({'online': newValue });
    }
  },

});