/*jshint unused: vars */
/*jshint unused: false */
/* global IMVVM, HobbiesViewModel, PersonsViewModel */

'use strict';

var DomainModel = IMVVM.createDomainModel({

  getInitialState: function(){ //optional
    return {
      online: true
    };
  },
  getInitialCalculatedState: function(nextState, prevState){
    return {
      busy: false
    };
  },
  validateState: function(nextState, prevState){
    if(!!nextState.hobbies.selected){
      return {busy: true};
    } else {
      return {busy: false};
    }
  },

  undo: function(){
    this.setState(this.previousState);
  },

  busy: {
    calculated: true,
    get: function(){
      return this.state.busy;
    },
    // set: function(newValue){
    //   this.setState({'busy': newValue });
    // }
  },

  online: {
    get: function(){
      return this.state.online;
    },
    set: function(newValue){
      this.setState({'online': newValue });
    }
  },

  dataContexts: function(){
    return {
      hobbies: {
        viewModel: HobbiesViewModel,
        dependsOn: [{property: 'persons.selected', alias: '_selectedPerson'},
                    {property: 'busy', alias: '_busy'}]
      },
      persons: {
        viewModel: PersonsViewModel,
        dependsOn: [{property: 'hobbies.selected'},
                    {property: 'online', alias: 'imOnline'}]
      }
    };
  }
});