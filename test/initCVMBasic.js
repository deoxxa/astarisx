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

  describe('check existance of keys', function(){
    
    it('React Component state object must have "appContext"', function(){
      app.state.must.have.keys(['appContext']);
      app.state.appContext.must.be.an.object();
    });
    
    it('"appContext" must have nonenumerable "$state"', function(){
      app.state.appContext.must.have.nonenumerable('$state');
      app.state.appContext.$state.must.be.an.object();
      app.state.appContext.must.not.have.nonenumerable('$canAdvance');
      app.state.appContext.must.not.have.nonenumerable('$canRevert');
      app.state.appContext.must.not.have.nonenumerable('$previousState');
      app.state.appContext.must.not.have.nonenumerable('$nextState');
      //revert and advance must be available for adhoc undo
      app.state.appContext.revert.must.be.a.function();
      app.state.appContext.advance.must.be.a.function();
      app.state.appContext.setState.must.be.a.function();
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

  describe('check existance of undo keys', function(){
    
    it('appContext keys & nonenumerables & functions', function(){
      app.state.appContext.must.have.nonenumerable('$canAdvance');
      app.state.appContext.must.have.nonenumerable('$canRevert');
      app.state.appContext.advance.must.be.a.function()
      app.state.appContext.revert.must.be.a.function();
      app.state.appContext.setState.must.be.a.function();
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

  describe('check existance of routing keys', function(){
    
    it('appContext keys & nonenumerables & functions', function(){
      app.state.appContext.must.have.nonenumerable('$canAdvance');
      app.state.appContext.must.have.nonenumerable('$canRevert');
      app.state.appContext.must.have.nonenumerable('$forceReplace');
      app.state.appContext.must.have.nonenumerable('$pageNotFound');
      app.state.appContext.must.have.nonenumerable('$previousState');
      app.state.appContext.must.have.ownKeys(['$path', '$pushState']);
      app.state.appContext.advance.must.be.a.function()
      app.state.appContext.revert.must.be.a.function();
      app.state.appContext.setState.must.be.a.function();
      
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

});

describe('Initialize ControllerViewModel with fields & dataContexts', function(){
  var stateMgr;
  var app;
  before(function() {

    var ControllerViewModel = Astarisx.createControllerViewModelClass({
      mixins:[require('../refImpl/mixinViewModels')],
      getInitialState: function(){
        return {
          online: true,
          busy: false,
        };
      },
      busy: {
        get: function(){
          return this.$state.busy;
        },
      },
      online: {
        get: function(){
          return this.$state.online;
        },
        set: function(newValue){
          this.setState({'online': newValue });
        }
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
    });

  });

  after(function(){
    stateMgr.dispose();
  });

  describe('check existance of dataContexts', function(){
    
    it('appContext must contain "persons" and "hobbies" keys', function(){
      app.state.appContext.must.have.ownKeys(['persons', 'hobbies','online', 'busy']);
    });
    
    it('appContext keys initialization', function(){
      app.state.appContext.persons.must.be.an.object();
      app.state.appContext.hobbies.must.be.an.object();
      app.state.appContext.online.must.be.true();
      app.state.appContext.busy.must.be.false();
    });

    it('"persons" must have nonenumerable "$state"', function(){
      app.state.appContext.$state.persons.must.have.nonenumerable('$state');
    });

    it('"hobbies" must have nonenumerable "$state"', function(){
      app.state.appContext.$state.hobbies.must.have.nonenumerable('$state');
    });

    it('"persons" must have nonenumerable "$dataContext" equal to "persons"', function(){
      app.state.appContext.$state.persons.must.have.nonenumerable('$dataContext');
      app.state.appContext.$state.persons.$dataContext.must.equal('persons');
    });

    it('"hobbies" must have nonenumerable "$dataContext" equal to "hobbies"', function(){
      app.state.appContext.$state.hobbies.must.have.nonenumerable('$dataContext');
      app.state.appContext.$state.hobbies.$dataContext.must.equal('hobbies');
    });

    it('"persons" must have setState', function(){
      app.state.appContext.$state.persons.setState.must.be.a.function();
    });

    it('"hobbies" must have setState', function(){
      app.state.appContext.$state.hobbies.setState.must.be.a.function();
    });    
  });

});