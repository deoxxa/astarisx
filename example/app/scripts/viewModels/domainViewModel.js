/*jshint unused: vars */
/*jshint unused: false */
/* global IMVVM, HobbiesViewModel, PersonsViewModel */

'use strict';

//Rename DomainModel to DomainViewModel
var DomainViewModel = IMVVM.createDomainViewModel({

  getInitialState: function(){ //optional
    return {
      online: true,
      busy: false
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

  // Sets the intial path
  // N.B. If the initial path needed to be '/persons' then it could be set in
  // getInitialState as { path: '/people' } and it would automatically set a
  // 'path' property in the Domain data context, but because a reference
  // to this.state.persons is needed we override 'path' with a getter
  // path: Framework reserved property name
  path: {
    get: function(){
      if(this.state.path){
        return this.state.path;
      }
      return '/person/' + this.state.persons.selectedPerson.id;
    }
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
