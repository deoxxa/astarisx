var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');

describe('Initialize ControllerViewModel with no options', function(){
  var stateMgr;
  var app;
  before(function() {
    var ControllerViewModel = Astarisx.createControllerViewModelClass({
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
    });
  })
  after(function(){
    stateMgr.dispose();
  })

  describe('check existance of properties', function(){
    it('App Component state must have appContext', function(){
      app.state.must.have.keys(['appContext']);
      app.state.appContext.must.be.an.object();
    })
    it('appContext must have nonenumerable "$state" prop', function(){
      app.state.appContext.must.have.nonenumerable('$state');
      app.state.appContext.$state.must.be.an.object();
    })
  });

})

describe('Initialize ControllerViewModel with enableUndo=true', function(){
  var stateMgr;
  var app;
  before(function() {

    var ControllerViewModel = Astarisx.createControllerViewModelClass({
    });

    var UI = React.createClass({
      mixins: [Astarisx.mixin.ui],
      render: function(){
        return React.createElement('div');
      }
    });

    app = TU.renderIntoDocument(React.createElement(UI));
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel,
      enableUndo: true
    });
  })
  after(function(){
    stateMgr.dispose();
  })

  describe('check existance of undo properties', function(){
    it('appContext keys & nonenumerables & functions', function(){
      app.state.appContext.must.have.nonenumerable('$canAdvance');
      app.state.appContext.must.have.nonenumerable('$canRevert');
      app.state.appContext.advance.must.be.a.function()
      app.state.appContext.revert.must.be.a.function();
    })
  });
})

describe('Initialize ControllerViewModel with enableRouting=true', function(){
  var stateMgr;
  var app;
  before(function() {

    var ControllerViewModel = Astarisx.createControllerViewModelClass({
    });

    var UI = React.createClass({
      mixins: [Astarisx.mixin.ui],
      render: function(){
        return React.createElement('div');
      }
    });

    app = TU.renderIntoDocument(React.createElement(UI));
    stateMgr = new StateManager(app, {
      controllerViewModel: ControllerViewModel,
      enableRouting: true
    });
  })
  after(function(){
    stateMgr.dispose();
  })

  describe('check existance of routing properties', function(){
    it('appContext keys & nonenumerables & functions', function(){
      app.state.appContext.must.have.nonenumerable('$canAdvance');
      app.state.appContext.must.have.nonenumerable('$canRevert');
      app.state.appContext.must.have.nonenumerable('$forceReplace');
      app.state.appContext.must.have.nonenumerable('$pageNotFound');
      app.state.appContext.must.have.ownKeys(['$path', '$pushState']);
      app.state.appContext.must.have.ownProperty('$pushState', true);
      app.state.appContext.advance.must.be.a.function()
      app.state.appContext.revert.must.be.a.function();
    })
  });
})