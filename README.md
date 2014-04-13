IMVVM
=====

Immutable MVVM for React
## Introduction
This library is designed to compliment the React library, deleveloped by Facebook and Instagram. React is 
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
      var age;
      if(newValue.length === 10){
        age = this.calculateAge(newValue);
      }
      if(newValue.length === 0){
        age = 'Enter your Birthday';
      }
      this.setState({
        dob: newValue,
        age: age
      });
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

#####getInitialState()
The `getInitialState` function initializes any fields that require a value on creation. Such values include, default values and calculated fields. This function has access to state that has been supplied during initializtion, and therefore `this` will be able to refer to the state.
#####name
`name` is a simple field descriptor. It defines a getter and setter. The getter returns state that resides in the state's property of the same name. The setter uses the passed in value to transition to the model to the next state, by passing the value, as an object to the setState function. This will then notify any ViewModels that have registered a stateChangeHandler with this model.
#####age
`age` is a calculated field. It is set by setting `dob`. `dob` uses the calculateAge function to set the value of age and passes both the dob and age values to setState. Please note that `age` needed to be initialized in the getInitialState() function.

### Create a ViewModel

```javascript
var PersonsViewModel = IMVVM.createViewModel({

  getInitialState: function(){
    var nextState = {};
    nextState.collection = DataService.getData().map(function(person, idx){
      if (idx === 0){
        nextState.selectedPerson = this.Person(person, true);
        return nextState.selectedPerson;
      }
      return this.Person(person, true);
    }.bind(this));
    return nextState;
  },

  getWatchedState: function() {
    return {
      'hobbies': {
        alias: 'hobbiesContext',
      },
      'online': {
        alias: 'imOnline'
      }
    }
  },

  imOnline: {
    kind:'pseudo',
    get: function(){
      return this.state.imOnline;
    }
  },
  
  selectedPerson: {
    kind: 'instance',
    get: function() { return this.state.selectedPerson; }
  },

  collection: {
    kind: 'array',
    get: function(){ return this.state.collection; },
  },

  personStateChangedHandler: function(nextState, prevState){
    var persons = {};
    persons.collection = this.collection.map(function(person){
      if(person.id === nextState.id){
        persons.selectedPerson = this.Person(nextState);
        return persons.selectedPerson;
      }
      return person;
    }.bind(this));

    this.setState(persons);
  },

  Person: function(personState, init){
    return new PersonModel(this.personStateChangedHandler)(personState, init);
  },

  selectedHobby: {
    kind: 'pseudo',
    get: function() {
      return this.state.hobbiesContext.current ? this.state.hobbiesContext.current.name: void(0); 
    }
  },

  selectPerson: function(id){
    for (var i = this.collection.length - 1; i >= 0; i--) {
      if(this.selectedPerson.id !== id && this.collection[i].id === id){
        this.setState({ selectedPerson: this.collection[i] });
        break;
      }
    };
  },

  addPerson: function(value){
    var nextState = {};
    var name;

    if(value && value.length > 0){
      name = value.split(' ');
      nextState.selectedPerson = this.Person({
        firstName: name[0],
        lastName: name.slice(1).join(' ')
      }, true);
      nextState.collection = this.collection.slice(0);
      nextState.collection = nextState.collection.concat(nextState.selectedPerson);
      this.setState(nextState);
    }
  },

  deletePerson: function(uid){
    var nextState = {};
    nextState.collection = this.collection.filter(function(person){
      return person.id !== uid;
    });
    nextState.selectedPerson = void(0);
    if(nextState.collection.length > 0){
      if (this.selectedPerson.id === uid){
        nextState.selectedPerson = this.Person(nextState.collection[0]);
      } else {
        nextState.selectedPerson = this.Person(this.selectedPerson);
      }
    }
    this.setState(nextState);
  },
});

```
#####getInitialState()
The `getInitialState` function initializes any fields that require a value and
initialize models to establish the data for the Viewmodel. Unlike Models, the ViewModel does not have access to `state`.
#####getWatchedState()
The `getWatchedState` function establises links between ViewModels. What is happening in this instance, is that we are watching the hobbies data context and refering to it, within this viewModel, with the alias of hobbiesContext. So we are then able to refer to is from teh state object as `this.state.hobbiesContext...`. Enabling us to display fields from other ViewModels and also update thier values.

