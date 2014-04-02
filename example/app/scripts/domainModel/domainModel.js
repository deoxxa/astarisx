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

  //runs last every time transition to new State (after all ViewModels have been updated)
  // getValidState: function(nextState, prevState){
  //   if(!!nextState.hobbies.selected){
  //     return {busy: true};
  //   } else {
  //     return {busy: false};
  //   }
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
  //the View. viewModel refer to the ViewModels and 
  //dependsOn will enable props to be transfered to other ViewModels.
  //if alias is supplied that prop name will appear in ViewModel state
  //otherwise it will appear concatenated by '$' i.e. hobbies$selected
  //if you would like dependency prop to not appear in the View, supply
  //and alias with a preceding underscore i.e. alias: _busy
  getDomainDataContext: function(){
    return {
      hobbies: {
        viewModel: HobbiesViewModel,
        dependsOn: [{property: 'persons.selected', alias: '_selectedPerson'},
                    {property: 'busy', alias: '_busy'}]
      },
      persons: {
        viewModel: PersonsViewModel,
        /*dependsOn: [{property: 'hobbies.selected'},
                    {property: 'online', alias: 'imOnline'}]*/
      }
    };
  }
});