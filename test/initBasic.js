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
  });
  
  after(function(){
    stateMgr.dispose();
  });

  describe('check existance of properties', function(){
    
    it('React Component state object must have "appContext"', function(){
      app.state.must.have.keys(['appContext']);
      app.state.appContext.must.be.an.object();
    });
    
    it('"appContext" must have nonenumerable "$state"', function(){
      app.state.appContext.must.have.nonenumerable('$state');
      app.state.appContext.$state.must.be.an.object();
      app.state.appContext.must.not.have.nonenumerable('$canAdvance');
      app.state.appContext.must.have.not.nonenumerable('$canRevert');
      app.state.appContext.must.not.have.nonenumerable('$previousState');
      app.state.appContext.must.not.have.nonenumerable('$nextState');
      expect(app.state.appContext.advance).be.undefined();
      expect(app.state.appContext.revert).be.undefined();
    });
  });

});

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
  });

  after(function(){
    stateMgr.dispose();
  });

  describe('check existance of undo properties', function(){
    
    it('appContext keys & nonenumerables & functions', function(){
      app.state.appContext.must.have.nonenumerable('$canAdvance');
      app.state.appContext.must.have.nonenumerable('$canRevert');
      app.state.appContext.advance.must.be.a.function()
      app.state.appContext.revert.must.be.a.function();
    });
    
    it('"$canAdvance" must initialize to false', function(){
      app.state.appContext.$canAdvance.must.be.false();
    });
    
    it('"$canRevert" must initialize to false', function(){
      app.state.appContext.$canRevert.must.be.false();
    });
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

  });

  after(function(){
    stateMgr.dispose();
  });

  describe('check existance of routing properties', function(){
    
    it('appContext keys & nonenumerables & functions', function(){
      app.state.appContext.must.have.nonenumerable('$canAdvance');
      app.state.appContext.must.have.nonenumerable('$canRevert');
      app.state.appContext.must.have.nonenumerable('$forceReplace');
      app.state.appContext.must.have.nonenumerable('$pageNotFound');
      app.state.appContext.must.have.nonenumerable('$previousState');
      app.state.appContext.must.have.ownKeys(['$path', '$pushState']);
      app.state.appContext.advance.must.be.a.function()
      app.state.appContext.revert.must.be.a.function();
      
    });

    it('"$canAdvance" must initialize to false', function(){
      app.state.appContext.$canAdvance.must.be.false();
    });
    
    it('"$canRevert" must initialize to true', function(){
      app.state.appContext.$canRevert.must.be.true();
    });
    
    it('"$previousState.$canRevert" must initialize to false', function(){
      app.state.appContext.$previousState.$canRevert.must.be.false();
    });    
    
    it('"appContext.$state" must have Object $dataContextWillUpdate', function(){
      app.state.appContext.$state.$dataContextWillUpdate.must.be.an.object();
      app.state.appContext.$state.$dataContextWillUpdate.must.have.ownProperty('$pageNotFound', true);
    });
    
    it('"$forceReplace" must initialize to false', function(){
      app.state.appContext.$forceReplace.must.be.false();
    });
    
    it('"$pageNotFound" must initialize to false', function(){
      app.state.appContext.$pageNotFound.must.be.true();
    });
    
    it('"$pushState" must initialize to true', function(){
      app.state.appContext.$pushState.must.be.true();
    });
    
    it('"$path" must initialize to "/"', function(){
      app.state.appContext.$path.must.equal("/");
    });

  });
})