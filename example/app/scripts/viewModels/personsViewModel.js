/*jshint unused: false */
/* global IMVVM, DataService, PersonModel */

'use strict';

var PersonsViewModel = IMVVM.createViewModel({

  getInitialState: function(){
    var nextState = {};
    nextState.collection = DataService.getPersonData().map(function(person, idx){
      if (idx === 0){
        nextState.selectedPerson = this.Person(person, true);
        return nextState.selectedPerson;
      }
      return this.Person(person, true);
    }.bind(this));
    return nextState;
  },
  
  getWatchedState: function() {
    return {
      'hobbies': {
        alias: 'hobbiesContext',
      },
      'online': {
        alias: 'imOnline'
      }
    };
  },

  imOnline: {
    kind:'pseudo',
    get: function(){
      return this.state.imOnline;
    }
  },
  
  Person: function(personState, init){
    return new PersonModel(this.personStateChangedHandler)(personState, init);
  },

  personStateChangedHandler: function(nextState, prevState/*, callback*/){
    var persons = {};
    persons.collection = this.collection.map(function(person){
      if(person.id === nextState.id){
        persons.selectedPerson = this.Person(nextState);
        return persons.selectedPerson;
      }
      return person;
    }.bind(this));

    this.setState(persons);
  },

  selectedHobby: {
    kind: 'pseudo',
    get: function() {
      return this.state.hobbiesContext.current ? this.state.hobbiesContext.current.name: void(0);
    }
  },

  selectedPerson: {
    kind: 'instance',
    get: function() { return this.state.selectedPerson; }
  },

  collection: {
    kind: 'array',
    get: function(){ return this.state.collection; },
  },

  selectPerson: function(id){
    for (var i = this.collection.length - 1; i >= 0; i--) {
      if(this.selectedPerson.id !== id && this.collection[i].id === id){
        this.setState({ selectedPerson: this.collection[i] });
        break;
      }
    }
  },

  addPerson: function(value){
    var nextState = {};
    var name;

    if(value && value.length > 0){
      name = value.split(' ');
      nextState.selectedPerson = this.Person({
        firstName: name[0],
        lastName: name.slice(1).join(' ')
      }, true);
      nextState.collection = this.collection.slice(0);
      nextState.collection = nextState.collection.concat(nextState.selectedPerson);
      this.setState(nextState);
    }
  },

  deletePerson: function(uid){
    var nextState = {};
    nextState.collection = this.collection.filter(function(person){
      return person.id !== uid;
    });
    nextState.selectedPerson = void(0);
    if(nextState.collection.length > 0){
      if (this.selectedPerson.id === uid){
        nextState.selectedPerson = this.Person(nextState.collection[0]);
      } else {
        nextState.selectedPerson = this.Person(this.selectedPerson);
      }
    }
    this.setState(nextState);
  },

});
