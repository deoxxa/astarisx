/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({

  linkTo: {
    'persons': 'personsContext',
    'busy': 'busy'
  },

  //Use when this needs change state triggered by others action
  onWatchedStateChanged: function(nextState, prevState, dataContext){
    if(this.selected !== void(0) && dataContext === 'persons' &&
      nextState.selected.id !== prevState.selected.id){
      return { selected: void(0) };
    }
    // if(dataContext === void(0) && this.selected === void(0)){
    //    nextState.hobbies.selected 
    //   return { busy: false };
    // }
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

  // selectedPerson: {
  //   kind: 'pseudo',
  //   get: function(){return this.state.$persons.selected;}
  // },

  hobbyStateChangedHandler: function(nextState, prevState/*, callback*/){

   var newState = {};
    var hobbiesArr = this.hobbies.map(function(hobby){
      if (hobby.id === nextState.id){

        newState.selected = this.Hobby(nextState);
        return newState.selected;
      }
     return hobby;
    }.bind(this));

    //Need to batch this so that undo works properly
    this.setState(newState, function(retVal){
      //console.log(retVal);
      this.state.personsContext.selected.hobbies = hobbiesArr;  
    }.bind(this));

  },

  select: function(id){
    for (var i = this.hobbies.length - 1; i >= 0; i--) {
      if ((this.selected === void(0) || this.selected.id !== id) && this.hobbies[i].id === id){
        this.setState({selected: this.Hobby(this.hobbies[i])}/*, function(){
          console.log('called back');
          this.state.$.busy = true;
        }.bind(this)*/);
        break;
      }
    };
  },
  
  addHobby: function(value){
    this.state.personsContext.selected.addHobby({id:'99',name:value});
  },
  
  deleteHobby: function(value){
    this.state.personsContext.selected.deleteHobby(value);
  },

});
