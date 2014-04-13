/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({

  getWatchedState: function() {
    return {
      'persons': {
        alias: 'personsContext', //optional - if provided then will be added to prototype
        fields: { //optional
          'selectedPerson': this.onPersonChangedHandler
        }
      },
      'busy': {
        alias: 'busy'
      }
    }
  },

  //Use when this needs change state triggered by others action
  onPersonChangedHandler: function(nextState, prevState, field, context){
    if(this.current !== void(0) && context === 'persons' &&
      nextState.id !== prevState.id){
      return { hobbies: { current: void(0) }, busy: false };
    }
  },

  hobbies: {
    kind: 'pseudo',
    get: function(){
      return this.state.personsContext.selectedPerson.hobbies;
    }
  },

  busyText: {
    kind: 'pseudo', //kind: 'pseudo' because its not calculated but is supplied externally
    get: function(){
      return this.state.busy ? 'Im Busy! Go away...' : 'Not doing too much.';
    }
  },

  current: {
    kind: 'instance',
    get: function(){
      return this.state.current;
    }
  },

  Hobby: function(hobbyState, init){
    return new HobbyModel(this.hobbyStateChangedHandler)(hobbyState, init);
  },

  hobbyStateChangedHandler: function(nextState, prevState/*, callback*/){

   var newState = {};
    var hobbiesArr = this.hobbies.map(function(hobby){
      if (hobby.id === nextState.id){

        newState.current = this.Hobby(nextState);
        return newState.current;
      }
     return hobby;
    }.bind(this));

    this.setState(newState, function(){
      this.state.personsContext.selectedPerson.hobbies = hobbiesArr;  
    }.bind(this));

  },

  selectHobby: function(id){
    for (var i = this.hobbies.length - 1; i >= 0; i--) {
      if ((this.current === void(0) || this.current.id !== id) && this.hobbies[i].id === id){
        
        this.setState({current: this.Hobby(this.hobbies[i])}, {busy: true});
        
        /*
          //OR use a callback
          this.setState({current: this.Hobby(this.hobbies[i])}, function(){
            this.setState(void(0), {busy: true});
          }.bind(this));
        */

        break;
      }
    };
  },
  
  addHobby: function(value){
    this.state.personsContext.selectedPerson.
      addHobby(this.Hobby({ id:this.uuid(), name:value }, true));
  },
  
  deleteHobby: function(value){
    this.state.personsContext.selectedPerson.deleteHobby(value);
  },

  uuid: function () {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
        .toString(16);
    }
    return uuid;
  },
});
