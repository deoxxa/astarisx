/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({

  watchDataContexts: ['persons', 'Fred', 'somthin'],
  
  onWatchedDataContextChanged: function(viewModel, nextState){
    if(this.selected !== void(0) && viewModel === 'persons' &&
      nextState.selected.id !== this.state.$.persons.selected.id){
      return {selected: void(0)};
    }
  },
  
  //watchDomainProps: ['busy'],
  
  // onWatchedDomainPropChanged: function(nextState){

  // },

  hobbies: {
    get: function(){
      return this.state.$.persons.selected.hobbies;
    }
  },

  busyText: {
    kind: 'pseudo', //kind: 'pseudo' because its not calculated but is supplied externally
    get: function(){
      return this.state.$.busy ? 'Im Busy! Go away...' : 'Not doing too much.';
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
      console.log(retVal);
      this.state.$.persons.selected.hobbies = hobbiesArr;  
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
    this.state.$.persons.selected.addHobby({id:'99',name:value});
  },
  
  deleteHobby: function(value){
    this.state.$.persons.selected.deleteHobby(value);
  },

});