We can also reference fields from the DomainViewModel. We simply specify the field name and supply an alias. Then it can be refered to within the state object.
#####imOnline
The `imOnline` field is referencing the linked DomainModel field `online` with the alias of `imOnline`. It is simply forwarding the online value it recieves from the DomainViewModel to the View and has no influence over its output. It is for this reason that the field descriptor has a `kind` decorator of `pseudo`. Any field that obtains its value from elsewhere, should be flagged with the decorator `kind:'pseudo'`, unless it is an `instance` or `array`.
#####selectedPerson
`selectedPerson` is another field that has a `kind` decorator. The `selectedPerson` field is of kind `instance`. Which simply means that it will return a model instance.

#####collection
`collection` has a `kind` decorator of `array`. Yes, you guessed it, because it returns an array.

_The reason that the kindd decorator is used is because IMVVM does some extra processing with these types._ 

#####personStateChangedHandler
`personStateChangedHandler` will be invoked anytime `setState` is called within the model that it is registered with. This function processes the change in the ViewModel and notifies the DomainModel so that the DomainModel can transition to the next state.

#####Person
`Person` is a wrapper around the `PersonModel` constructor. It makes `PersonModel` easier to invoke and acts like a factory of sorts. The parameters passed to `Person` are passed directly to the `PersonModel` constructor, but not before registering the stateChangedHandler `personStateChangedHandler`, to ensure that all state changes in PersonModel and handled approapriately.

#####selectPerson
#####addPerson
#####deletePerson
These functions are exposed to the View and enaable tasks to be performed in the ViewModel. However, most interactions will occur via the `selectedPerson` which exposes the model instance to the View.

I've added a snippet of HobbiesViewModel, from the example application to explain a little more about `getWatchedState`.

__HobbiesViewModel snippet__

```javascript
var HobbiesViewModel = IMVVM.createViewModel({

  getWatchedState: function() {
    return {
      'persons': {
        alias: 'personsContext',
        fields: {
          'selectedPerson': this.onPersonChangedHandler
        }
      },
      'busy': {
        alias: 'busy'
      }
    }
  },

  onPersonChangedHandler: function(nextState, prevState, field, context){
    if(this.current !== void(0) && context === 'persons' &&
      nextState.id !== prevState.id){
      return { hobbies: { current: void(0) }, busy: false };
    }
  },
  
  ...

  selectHobby: function(id){
    for (var i = this.hobbies.length - 1; i >= 0; i--) {
      if ((this.current === void(0) || this.current.id !== id) && this.hobbies[i].id === id){
        
        this.setState({current: this.Hobby(this.hobbies[i])}, {busy: true});
        
        /*
          //OR use a callback
          this.setState({current: this.Hobby(this.hobbies[i])}, function(){
            this.setState(void(0), {busy: true});
          }.bind(this));
        */

        break;
      }
    };
  },

  ...

  });
```

#####getWatchedState()
Notice in this instance of the `getWatchedState` function the `persons` object has an extra property called fields. This specifies that we are not only linking to the `persons` data context, but we would also like to be notified when `persons.selectedPerson` changes, and if it does change trigger the `onPersonChanged` handler.

#####onPersonChangedHandler
`onPersonChangedHandler` will be triggered whenever any of the fields that it is assigned to changes. It is important to note that, if there is a change a state object is returned. If there is no change, return either void(0) or don't return anything. It should also be noted that the returned state object has a property with the data context, `hobbies`, and the associated object next state. This is necessary so that any data context or domain property can be updated from this ViewModel by simply specfying it in the returned object.

