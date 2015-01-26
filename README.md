Astarisx
=====

Highly Composable MVVM Application Architecture for [React](http://facebook.github.io/react/).

[![Build Status]](https://travis-ci.org/entrendipity/astarisx)
[![Coverage Status]](https://coveralls.io/r/entrendipity/astarisx?branch=master)
[![License]](https://github.com/entrendipity/astarisx/blob/master/LICENSE)

#### [Astarisx Website and Documentation](http://entrendipity.github.io/astarisx/)

## Why Astarisx?

### More Productive
Astarisx was inspired by <a href="http://facebook.github.io/react/">React</a>. So it feels like React. There's no need to change your coding style to suit the framework, making it easy to comprehend and quick to learn. It helps seperate concerns with an approach that is intuitive and fluid and was designed with maintainability in mind. Astarisx reduces the complexity of applying incremental enhancements as your application evolves.

### Highly Composable UI Components
Astarisx View's are stateless and completely decoupled from their Owner Component, making them highly composable. Without changing a line of code, Astarisx Views can be moved anywhere within your application. A View can even be completely removed without breaking your application. Teams can work independently of one another with the confidence that their work will easily integrate into the larger application.

### Single Source of Truth
State is presented to Views as a single data model. It is the Single Source of Truth (SSoT). The SSoT is the Application's Data Context and is accessible from anywhere within the application. Communicating between components is no longer an issue, as every component has knowledge of the entire Application's state at any one time. You are guaranteed to have the latest copy of the Application's state when and where you need it.

### Built in PushState Router
Astarisx comes with an optional pushState router out of the box and reduces the complexity in integrating client-side pushState routing into your application. Routing configuration and logic is moved out of the View and into the Business Logic Layer where it belongs. Astarisx uses [Page](http://visionmedia.github.io/page.js/), a micro client-side router inspired by the Express router, written by TJ Holowaychuk the creator of Express, amongst other things.

### MediaQueryList Notifications
Astarisx is able to receive MediaQueryList Notifications within JavaScript. So as screen size or orientation changes, the application can be notified and respond to it from within your JavaScript code. This may be handy, for example, if you would like to make an ajax request based on a screen's orientation. You could even do some, or all, of your Responsive Design in JavaScript rather than in CSS.

### Accelerated Animation
Easily incorporate super smooth page transitions into your application with [AstarisxAnimate](https://github.com/entrendipity/astarisx-animate) mixin. AstarisxAnimate uses Velocity, an accelerated JavaScript animation library. Use pre-defined transitions or create your own. Harness the full potential of [Velocity](http://julian.com/research/velocity/) to add some flare to your application.

## Usage
Astarisx can be loaded as:

-   standalone. `Astarisx` is exposed as a global variable

```javscript
 <script src="astarisx.min.js"></script>
```

-   a Node.js module

```
$ npm install astarisx
```

-   a Bower module

```
$ bower install astarisx
```

-   a RequireJS module

```
require(['./astarisx.min.js'], function (Astarisx) {
    // Do something with Astarisx
});
```

#### [Astarisx Website and Documentation](http://entrendipity.github.io/astarisx/)

## Author
Frank Panetta  - [Follow @fattenap](https://twitter.com/intent/follow?screen_name=fattenap)

##License
###The MIT License (MIT)

Copyright (c) 2014-2015 Entrendipity Pty Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[Build Status]: https://travis-ci.org/entrendipity/astarisx.svg?branch=master
[License]: http://img.shields.io/npm/l/mochify.svg
[Coverage Status]: https://coveralls.io/repos/entrendipity/astarisx/badge.svg?branch=master

