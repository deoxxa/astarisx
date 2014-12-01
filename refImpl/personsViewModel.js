var Astarisx = require('../src/core');
var PersonClass = require('./personClass');
var DataService = require('./data');

var personStateChangeHandler = function(nextState, nextAppState, callback){
    var persons = {};
    persons.collection = this.collection.map(function(person){
      if(person.id === nextState.id){
        persons.selectedPerson = new Person(nextState);
        return persons.selectedPerson;
      }
      return person;
    });
    this.setState(persons, nextAppState, callback);
};

var Person = function(){
    return new PersonClass(personStateChangeHandler).apply(this, arguments);
};

// var personRouteHandler = function(params, appContext, path, pathId, ctx){
//   //Do not call setState from within RouteHandlers
//   this.selectPerson(params.id);
// };

var PersonsViewModel = Astarisx.createViewModelClass({  //short form => createVMClass()

    /* This is where you make ajax calls. You do not put ajax calls in getInitialState */
    dataContextWillInitialize: function(){
      var nextState = {};
      nextState.collection = DataService.getPersonData().map(function(person, idx){
        return new Person(person);
      }.bind(this));
      nextState.passedInArgs = Array.prototype.slice.call(arguments, 0);
      nextState.initialized = true;
      this.setState(nextState, {$notify: "SideBarView"}, false);
    },
    getInitialState: function(){
      return {
        objectField: {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  },
      objectFreezeField: {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  },
      objectDeepFreezeField: {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  },
      arrayField: ["aValue1", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }, ["aValue2", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }]],
      arrayFreezeField: ["aValue1", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }, ["aValue2", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }]],
      arrayDeepFreezeField: ["aValue1", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }, ["aValue2", {'rootKey': 'rootVal',
                    'lvl1Obj':{
                      'lvl1ObjKey': 'lvl1ObjVal',
                      'lvl1ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                      'lvl2Obj':{
                        'lvl2ObjKey': 'lvl2ObjVal',
                        'lvl2ArrKey': [{'key1':'val1'},{'key2':'val2'}],
                        'lvl3Obj':{
                          'lvl3ObjKey': 'lvl3ObjVal',
                          'lvl3ArrKey': [{'key1':'val1'},{'key2':'val2'}]
                        }
                      }
                    }
                  }]]
        };
    },
    initialized: {
      get: function(){
        return this.$state.initialized;
      }
    },
    passedInArgs: {
      kind: 'array',
      get: function(){
        return this.$state.passedInArgs;
      }
    },
  
  objectField: {
    kind: 'object',
    get: function(){
      return this.$state.objectField;
    }
  },
  objectFreezeField: {
    kind: 'object:freeze',
    get: function(){
      return this.$state.objectFreezeField;
    }
  },
  objectDeepFreezeField: {
    kind: 'object:deepFreeze',
    get: function(){
      return this.$state.objectDeepFreezeField;
    }
  },

  arrayField: {
    kind: 'array',
    get: function(){
      return this.$state.arrayField;
    }
  },
  arrayFreezeField: {
    kind: 'array:freeze',
    get: function(){
      return this.$state.arrayFreezeField;
    }
  },
  arrayDeepFreezeField: {
    kind: 'array:deepFreeze',
    get: function(){
      return this.$state.arrayDeepFreezeField;
    }
  },

  pseudoField: {
    kind: 'pseudo',
    get: function(){
      return 'pseudoField';
    }
  },




    // // getDisplays: function(){
    // //   return {
    // //     "main":{
    // //       component: DetailsView,
    // //       path: function(){ return '/person/' + this.selectedPerson.id; }
    // //     }
    // //   }
    // // },

    // getRoutes: function(){
    //   return {
    //     displayPerson: {
    //       path: '/person/:id',
    //       handler: personRouteHandler,
    //     },
    //     list: {
    //       path: '/people',
    //       handler: personRouteHandler,
    //     }
    //   };
    // },

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
        return this.$state.imOnline;
      }
    },

    // selectedHobby: {
    //   kind: 'pseudo',
    //   get: function() {
    //     return this.$state.hobbiesContext.current ?
    //       this.$state.hobbiesContext.current.name: void(0);
    //   }
    // },

    selectedPerson: {
      kind: 'instance',
      get: function() { return this.$state.selectedPerson; }
    },

    collection: {
      kind: 'array',
      get: function(){ return this.$state.collection; },
    },

    selectPerson: function(id, callback){
      var selectedPerson;

      if(!id){
          this.setState({selectedPerson: selectedPerson },
            {$path: '/people' }, callback);
            return;
      }
      for (var i = this.collection.length - 1; i >= 0; i--) {
        if(this.collection[i].id === id){
          selectedPerson = new Person(this.collection[i]);
          this.setState({ selectedPerson: selectedPerson },
            {$path: '/person/' + selectedPerson.id }, callback);
          break;
        }
      }
      if(!selectedPerson){
        this.setState({selectedPerson: selectedPerson },
          {$pageNotFound: true }, callback);
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
        });
        nextState.collection = this.collection.slice(0);
        nextState.collection = nextState.collection.concat(nextState.selectedPerson);
        this.setState(nextState,
          {$path: '/person/' + nextState.selectedPerson.id });
      }
    },

    // deletePerson: function(uid){
    //   var nextState = {};

    //   nextState.collection = this.collection.filter(function(person){
    //     return person.id !== uid;
    //   }.bind(this));

    //   if(nextState.collection.length > 0){
    //     if (!!this.selectedPerson){
    //       if(this.selectedPerson.id === uid){
    //         nextState.selectedPerson = void(0);
    //         this.setState(nextState, { enableUndo: true,
    //           $path: '/people'});
    //           return;
    //       }
    //     }
    //   } else {
    //     if(!!this.selectedPerson){
    //       nextState.selectedPerson = void(0);
    //     }
    //     this.setState(nextState, {$path: '/people'});
    //     return;
    //   }
    //   this.setState(nextState);
    // }

});

module.exports = PersonsViewModel;