'use strict';

var IMVVMModelBase = function() {};
var uuid = function () {
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
};
var extend = function () {
      var newObj = {};
      for (var i = 0; i < arguments.length; i++) {
        var obj = arguments[i];
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            newObj[key] = obj[key];
          }
        }
      }
      return newObj;
    };

var mixInto = function(constructor, methodBag) {
  var methodName;
  for (methodName in methodBag) {
    if (!methodBag.hasOwnProperty(methodName)) {
      continue;
    }
    constructor.prototype[methodName] = methodBag[methodName];
  }
};


// var testSGH = function(oldState, newState){
//        console.log('this');
//        console.log(this);
//        console.log('oldState');
//        console.log(oldState);
//        console.log('newState');
//        console.log(newState);
        
//        //this.raiseStateChanged(/*appState, nextState*/);
//      };

var testSCH = function (context) {
      console.log('Called TOP');

  return function(oldState, newState){
    console.log('Called');
    // var nextState = context.extend(context);
    // var personNextState;
    // nextState.collection = nextState.collection.map(function(person){
    //   if(person.id === oldState.id){
    //     personNextState = context.extend(person, newState);
    //     nextState.selected = Person(personNextState);
    //     return nextState.selected;
    //   }
    //   return person;
    // });
    //raiseStateChanged(appState, nextState);
  };
}


var IMVVMDataContext = {
  Mixin: {
    construct: function(raiseStateChangeHandler){
      this.prototype.raiseStateChanged = raiseStateChangeHandler;
      var descriptor = {};
      var k;
      for(k in this.originalSpec){
        if(this.originalSpec.hasOwnProperty(k)){
          if('get' in this.originalSpec[k] || 'set' in this.originalSpec[k]){
            //assume ii is a descriptor
            descriptor[k] = this.originalSpec[k];
          } else {
            this.prototype[k] = this.originalSpec[k];
          }
        }
      }
      return function(state, withContext) {
        
        if(typeof state === 'boolean'){
          withContext = state;
          state = {};
        } else {
          state = state || {};
          //When creating an Object, withContext default is true
          withContext = withContext === void 0 ? true : withContext;
        }

        state = extend(state, this.originalSpec.initialiseState(state));

        var retObj = Object.create(this.prototype, descriptor);

        Object.defineProperty(retObj, 'state', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: state
        });
        
        if(withContext){
          Object.defineProperty(retObj, 'context', {
            configurable: true,
            enumerable: true,
            set: function(context){
              this.raiseStateChanged = this.raiseStateChanged(context);
              delete this.context;
            }
          });
        }

        return retObj
      }.bind(this);


    },

    testFunc: function(oldState, nextState, callback){
      console.log('raiseStateChanged');
      console.log(this);
      this.stateChangedHandler.apply(this, arguments);
    }
  }
};

mixInto(IMVVMModelBase, IMVVMDataContext.Mixin);

var testSpec = {
      
      addPerson: function(){},
      calculateAge: function(dob) { // dob is a date
          var DOB = new Date(dob);
          var ageDate = new Date(Date.now() - DOB.getTime()); // miliseconds from epoch
          return Math.abs(ageDate.getFullYear() - 1970) + " years old";
      },

      initialiseState: function(state){
        return { 
          id: state.id ? state.id : uuid(),
          age: this.calculateAge(state.dob) 
        }
      },

      //immutable
      id: {
        configurable: false,
        enumerable: true,
        get: function(){
          return this.state.id;
        }
      },

      firstName: {
        configurable: false,
        enumerable: true,
        get: function(){ return this.state.firstName; },
        set: function(newValue){
          var nextState = {};
          nextState.firstName = newValue.length === 0 ? void 0 : newValue;
          this.raiseStateChanged(this, nextState);
        }
      },

      lastName: {
        configurable: false,
        enumerable: true,
        get: function(){ return this.state.lastName; },
        set: function(newValue){
          var nextState = {};
          nextState.lastName = newValue.length === 0 ? void 0 : newValue;
          this.raiseStateChanged(this, nextState);
        }
      },
      
      fullName: {
        configurable: false,
        enumerable: false,
        get: function(){            
          if(this.lastName === void 0){
            return this.firstName;
          }
          return this.firstName + " " + this.lastName; 
        },
        set: function(newValue){
          var nextState = {};
          var nameArr = newValue.split(" ");
          var isSpace = newValue.slice(-1)[0] === " ";
          var firstname = nameArr[0];
          var lastname = nameArr.slice(1).join(" ");
          
          nextState.firstName = firstname.length === 0 ? void 0 : firstname;
          nextState.lastName = lastname.length === 0 && !isSpace ? void 0 : lastname;

          this.raiseStateChanged(this, nextState);
        }
      },

      occupation: {
        configurable: false,
        enumerable: true,
        get: function(){
          return this.state.occupation;
        },
        set: function(newValue){
          this.raiseStateChanged(this, {'occupation': newValue });
        }
      },
      
      dob: {
        configurable: false,
        enumerable: true,
        get: function(){
          return this.state.dob;
        },
        set: function(newValue){
          var nextState = {};
          console.log('this.state.dob');
          console.log(newValue);
          console.log(this.state.dob);
          //Calculated field
          if(newValue.length === 10){
            nextState.age = this.calculateAge(newValue);
          }
          nextState.dob = newValue;
          this.raiseStateChanged(this, nextState);
        }
      },

      age: {
        configurable: false,
        enumerable: true,
        get: function(){
          return this.state.age;
        }
      },
      
      gender: {
        configurable: false,
        enumerable: true,
        get: function(){ return this.state.gender; },
        set: function(newValue){
          this.raiseStateChanged(this, {'gender': newValue});
        }
      },

      hobbies: {
        configurable: false,
        enumerable: true,
        //Explicitly set array to immutable
        //must ensure object is initialised before freeze
        get: function(){ return this.state.hobbies },
        set: function(newArray){
          this.raiseStateChanged(this, {'hobbies': newArray});
        }
      },  
}

var tempIMVVM = {
  createModel: function(spec){
    var Constructor = function(){};
    Constructor.prototype = new IMVVMModelBase();

    Constructor.prototype.constructor = Constructor;

    var DescriptorConstructor = Constructor;

    var ConvenienceConstructor = function(raiseStateChangeHandler) {
      var descriptor = new DescriptorConstructor();
      return descriptor.construct.apply(ConvenienceConstructor, arguments);;
    };

    ConvenienceConstructor.componentConstructor = Constructor;
    Constructor.ConvenienceConstructor = ConvenienceConstructor;
    
    ConvenienceConstructor.originalSpec = spec;

    // Expose the convience constructor on the prototype so that it can be
    // easily accessed on descriptors. E.g. <Foo />.type === Foo.type and for
    // static methods like <Foo />.type.staticMethod();
    // This should not be named constructor since this may not be the function
    // that created the descriptor, and it may not even be a constructor.
    ConvenienceConstructor.type = Constructor;
    Constructor.prototype.type = Constructor;

    /*// Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactCompositeComponentInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    if (__DEV__) {
      // In DEV the convenience constructor generates a proxy to another
      // instance around it to warn about access to properties on the
      // descriptor.
      DescriptorConstructor = createDescriptorProxy(Constructor);
    }*/

    return ConvenienceConstructor;
  },
};
