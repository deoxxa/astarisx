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

  // getDependencies: function(){
  //   return {
  //     // _selectedPerson: { 
  //     //   property: 'persons.selected', 
  //     //   onStateChange: this.resetSelected
  //     // },
  //     // hobbies: { 
  //     //   property: 'persons.selected.hobbies', 
  //     //   onStateChange: this.setHobbies
  //     // },
  //     busy: 'busy'
  //   }
  // },

  // getWatchedViewModels: function(){
  //   return {
  //     persons: 'personsVM'
  //     //busy: 'busy' //Application/Domain properties are available to all ViewModels by default
  //   }
  // },
  
  // setHobbies: function(value){
  //   this.setState(value);
  // },
  // hobbies: {
  //   kind: 'pseudo',//kind: 'pseudo' because get is supplied from other source
  //                   //if referencing a dependency this kind = 'pseudo'
  //   get: function(){
  //     return this.state._selectedPerson.hobbies;
  //   }
  // },
  // selectedPerson: {
  //   get: function(){
  //     return this.state.selectedPerson ? this.state.selectedPerson : {hobbies:[]};
  //   }
  // },
  hobbies: {
    get: function(){

      return this.state.$persons.selected.hobbies;
    }
  },

  //Will not need to call onStateChange
  //simply test the values within a get call
  /*
    busy: {
      get: function() {
        reutrn this.hobbies.selected ? true : false;
      }
    }
  */
  busyText: {
    kind: 'pseudo', //kind: 'pseudo' because its not calculated but is supplied externally
    get: function(){
      return this.state.$busy ? 'Im Busy! Go away...' : 'Not doing too much.';
    }
  },

  selected: {
    /***********************************
    //ALSO NEED TO CHECK HOW MANY STATE PROPS ARE ADDED TO VMs AND Models
    check updating hobbies
    *************************************/
    
    //each ViewModel should have a previousState that way they can check
    //against that anf there would be no need for onStateChange triggers
    /*
      this.state.$persons.selected.id === this.previousState.$persons.selected.id ?
        this.state.$persons.selected : void(0);
    */

    kind: 'instance',
    get: function(){
      return this.state.selected;
    }
  },

  Hobby: function(hobbyState, init){
    return new HobbyModel(this.hobbyStateChangedHandler)(hobbyState, init);
  },

  onStateChanged: function(viewModel, nextState){
    if(this.selected !== void(0) && viewModel === 'persons' && nextState.selected.id !== this.selectedPerson.id){
      return {selected: void(0)};
    }
  },

  // testWatcher: {
  //   kind: 'watched',
  //   get: function(){ return this.state.$persons.selected.id != this.previousState.$persons.selected.id;}
  // },
  selectedPerson: {
    kind: 'pseudo',
    get: function(){return this.state.$persons.selected;}
  },

  hobbyStateChangedHandler: function(nextState, prevState/*, callback*/){
    //var hobbiesArr;
   // var hobbyState = {};
   var newState = {};
    var hobbiesArr = this.hobbies.map(function(hobby){
      if (hobby.id === nextState.id){

        newState.selected = this.Hobby(nextState);
        return newState.selected;
      }
     return hobby;
    }.bind(this));


    //Need to batch this so that undo works properly
    this.setState(newState, function(){
      this.state.$persons.selected.hobbies = hobbiesArr;  
    }.bind(this));
    

    //this.selectedPerson.hobbies[0].name = 'Fred';
    //this.selectedPerson.hobbies = hobbiesArr;
    //this.selectedPerson.addHobby({id:'4', name:'test'});
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
    //this.state._selectedPerson.hobbies = hobbiesArr;
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
    //this.setState({name: nextState.name});
  },

  select: function(id){
    //var hobbiesArr;
    var nextState = {};
    

      this.hobbies.forEach(function(hobby){
        if (hobby.id === id){
          nextState.selected = this.Hobby(hobby);;
        }
       
      }.bind(this));

    this.setState(nextState);

  },
  
  addHobby: function(value){
    this.state.$persons.selected.addHobby({id:'99',name:value});
  },
  
  deleteHobby: function(value){
    this.state.$persons.selected.deleteHobby(value);
  },

  // //When a dependency changes reset the selected hobby to undefined
  // resetSelected: function(newValue) {
  //   // if(this.selected !== void(0)){
  //   //   return { selected: void(0) };
  //   // }
  // },

});
