/*jshint unused: false */
/* global IMVVM, DataService, PersonModel */

'use strict';

var PersonsViewModel = (function(){

  var personStateChangedHandler = function(nextState/*, callback*/){
    var persons = {};
    persons.collection = this.collection.map(function(person){
      if(person.id === nextState.id){
        persons.selectedPerson = new Person(nextState);
        return persons.selectedPerson;
      }
      return person;
    });
  this.setState(persons);
  };

  var Person = function(){
    return new PersonModel(personStateChangedHandler).apply(this, arguments);
  };

  var personRouteHandler = function(params, path, pathKey, ctx){
    //Do some validation on whether item exists and if not
    //throw 404
    // if(pathKey === 'list'){
    //   this.selectPerson();
    // } else {
      this.selectPerson(params.id);
    //}
  };

  var personsViewModel = IMVVM.createViewModel({

    getInitialState: function(){
      var nextState = {};

      nextState.collection = DataService.getPersonData().map(function(person, idx){
        // if (idx === 0){
        //   nextState.selectedPerson = new Person(person, true);
        //   return nextState.selectedPerson;
        // }
        return new Person(person, true);
      }.bind(this));
      return nextState;
    },

    getRoutes: function(){
      return {
        displayPerson: {
          path: '/person/:id',
          handler: personRouteHandler
        },
        list: {
          path: '/people',
          handler: personRouteHandler
        }
      };
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

    selectedHobby: {
      kind: 'pseudo',
      get: function() {
        return this.state.hobbiesContext.current ?
          this.state.hobbiesContext.current.name: void(0);
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

    selectPerson: function(id, next){
      var selectedPerson;
      if(!id){
          this.setState({selectedPerson: selectedPerson },
            {path: '/people' }, next);
            return;
      }
      for (var i = this.collection.length - 1; i >= 0; i--) {
        if(this.collection[i].id === id){
          selectedPerson = new Person(this.collection[i]);
          this.setState({ selectedPerson: selectedPerson },
            {path: '/person/' + selectedPerson.id }, next);
          break;
        }
      }
      if(!selectedPerson){
          this.setState({selectedPerson: selectedPerson },
            {pageNotFound: true }, next);
      }
    },

    addPerson: function(value){
      var nextState = {};
      var name;

      if(value && value.length > 0){
        name = value.split(' ');
        nextState.selectedPerson = new Person({
          firstName: name[0],
          lastName: name.slice(1).join(' ')
        }, true);
        nextState.collection = this.collection.slice(0);
        nextState.collection = nextState.collection.concat(nextState.selectedPerson);
        this.setState(nextState,
          {path: '/person/' + nextState.selectedPerson.id });
      }
    },

    deletePerson: function(uid){
      var nextState = {};
      nextState.collection = this.collection.filter(function(person){
        return person.id !== uid;
      });
      nextState.selectedPerson = void(0);
      if(nextState.collection.length > 0){
        if (!!this.selectedPerson && this.selectedPerson.id === uid){
          nextState.selectedPerson = void(0);
          this.setState(nextState, { enableUndo: true,
            path: '/people'});
        } else {
          if(this.selectedPerson){
            nextState.selectedPerson = new Person(this.selectedPerson);
            this.setState(nextState,
              {path: '/person/' + nextState.selectedPerson.id});
          } else {
            this.setState(nextState,
              {path: '/people'});
          }
        }
      }

    },

  });
  return personsViewModel;
})();
