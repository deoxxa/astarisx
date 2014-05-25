/*jshint unused: vars */
/*jshint unused: false */
/* global IMVVM, HobbiesViewModel, PersonsViewModel */

'use strict';

//Rename DomainModel to DomainViewModel
var DomainViewModel = IMVVM.createDomainViewModel({

  getInitialState: function(){ //optional
    return {
      online: true,
      busy: false,
      path: '/user/1'
    };
  },

  //dataContext keys define the dataContext names that will appear in
  //the View and associates a ViewModel.
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

  personCount: {
    kind:'pseudo',
    get: function(){
      return this.persons ? this.persons.collection.length : 0;
    }
  },

  // Framework reserved property name
  // Sets the intial path
  path: {
    get: function(){
      return this.state.path;
    }
  },

  getRoutes: function(){
    return {
      pageNotFound : {
        path: '*',
        handler: function(){
          this.setState({'page404':true});
        }
      }
    }
  },

  page404: {
    kind: 'pseudo',
    get: function(){
      return this.state.page404;
    },
  },

  /* Four ways to set busy
    1. set directly with a setter. This exposes a set method, which is also accessible from the View
    2. set directly within a callback in a ViewModel. Needs setter to be present
    3. 2nd arg in setState from ViewModel. Pass in {busy: true}
    4. From a trigger. Return state object i.e. {busy: true}, to domain model to process
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
