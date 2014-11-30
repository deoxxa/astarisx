var React = require('react');
require('react/addons');
var TU = React.addons.TestUtils;
var expect = require('must');
var Astarisx = require('../src/core');
var StateManager = require('../src/stateManager');

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

var app = TU.renderIntoDocument(React.createElement(UI));

describe('ControllerViewModel with fields & dataContexts', function(){
  var stateMgr;
  before(function() {
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