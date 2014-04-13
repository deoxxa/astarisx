/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({

  getWatchedState: function() {
    return {
      'persons': {
        alias: 'personsContext', //optional - if provided then will be added to prototype
        fields: { //optional
          'selected': this.onPersonChange
        }
      },
      'busy': {
        alias: 'busy'
      }
    }
  },

  //Use when this needs change state triggered by others action
  onPersonChange: function(nextState, prevState, field, context){
    if(this.selected !== void(0) && context === 'persons' &&
      nextState.id !== prevState.id){
      return { hobbies: { selected: void(0) }, busy: false };
    }
  },

  hobbies: {
    get: function(){
      return this.state.personsContext.selected.hobbies;
    }
  },

  busyText: {
    kind: 'pseudo', //kind: 'pseudo' because its not calculated but is supplied externally
    get: function(){
      return this.state.busy ? 'Im Busy! Go away...' : 'Not doing too much.';
    }
  },

  selected: {
    kind: 'instance',
    get: function(){
      return this.state.selected;
    }
  },

  Hobby: function(hobbyState, init){
    return new HobbyModel(this.hobbyStateChangedHandler)(hobbyState, init);
  },

  hobbyStateChangedHandler: function(nextState, prevState/*, callback*/){

   var newState = {};
    var hobbiesArr = this.hobbies.map(function(hobby){
      if (hobby.id === nextState.id){

        newState.selected = this.Hobby(nextState);
        return newState.selected;
      }
     return hobby;
    }.bind(this));

    this.setState(newState, function(){
      this.state.personsContext.selected.hobbies = hobbiesArr;  
    }.bind(this));

  },

  select: function(id){
    for (var i = this.hobbies.length - 1; i >= 0; i--) {
      if ((this.selected === void(0) || this.selected.id !== id) && this.hobbies[i].id === id){
        
        this.setState({selected: this.Hobby(this.hobbies[i])}, {busy: true});
        
        /*
          //OR use a callback
          this.setState({selected: this.Hobby(this.hobbies[i])}, function(){
            this.setState(void(0), {busy: true});
          }.bind(this));
        */

        break;
      }
    };
  },
  
  addHobby: function(value){
    this.state.personsContext.selected.addHobby(this.Hobby({id:this.uuid() ,name:value }, true));
  },
  
  deleteHobby: function(value){
    this.state.personsContext.selected.deleteHobby(value);
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
