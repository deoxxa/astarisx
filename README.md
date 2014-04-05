IMVVM
=====

Immutable MVVM for React
## Introduction
## Usage

IMVVM can be loaded as:

-   standalone. `IMVVM` is exposed as a global variable

```javscript
 <script src="imvvm.min.js"></script>
```

-   a Node.js module

```
$ npm install imvvm
```

-   a Bower module

```
$ bower install imvvm
```

-   a RequireJS module

```
require(['./imvvm.min.js'], function (IMVVM) {
    // Do something with IMVVM
});
```

## Getting Started

### Create a Model

```javascript
var PersonModel = IMVVM.createModel({
  
  getInitialState: function(){
    return {
      age: this.calculateAge(this.dob),
      id: this.id ? this.id : this.uuid()
    };
  },

  id: {
    get: function(){
      return this.state.id;
    }
  },

  name: {
    get: function(){
      return this.state.firstName;
    },
    set: function(newValue){
      this.setState({'name': newValue});
    }
  },

  dob: {
    get: function(){
      return this.state.dob;
    },
    set: function(newValue){
      var nextState = {};
      if(newValue.length === 10){
        nextState.age = this.calculateAge(newValue);
      }
      if(newValue.length === 0){
        nextState.age = 'Enter your Birthday';
      }
      nextState.dob = newValue;
      this.setState(nextState);
    }
  },
  
  gender: {
    get: function(){
      return this.state.gender;
    },
    set: function(newValue){
      this.setState({'gender': newValue});
    }
  },

  age: {
    get: function(){
      return this.state.age;
    }
  },
  
  calculateAge: function(dob){
    var DOB = new Date(dob);
    var ageDate = new Date(Date.now() - DOB.getTime()); 
    var age = Math.abs(ageDate.getFullYear() - 1970);
    return Number.isNaN(age) ? 'Enter your Birthday' : age + ' years old';
  },

  uuid: function () {
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
```

### Create a ViewModel

```javascript
var PersonsViewModel = IMVVM.createViewModel({

  getInitialState: function(){
    var nextState = {};
    nextState.collection = DataService.getData().map(function(person, idx){
      if (idx === 0){
        nextState.selected = this.Person(person);
        return nextState.selected;
      }
      return this.Person(person);
    }.bind(this));
    return nextState;
  },

  getDependencies: function(){
    return {
      selectedHobby: 'hobbies.selected',
      imOnline: 'online'
    }
  },

  Person: function(personState){
    return new PersonModel(this.personStateChangedHandler)(personState);
  },

  personStateChangedHandler: function(nextState, prevState/*, callback*/){
    var persons = {};
    
    persons.collection = this.collection.map(function(person){
      if(person.id === nextState.id){

        persons.selected = this.Person(nextState);
        return persons.selected;
      }
      return person;
    }.bind(this));
    this.setState(persons);
  },

  selected: {
    kind: 'instance',
    get: function() { return this.state.selected; }
  },

  collection: {
    kind: 'array',
    get: function(){ return this.state.collection; },
  },

  select: function(id){
    var nextState = {};
    nextState.collection = this.collection.map(function(person){
      if(person.id === id){
        nextState.selected = this.Person(person);
        return nextState.selected;
      }
      return person;
    }.bind(this));

    this.setState(nextState);
  },

  addPerson: function(value){
    var nextState = {};
    var name;

    if(value && value.length > 0){
      name = value.split(' ');
      //Cannot initialize by passing in calculated prop value
      //i.e. fullname
      nextState.selected = this.Person({
        firstName: name[0],
        lastName: name.slice(1).join(' ')
      });
      nextState.collection = this.collection.slice(0);
      nextState.collection = nextState.collection.concat(nextState.selected);
      this.setState(nextState);
    }
  },

  deletePerson: function(uid){
    var nextState = {};
    nextState.collection = this.collection.filter(function(person){
      return person.id !== uid;
    });
    nextState.selected = void(0);
    if(nextState.collection.length > 0){
      if (this.selected.id === uid){
        nextState.selected = this.Person(nextState.collection[0]);
      } else {
        nextState.selected = this.Person(this.selected);
      }
    }
    this.setState(nextState);
  },

});

```

### Create a DomainModel
```javascript
var DomainModel = IMVVM.createDomainModel({

  getDomainDataContext: function(){
    return {
      hobbies: HobbiesViewModel,
      persons: PersonsViewModel
    };
  },

  getInitialState: function(){
    return {
      online: true,
      busy: false
    };
  },

  getDependencies: function(){
    return {
      selectedHobby: { 
        property: 'hobbies.selected', 
        onStateChange: this.toggleBusyState
      }
    }
  },

  toggleBusyState: function(nextState){
    if(!!nextState.selectedHobby){
      return {busy: true};
    } else {
      return {busy: false};
    }
  },

  undo: function(){
    this.setState(this.previousState);
  },

  personCount: {
    get: function(){
      return this.persons ? this.persons.collection.length : 0;
    }
  },

  busy: {
    get: function(){
      return this.state.busy;
    },
  },

  online: {
    get: function(){
      return this.state.online;
    },
    set: function(newValue){
      this.setState({'online': newValue });
    }
  },

});
```

### Hook up the View
```javascript
var ApplicationView = React.createClass({

  mixins: [IMVVM.mixin],
  
  render: function(){
    return (
      <div>
        <NavBarView appContext={this.state.domainDataContext} />
        <SideBarView appContext={this.state.domainDataContext} />
        <DetailsView appContext={this.state.domainDataContext} />
      </div>
    );    
  }
});
```

