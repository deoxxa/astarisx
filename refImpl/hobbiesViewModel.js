var Astarisx = require('../src/core');
var HobbyClass = require('./hobbyClass');

var hobbyStateChangeHandler = function(nextState/*, callback*/){

  var newState = {};
  var hobbiesArr = this.hobbies.map(function(hobby){
    if (hobby.id === nextState.id){

      newState.current = new Hobby(nextState);
      return newState.current;
    }
    return hobby;
  }.bind(this));

  this.setState(newState, function(err, appContext){
    //This will invoke setState within the persons Data Context
    appContext.persons.selectedPerson.updateHobby(newState.current);

    //maybe test calling this.setState.call(this._state.personsContext, {});
    //probably won't work because the caller has been bound and probably
    //not a good idea anyway because it leads to spegetti
  });

};

//Use this if _state change is triggered by others action
var onPersonChangeHandler = function(nextState, prevState, field, context,
    nextPath, prevPath){

  if(this.current !== void(0) && context === 'persons' &&
    (nextState === void(0) || nextState.id !== prevState.id || nextPath !== prevPath)){
    return { hobbies: { current: void(0) }, busy: false };
  }
};

var Hobby = function(){
  return new HobbyClass(hobbyStateChangeHandler).apply(this, arguments);
};

var hobbyRouteHandler = function(params, appContext, path, pathId, ctx){

  if(appContext.persons.selectedPerson === void(0) && ('id' in params) ||
    appContext.persons.selectedPerson.id != params.id){
    appContext.persons.selectPerson(params.id, function(){
      this.selectHobby(params.hobbyId);
    }.bind(this));
  } else {
    this.selectHobby(params.hobbyId);
  }

};

var HobbiesViewModel = Astarisx.createViewModelClass({  //short form => createVMClass()

  dataContextWillInitialize: function(){
    console.log('This should only be called once.');
  },

  getWatchedState: function() {
    return {
      'persons': {
        alias: 'personsContext', //optional - will be added to prototype
        fields: { //optional
          'selectedPerson': onPersonChangeHandler
        }
      },
      'busy': {
        alias: 'busy'
      }
    };
  },

  // getDisplays: function(){
  //   return {
  //     "hob View":{
  //       viewDisplay: "TestDisplay",
  //       component: HobbyListView,
  //       path: "selectHobby"
  //     }
  //   }
  // },

  getRoutes: function(){
    return {
      selectHobby : {
        path: '/person/:id/hobby/:hobbyId',
        handler: hobbyRouteHandler
      }
    }
  },

  hobbies: {
    kind: 'pseudo',
    get: function(){
      return this._state.personsContext.selectedPerson ? this._state.personsContext.selectedPerson.hobbies : [];
    }
  },

  busyText: {
    kind: 'pseudo', //kind: 'pseudo' because its value is supplied externally
    get: function(){
      return this._state.busy ? 'Im Busy! Go away...' : 'Not doing too much.';
    }
  },

  current: {
    kind: 'instance',
    get: function(){
      return this._state.current;
    }
  },

  selectHobby: function(id){

    for (var i = this.hobbies.length - 1; i >= 0; i--) {
      if ((this.current === void(0) || this.current.id !== id) && this.hobbies[i].id === id){

        this.setState({
          current: new Hobby(this.hobbies[i])
        },
        {
          busy: true,
          $path: '/person/'+ this._state.personsContext.selectedPerson.id +
          '/hobby/'+this.hobbies[i].id
        });
        return;
      }
    }
    this.setState({
          current: void(0)
        },
        {
          $pageNotFound: true 
        });
  },

  getHobbies: function(person){
    return DataService.getHobbiesData(person.id).map(function(hobby){
      return new Hobby(hobby);
    }.bind(this));
  }
});
module.exports = HobbiesViewModel;
