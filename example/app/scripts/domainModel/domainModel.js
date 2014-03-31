/*jshint unused: vars */
/*jshint unused: false */
/* global IMVVM */

'use strict';

var DomainModel = IMVVM.createDomainModel({

  getInitialState: function(){ //optional
    return {
      online: true, 
      busy: false
    };
  },

  undo: function(){
    this.setState(this.previousState);
  },

  busy: {
    get: function(){
      return this.state.busy;
    },
    set: function(newValue){
      this.setState({'busy': newValue });
    }
  },

  dataContexts: function(){
    return {
      hobbies: {
        viewModel: HobbiesViewModel,
        dependsOn: [{property: 'persons.selected'},
                    {property: 'busy', alias: 'appIsBusy'}]
      },
      persons: {
        viewModel: PersonsViewModel,
        dependsOn: [{property: 'hobbies.selected', alias: 'selectedHobby'},
                    {property: 'online', alias: 'imOnline'}]
      }
    }
  }
});