### Render the View
```javascript
React.renderComponent(<ApplicationView domainModel={DomainModel}/>,
  document.getElementById('container'));
```

__FormView example__
```javascript
var FormView = React.createClass({
  updateName: function(e){
    this.props.appContext.persons.selected.name = e.target.value;
  },
  updateGender: function(e){
    this.props.appContext.persons.selected.gender = e.target.value;
  },
  updateDOB: function(e){
    this.props.appContext.persons.selected.dob = e.target.value;
  },
  updateDOB: function(e){
    this.props.appContext.persons.selected.dob = e.target.value;
  },
  render: function() {
    var current = this.props.appContext.persons.selected;
    return (
      <div key={current.id}>
        <form role="form">
          <div>
              <label>Name</label>
              <div>
                <input type="text" value={current.name}
                onChange={this.updateName} />
            </div>
          </div>
          <div>
              <label>Gender</label>
              <div>
                <div>
                <label>
                  <input type="radio" onChange={this.updateGender}
                    value="male"
                    checked={current.gender === 'male'} />
                  Male
                </label>
              </div>
              <div>
                <label>
                  <input type="radio" onChange={this.updateGender}
                    value="female"
                    checked={current.gender === 'female'} />
                  Female
                </label>
              </div>
            </div>
          </div>
          <div>
              <label>Birthday</label>
              <div>
                <input type="text" 
                placeholder="yyyy-mm-dd"
                value={current.dob}
                onChange={this.updateDOB} />
            </div>
          </div>
          <div className="form-group">
              <label>Age</label>
              <div>
                <div>
                  {current.age}
                </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
});
```

##Running the example application
The example application is a good starting place when figuring out how things work. So to get it running, navigate to the `./example` directory and run the following commands.

  ```
  $ npm install
  $ bower install
  $ bower install imvvm
  $ grunt serve
  ```

##API

###Class
####Constructors
___
#####function createDomainModel(object specification)
Creates a DomainModel object.

*parameters*

__specification__ - see [Specification](#specification)
___
#####function createViewModel(object specification)
Creates a ViewModel object.

*parameters*

__specification__ - see [Specification](#specification)
___
#####function createModel(object specification)
Creates a Model object.

*parameters*

__specification__ - see [Specification](#specification)

###Instance
####Functions
___
#####void setState(object nextState[, function callback])
Transition Data Context to the next state.

*parameters*

__nextState__

__callback__

_Available in:_ DomainModel, ViewModel, Model
___
#####object extend(object currentState[, object... nextState])
Creates a shallow copy of currentState. Adds/replaces properties with properties of subsequent objects.

*parameters*

__currentState__

__nextState__

_Available in:_ DomainModel, ViewModel, Model

####Properties
___
#####state

_Available in:_ DomainModel, ViewModel, Model
___
#####previousState

_Available in:_ DomainModel

###Specification
####Hooks
___
#####function getDomainDataContext()

_Available in:_ DomainModel

_Optional:_ false
___
#####object getInitialState()

_Available in:_ DomainModel, ViewModel

_Optional:_ true
___
#####object getDependencies()

***Public***
This will be made available to the View from this Data Context

_Available in:_ DomainModel, ViewModel, Model

***Private***
Hidden from View from this Data Context

_Available in:_ ViewModel

_Optional:_ true

####Field Descriptor
___
#####\* get()
#####void set(\* newValue)
#####kind:['instance'||'array'||'pseudo']

_Available in:_ DomainModel, ViewModel, Model

####Model State Change Handlers
___
#####void ModelStateChangedHandler(object nextState,object previousState[, function callback])

*arguments*

__nextState__

__previousState__

__callback__

```javascript
  personStateChangedHandler: function(nextState, prevState){
    var persons = {};
    persons.collection = this.collection.map(function(person){
      if(person.id === nextState.id){

        persons.selected = this.Person(nextState, person, true);
        return persons.selected;
      }
      return person;
    }.bind(this));
    this.setState(persons);
  },
```

_Available in:_ ViewModel

####Model Factory Functions
___
_Definition_

#####function ModelFactory(arg){ return new ModelClass(this.ModelStateChangeHandler)(arg); }

_Usage_

#####object ModelFactory(object nextState)

```javascript
  Person: function(person){
    return new PersonModel(this.personStateChangedHandler)(person);
  },
```

_Available in:_ ViewModel

###Mixin
####mixin
___
mixins: [IMVVM.mixin],

Adds domainDataContext to state.

```javascript
var ApplicationView = React.createClass({
  mixins: [IMVVM.mixin],
  render: function(){
    return <DetailsView appContext={this.state.domainDataContext} />;    
  }
});
```

Point the View to the Domain Model.
```javascript
React.renderComponent(<ApplicationView domainModel={DomainModel}/>,
  document.getElementById('container'));
```


## Browser Support
Most ECMAScript 5 compliant browsers. 
__IE8 and below are not supported__

## Author
Entrendipity  - [Follow @entrendipity](https://twitter.com/intent/follow?screen_name=entrendipity)

Frank Panetta  - [Follow @fattenap](https://twitter.com/intent/follow?screen_name=fattenap)

##License
###The MIT License (MIT)

Copyright (c) 2014 Entrendipity

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.