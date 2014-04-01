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

  firstName: {
    get: function(){ return this.state.firstName; },
    set: function(newValue){
      this.setState({'firstName': newValue});
    }
  },

  lastName: {
    get: function(){ return this.state.lastName; },
    set: function(newValue){
      this.setState({'lastName': newValue});
    }
  },
  
  gender: {
    get: function(){ return this.state.gender; },
    set: function(newValue){
      this.setState({'gender': newValue});
    }
  },

});
```


### Create a ViewModel
### Create a DomainModel
### Hook up the View
## API
## Browser Support
## Author

Frank Panetta  - [Follow @fattenap](https://twitter.com/intent/follow?screen_name=fattenap)

##License
###The MIT License (MIT)

Copyright (c) 2014 Entrendipity

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.