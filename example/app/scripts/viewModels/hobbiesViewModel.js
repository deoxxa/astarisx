/*jshint unused: false */
/* global IMVVM */

'use strict';

var HobbiesViewModel = IMVVM.createViewModel({
  
  // getInitialState: function(){
  //   var nextState = {};
  //   console.log('this this this');
  //   console.log(this);
  //   nextState.hobbies = this.state._selectedPerson.hobbies;
  //   return nextState;
  // },

  getDependencies: function(){
    return {
      _selectedPerson: { 
        property: 'persons.selected', 
        onStateChange: this.resetSelected
      },
      hobbies: { 
        property: 'persons.selected.hobbies', 
        onStateChange: this.setHobbies
      },
      busy: 'busy'
    }
  },
  
  setHobbies: function(value){
    this.setState(value);
  },
  // hobbies: {
  //   kind: 'pseudo',//kind: 'pseudo' because get is supplied from other source
  //                   //if referencing a dependency this kind = 'pseudo'
  //   get: function(){
  //     return this.state._selectedPerson.hobbies;
  //   }
  // },

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

    //var hobbiesArr;
   // var hobbyState = {};
    var hobbiesArr = this.hobbies.map(function(hobby){
      if (hobby.id === nextState.id){
        return this.Hobby(nextState);
      }
     return hobby;
    }.bind(this));

    console.log('hobbiesArr');
    console.log(hobbiesArr);
    // var nextState = {};
    // for (var i = hobbiesArr.length - 1; i >= 0; i--)
    // {
    //   if (hobbiesArr[i].id === id){
    //     nextState.selected = this.Hobby(this.hobbies[i]);
    //     hobbiesArr[i] = nextState.selected;
    //     break;
    //   }
    // }
    // this.setState(nextState, function(dataContext){
    //   console.log(dataContext);
    this.state._selectedPerson.hobbies = hobbiesArr;
    //}.bind(this));


    // console.log('nextState');
    // console.log(nextState);
    // // var hobbies = {};
    
    // // hobbies.collection = this.collection.map(function(hobby){
    // //   if(hobby.name === nextState.name){

    // //     hobbies.selected = this.Hobby(nextState);
    // //     return hobbies.selected;
    // //   }
    // //   return hobby;
    // // }.bind(this));
    // this.setState({name: nextState.name});
  },

  select: function(id){
    //var hobbiesArr;
    var nextState = {};
    var hobbiesArr = this.hobbies.map(function(hobby){
      if (hobby.id === id){
        nextState.selected = this.Hobby(hobby);
        return nextState.selected;
       
      }
     return hobby;
    }.bind(this));

    console.log(hobbiesArr);
    // var nextState = {};
    // for (var i = hobbiesArr.length - 1; i >= 0; i--)
    // {
    //   if (hobbiesArr[i].id === id){
    //     nextState.selected = this.Hobby(this.hobbies[i]);
    //     hobbiesArr[i] = nextState.selected;
    //     break;
    //   }
    // }
    this.setState(nextState, function(dataContext){
      console.log(dataContext);
      this.state._selectedPerson.hobbies = hobbiesArr;
    }.bind(this));

  },
  
  addHobby: function(value){
    this.state._selectedPerson.addHobby(value);
  },
  
  deleteHobby: function(value){
    this.state._selectedPerson.deleteHobby(value);
  },

  //When a dependency changes reset the selected hobby to undefined
  resetSelected: function(newValue) {
    // if(this.selected !== void(0)){
    //   return { selected: void(0) };
    // }
  },

});