#####selectHobby
The `selectHobby` function is nothing special. What is different about it is the 'setState' function. ViewModels get an extra parameter, which enables the ViewModel to update state in other data contexts. The second parameter takes a state object, not dissimilar to the state object that is returned from `onPersonChangedHandler`. The second parameter accepts an object that specifies the data context\domain property and associated state.

For instance `this.setState({current: this.Hobby(this.hobbies[i])}, {busy: true});`. The first parameter is the next state for `hobbies` data context, the second parameter specifies that `busy`, in the domain data context shold be changed to `true`. This second parameter also accepts `{person: {selectedPerson: firstName: 'Fred'}}`.

Also noted in the comments is that this can be achieved with a callback, ensuring to pass `void(0)` as the first parameter to `setState`.

***n.b. You may have noticed that not all fields have setters, however, the values are still able to be updated. This is what `setState` does. You only need to supply a setter if you would like the View to update the field directly.***

### Create a DomainViewModel
```javascript
var DomainViewModel = IMVVM.createDomainViewModel({

  getInitialState: function(){
    return {
      online: true,
      busy: false
    };
  },

  persons: {
    viewModel: PersonsViewModel,
    get: function(){
      return this.state.persons;
    }
  },

  hobbies: {
    viewModel: HobbiesViewModel,
    get: function(){
      return this.state.hobbies;
    }
  },

  personCount: {
    kind:'pseudo',
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
#####getInitialState()
The 'getInitialState' is the same as for the ViewModel.
#####persons
The `persons` property is setting up a data context called 'persons'. It has a special decorator called `viewModel` which specifies which ViewModel is associated to this data context.

### Hook up the View
Once you have created your Models. ViewModels and DomainViewModel, you're ready to hook it up the the View. All you need to do is specify the mixin and IMVVM will attach a `domainDataContext` to the state object that will be kept in sync with you're ViewModel.

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

The 'domainDataContext' has all the properties that were specified in the DomainViewModel. So this 'domainDataContext' will have the following properties:
- busy
- online
- personCount
- persons (dataContext)
  + imOnline
  + selectedPerson
    * [model properties and functions...]
  + collection
  + selectedHobby
  + selectPerson
  + addPerson
  + deletePerson
- hobbies (dataContext)
  + [viewmodel properties and functions...]

### Render the View

Then you just render the View, specifying a `domainModel` prop, that references the 'DomainViewModel'.
```javascript
React.renderComponent(<ApplicationView domainModel={DomainViewModel}/>,
  document.getElementById('container'));
```

***A word on how to use the exposed Model -> selectedPerson***
As mentioned above, the `PersonsViewModel` has a `persons` data context. This data context exposes a `Person` model instance via the `selectedPerson` property.

To update the `Person` instance, simply assign values to the associated properties on the `selectedPerson` property.

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
#####function createDomainViewModel(object specification)
Creates a DomainViewModel object.

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
#####void setState(object nextState[, oject nextDomainState, function callback])
Transition Data Context to the next state.

*parameters*

__nextState__
Object containing the next state values.

__nextDomainState__ ***n.b. This parameter is only available in ViewModels***
Object containing the next state values which are to be passed to the Domain Data Context.

___example___
```javascript
//From PersonsViewModel
{ 
  hobbies: { current: void(0) }, 
  busy: false
}
```
__callback__
Used to do sequential setState calls.

_Available in:_ DomainViewModel, ViewModel, Model
___
#####object extend(object currentState[, object... nextState])
Creates a shallow copy of currentState. Adds/replaces properties with properties of subsequent objects.

*parameters*

__currentState__
Old state object.

__nextState__
Next state objects.

_Available in:_ DomainViewModel, ViewModel, Model

####Properties
___
#####state
Holds object state.

_Available in:_ DomainViewModel, ViewModel, Model
___
#####previousState
Holds Domain Data Context previous state.

_Available in:_ DomainViewModel

###Specification
####Functions
___
#####object getInitialState()
Called when initalized in order to initialize state. Returns a state object;

_Available in:_ DomainViewModel, ViewModel, Model

_Optional:_ true

___
#####object getWatchedState()
Provides watched items to domain. Returns a WatchedState object definition.

######Watching ViewModel state
dataContext\: \{
  [alias]\: preferredName,
  [fields]\: \{
    dataContextField\: ViewModelStateChangedHandler
  \}
\}

######Watching DomainViewModel state
field\: \{
  alias\: preferredName
\}

___example___
```javascript
  getWatchedState: function() {
    return {
      'persons': {
        alias: 'personsContext',
        fields: {
          'selected': this.onPersonChange
        }
      },
      'busy': {
        alias: 'busy'
      }
    }
  },
