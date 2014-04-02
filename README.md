IMVVM
=====

Immutable MVVM for React
## Introduction
## Usage

IMVVM can be loaded as:

-   standalone. ``IMVVM`` is exposed as a global variable

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

    id: {
      get: function(){
        return this.state.id ? this.state.id : this.uuid();
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
        this.setState({'dob': newValue});
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

  });
  ```

### Create a ViewModel

  ```javascript
  var PersonsViewModel = IMVVM.createViewModel({
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

      if(value && value.length > 0){
        nextState.selected = this.Person({
          name: value
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
    
    getInitialState: function(){
      var nextState = {};
      nextState.collection = DataService.getData().map(function(person, idx){
        if (idx === 0){
          nextState.selected = this.Person(person);
          return nextState.selected;
        }
        return this.Person(person, false);
      }.bind(this));
      return nextState;
    },

    personStateChangedHandler: function(nextState, prevState/*, callback*/){
      var persons = {};
      persons.collection = this.collection.map(function(person){
        if(person.id === nextState.id){
          persons.selected = this.Person(nextState, person);
          return persons.selected;
        }
        return person;
      }.bind(this));
      this.setState(persons);
    },

    Person: function(){
      return new PersonModel(this.personStateChangedHandler).apply(this, arguments);
    },

    collection: {
      get: function(){
        return this.state.collection;
      },
    },

    selected: {
      get: function() {
        return this.state.selected;
      }
    },

  });

  ```

### Create a DomainModel
  ```javascript
  var DomainModel = IMVVM.createDomainModel({

    getInitialState: function(){
      return {
        online: true
      };
    },

    undo: function(){
      this.setState(this.previousState);
    },

    online: {
      get: function(){
        return this.state.online;
      },
      set: function(newValue){
        this.setState({'online': newValue });
      }
    },

    getDomainDataContext: function(){
      return {
        persons: {
          viewModel: PersonsViewModel,
          dependsOn: [{property: 'online', alias: 'imOnline'}]
        }
      };
    }
  });
  ```

### Hook up the View
  ```javascript
  var ApplicationView = React.createClass({

    mixins: [IMVVM.mixin],
    
    render: function(){
      return (
        <div>
          <NavBarView appContext={this.state.applicationDataContext} />
          <SideBarView appContext={this.state.applicationDataContext} />
          <DetailsView appContext={this.state.applicationDataContext} />
        </div>
      );    
    }
  });
  ```

### Render the View
  ```javascript
  React.renderComponent(<ApplicationView domainModel={DomainModel}/>, document.getElementById('container'));
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
  render: function() {
    var current = this.props.appContext.persons.selected;
    return (
      <div key={current.id}>
        <form className="form-horizontal" role="form">
          <div className="form-group">
              <label className="col-md-2 control-label">Name</label>
              <div className="col-md-3">
                <input className="form-control" type="text" value={current.name}
                onChange={this.updateName} />
            </div>
          </div>
          <div className="form-group">
              <label className="col-md-2 control-label">Gender</label>
              <div className="col-md-3">
                <div className="radio">
                <label>
                  <input type="radio" onChange={this.updateGender} value="male"
                    checked={current.gender === 'male'} />
                  Male
                </label>
              </div>
              <div className="radio">
                <label>
                  <input type="radio" onChange={this.updateGender} value="female"
                    checked={current.gender === 'female'} />
                  Female
                </label>
              </div>
            </div>
          </div>
          <div className="form-group">
              <label className="col-md-2 control-label">Birthday</label>
              <div className="col-md-3">
                <input className="form-control" type="text" 
                placeholder="yyyy-mm-dd"
                value={current.dob}
                onChange={this.updateDOB} />
            </div>
          </div>
        </form>
      </div>
    );
  }
});
```

##Running the example application
The example application is a good starting place to figuring out how things work. So to get it running, navigate to the ``./example`` directory and run the following commands.

  ```
  $ npm install
  $ bower install
  $ grunt serve
  ```

## API

###Class
####Constructors
#####function createDomainModel(object specification)
***parameters***
######specification
#####function createViewModel(object specification)
***parameters***
######specification
#####function createModel(object specification)
***parameters***
######specification

###Instance

####Functions
#####setState(object nextState[, function callback])
***parameters***
######nextState
######callback

_Available in:_ DomainModel, ViewModel, Model
#####extend(object currentState[, object... nextState])
_Available in:_ DomainModel, ViewModel, Model
***parameters***
######currentState
######nextState

####Properties
#####state
_Available in:_ DomainModel, ViewModel, Model

#####previousState
_Available in:_ DomainModel

###Specification
####Hooks
#####object getDomainDataContext()
_Available in:_ DomainModel

***return***
######function domainDataContext

_Optional:_ false
#####object getInitialState()
_Available in:_ DomainModel, ViewModel

_Optional:_ true
#####object getInitialCalculatedState(object nextState, object previousState)
_Available in:_ DomainModel, ViewModel, Model

_Optional:_ true

__arguments__
######nextState
######previousState

#####object getValidState(object nextState, object previousState)
_Available in:_ DomainModel, ViewModel, Model

_Optional:_ true

__arguments__
######nextState
######previousState

####Fields
_Available in:_ DomainModel, ViewModel, Model
#####get
#####set
#####pseudo
#####calculated

####DependsOn Properties
_Available in:_ ViewModel

***Public***
This will be made available to the View from this Data Context

***Private***
Hidden from View from this Data Context

####Model State Change Handlers
_Available in:_ ViewModel
#####ModelStateChangeHandler(object nextState,object previousState[, function callback])
__arguments__
######nextState
######previousState
######callback

```javascript
  personStateChangeHandler: function(nextState, prevState/*, callback*/){
    var persons = {};
    persons.collection = this.collection.map(function(person){
      if(person.id === nextState.id){
        persons.selected = this.Person(nextState, person);
        return persons.selected;
      }
      return person;
    }.bind(this));
    this.setState(persons);
  }
```

####Model Factory Functions
_Available in:_ ViewModel

***Definition***
#####ModelFactory(){ return new ModelClass(this.ModelStateChangeHandler).apply(this, arguments); }

***Usage***
#####ModelFactory([object nextState, object previousState, boolean withContext])
#####ModelFactory([object nextState, boolean withContext])

###Mixin
####mixin
mixins: [IMVVM.mixin],

React.renderComponent(<ApplicationView 
  domainModel={DomainModel}
  disableUndo={false} />,
  document.getElementById('container'));
  
this.state.applicationDataContext


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