/*jshint unused: false */
/* global IMVVM, DataService, PersonModel */

'use strict';

var PersonsViewModel = IMVVM.createViewModel({

  getInitialState: function(){
    var nextState = {};
    nextState.collection = DataService.getPersonData().map(function(person, idx){
      if (idx === 0){
        nextState.selected = this.Person(person, true);
        return nextState.selected;
      }
      return this.Person(person, true);
    }.bind(this));
    return nextState;
  },

  // linkTo: {
  //   'hobbies': 'hobbiesContext',
  //   'online': 'imOnline'
  // },
  
  getWatchedState: function() {
    return {
      'hobbies': {
        alias: 'hobbiesContext', //optional - if provided then will be added to prototype
        // fields: {              //optional - will be called everytime field is called
        //   'selected': this.onWatchedStateChanged
        // }
      },
      'online': {
        alias: 'imOnline'
      }
    }
  },

  imOnline: {
    kind:'pseudo',
    get: function(){
      return this.state.imOnline;
    }
  },

  onWatchedStateChanged: function(nextState, prevState){

    // if(dataContext === 'hobbies'){
    //   if(nextState.selected === )
    // }
  },
  
  Person: function(personState, init){
    return new PersonModel(this.personStateChangedHandler)(personState, init);
  },

  personStateChangedHandler: function(nextState, prevState/*, callback*/){
    var persons = {};
    
    persons.collection = this.collection.map(function(person){
      if(person.id === nextState.id){

        persons.selected = this.Person(nextState);
        return persons.selected;
      }
      return person;
    }.bind(this));

    this.setState(persons);
  },

  selectedHobby: {
    kind: 'pseudo',
    get: function() {
      return this.state.hobbiesContext.selected ? this.state.hobbiesContext.selected.name: void(0); 
    }
  },

  selected: {
    kind: 'instance',
    get: function() { return this.state.selected; }
  },

  collection: {
    kind: 'array',
    get: function(){ return this.state.collection; },
  },

  select: function(id){
    for (var i = this.collection.length - 1; i >= 0; i--) {
      if(this.selected.id !== id && this.collection[i].id === id){
        this.setState({ selected: this.collection[i] });
        break;
      }
    };
  },

  addPerson: function(value){
    var nextState = {};
    var name;

    if(value && value.length > 0){
      name = value.split(' ');
      nextState.selected = this.Person({
        firstName: name[0],
        lastName: name.slice(1).join(' ')
      }, true);
      nextState.collection = this.collection.slice(0);
      nextState.collection = nextState.collection.concat(nextState.selected);
      this.setState(nextState);
    }
  },

  deletePerson: function(uid){
    var nextState = {};
    nextState.collection = this.collection.filter(function(person){
      return person.id !== uid;
    });
    nextState.selected = void(0);
    if(nextState.collection.length > 0){
      if (this.selected.id === uid){
        nextState.selected = this.Person(nextState.collection[0]);
      } else {
        nextState.selected = this.Person(this.selected);
      }
    }
    this.setState(nextState);
  },

});