```

_Available in:_ ViewModel

_Optional:_ true

___
#####object ViewModelStateChangedHandler(object nextState, object previousState, string field, string dataContext)

*arguments*

__nextState__
Next state of the watched field.

__previousState__
Previous state of the watched field.

__field__
Watched field name.

__dataContext__
Watched Data Context name.

___example___
```javascript
  onPersonChange: function(nextState, prevState, field, context){
    if(this.current !== void(0) && context === 'persons' &&
      nextState.id !== prevState.id){
      return { hobbies: { current: void(0) }, busy: false };
    }
  }
```

_Available in:_ ViewModel

___
#####void ModelStateChangedHandler(object nextState,object previousState[, function callback])

*arguments*

__nextState__
Next state of the model.

__previousState__
Previous state of the model.

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

___

#####ModelInstance Model([function stateChangedHandler])([object nextState, boolean initialize])
Returns a new model instance. This function is usually wrapped in another function for easier usage. __n.b. This is suggested usage and not part of the API__

__Usage example__

######ModelInstance ModelFactory(object nextState[, boolean initialize:false])

```javascript
  Person: function(person, init){
    return new PersonModel(this.personStateChangedHandler)(person, init);
  },
```

*parameters*
__stateChangedHandler__
State changed handler which is triggered whenever setState is called from within the model. 

__nextState__
Object containing the next state values for the model.

__initialize__
Boolean value indicating the model instance should be initialized. (Calls getInitialState())

_Available in:_ ViewModel, Model

####Field
___
#####fieldName : [Descriptor](#descriptor)

_Available in:_ DomainViewModel, ViewModel, Model

___

####Descriptor
___
#####Functions
######get()

_Available in:_ DomainViewModel, ViewModel, Model

######void set(newValue)

_Available in:_ DomainViewModel, ViewModel, Model

#####Decorators

######kind: ['instance' || 'array' || 'pseudo']
**instance**
Specifies that the getter returns a model instance.

**array**
Specifies that the field holds an array.

**pseudo**
Specifies that the value for this field is obtained from other properties.

_Available in:_ DomainViewModel, ViewModel, Model

######viewModel: ViewModel Class
**viewModel**
Identifies the ViewModel to be used for the defined data context.

_Available in:_ DomainViewModel

###Mixin
####mixin
___
#####mixins: [IMVVM.mixin]

Adds domainDataContext to state object.

```javascript
var ApplicationView = React.createClass({
  mixins: [IMVVM.mixin],
  render: function(){
    return <DetailsView appContext={this.state.domainDataContext} />;    
  }
});
```

####props
#####domainModel= DomainViewModel Class
#####[enableUndo]= boolean: default = false

**Point the View to the DomainViewModel.**
```javascript
React.renderComponent(<ApplicationView domainModel={DomainViewModel}/>,
  document.getElementById('container'));
```

## Browser Support
Most ECMAScript 5 compliant browsers. 
__IE8 and below are not supported.__

## Author
Entrendipity  - [Follow @entrendipity](https://twitter.com/intent/follow?screen_name=entrendipity)

Frank Panetta  - [Follow @fattenap](https://twitter.com/intent/follow?screen_name=fattenap)

##License
###The MIT License (MIT)

Copyright (c) 2014 Entrendipity

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.