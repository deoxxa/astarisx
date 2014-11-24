var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');

describe('Initialize all dataContexts without initCtxObj', function(){
  var stateMgr;
  var app;
  before(function() {

    var ControllerViewModel = Astarisx.createControllerViewModelClass({
      mixins:[require('../refImpl/mixinViewModels')],
      dataContextWillInitialize: function(){
        this.initializeDataContext('*');
      }
    });

    var UI = React.createClass({
      mixins: [Astarisx.mixin.ui],
      render: function(){
        return React.createElement('div');
      }
    });

    app = TU.renderIntoDocument(React.createElement(UI));
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    }/*, initCtxObj*/);

  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('App Component state have key appContext', function(){
      app.state.must.have.keys(['appContext']);
    })
    it('appContext must have nonenumerable "$state"', function(){
      app.state.appContext.must.have.nonenumerable('$state');
    })
    it('appContext must have keys "persons" and "hobbies"', function(){
      app.state.appContext.must.have.ownKeys(['persons', 'hobbies']);
    })
    it('persons.collection must contain 3 people', function(){
      app.state.appContext.persons.collection.must.have.length(3);
    })
    it('Frank must have 3 hobbies', function(){
      app.state.appContext.persons.collection[0].hobbies.must.have.length(3);
    })
  });
})

describe('Initialize all dataContexts with initCtxObj', function(){
  var stateMgr;
  var app;
  before(function() {

    var ControllerViewModel = Astarisx.createControllerViewModelClass({
      mixins:[require('../refImpl/mixinViewModels')],
      dataContextWillInitialize: function(initCtxObj){
        this.initializeDataContext(initCtxObj);
      }
    });

    var UI = React.createClass({
      mixins: [Astarisx.mixin.ui],
      render: function(){
        return React.createElement('div');
      }
    });

    app = TU.renderIntoDocument(React.createElement(UI));
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel
    },{
       "persons": void(0) //[
        // this.props.user,
        // { "authenticated": this.props.authenticated, "authorized": true}
      // ] //args
    });

  })
  after(function(){
    stateMgr.dispose();
  })
  describe('appContext', function(){
    it('App Component state have key appContext', function(){
      app.state.must.have.keys(['appContext']);
    })
    it('appContext must have nonenumerable "$state"', function(){
      app.state.appContext.must.have.nonenumerable('$state');
    })
    it('appContext must have keys "persons" and "hobbies"', function(){
      app.state.appContext.must.have.ownKeys(['persons', 'hobbies']);
    })
    it('persons.collection must contain 3 people', function(){
      app.state.appContext.persons.collection.must.have.length(3);
    })
    it('Frank must contain 3 hobbies', function(){
      app.state.appContext.persons.collection[0].hobbies.must.have.length(3);
    })
  });
})